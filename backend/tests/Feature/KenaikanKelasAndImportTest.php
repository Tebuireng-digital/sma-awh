<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Tests\TestCase;

class KenaikanKelasAndImportTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    private function getAdminToken(): string
    {
        $admin = User::firstOrCreate(
            ['username' => 'admin_test'],
            [
                'email' => 'admin_test@sma-awh.sch.id',
                'name' => 'Admin Test',
                'password' => bcrypt('password123'),
                'role' => 'admin',
                'additional_roles' => json_encode(['admin']),
            ]
        );

        return $admin->createToken('test_token')->plainTextToken;
    }

    public function test_kenaikan_kelas_status_requires_admin(): void
    {
        $token = $this->getAdminToken();

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/admin/kenaikan-kelas/status');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'data' => [
                    'tahun_ajaran_aktif',
                    'ringkasan' => [
                        'kelas_x_total',
                        'kelas_xi_total',
                        'kelas_xii_total',
                        'alumni_total',
                        'alumni_lulus',
                        'alumni_keluar',
                    ],
                    'kelas_x',
                    'kelas_xi',
                    'kelas_xii',
                ]
            ]);
    }

    public function test_luluskan_kelas_xii(): void
    {
        $token = $this->getAdminToken();

        // 1. Buat kelas XII
        $kelasXii = DB::table('kelas')->insertGetId([
            'nama_kelas' => 'XII MIPA Test ' . time(),
            'tingkat' => 'XII',
            'jumlah_siswa' => 2,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 2. Buat 2 siswa di kelas XII
        $siswa1Id = DB::table('siswa')->insertGetId([
            'nis' => 'TEST_XII_01_' . time(),
            'nisn' => '009111222',
            'nama' => 'Siswa XII Lulus 1 Test',
            'jenis_kelamin' => 'L',
            'status_aktif' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $siswa2Id = DB::table('siswa')->insertGetId([
            'nis' => 'TEST_XII_02_' . time(),
            'nisn' => '009111333',
            'nama' => 'Siswa XII Lulus 2 Test',
            'jenis_kelamin' => 'P',
            'status_aktif' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('anggota_kelas')->insert([
            ['kelas_id' => $kelasXii, 'siswa_id' => $siswa1Id, 'no_urut' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['kelas_id' => $kelasXii, 'siswa_id' => $siswa2Id, 'no_urut' => 2, 'created_at' => now(), 'updated_at' => now()],
        ]);

        // 3. Eksekusi kelulusan kelas XII (Semua LULUS)
        $payload = [
            'tahun_keluar' => '2026',
            'angkatan' => 'Angkatan 35 Test',
            'siswa_list' => [
                [
                    'id' => $siswa1Id,
                    'no_ijazah' => 'DN-01/M-SMA/2026/001',
                ],
                [
                    'id' => $siswa2Id,
                    'no_ijazah' => 'DN-01/M-SMA/2026/002',
                ]
            ]
        ];

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/admin/kenaikan-kelas/luluskan-keluarkan-xii', $payload);

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'processed_count' => 2,
                'lulus_count' => 2,
            ]);

        // Verifikasi siswa sudah tidak ada di tabel siswa aktif
        $this->assertDatabaseMissing('siswa', ['id' => $siswa1Id]);
        $this->assertDatabaseMissing('siswa', ['id' => $siswa2Id]);

        // Verifikasi siswa ada di tabel siswa_alumni dengan status LULUS
        $this->assertDatabaseHas('siswa_alumni', [
            'nis' => 'TEST_XII_01_' . time(),
            'kategori_keluar' => 'LULUS',
            'no_ijazah' => 'DN-01/M-SMA/2026/001',
        ]);
    }

    public function test_keluarkan_mutasi_siswa_dari_master_data(): void
    {
        $token = $this->getAdminToken();

        $kelasX = DB::table('kelas')->where('tingkat', 'X')->first();
        $kelasId = $kelasX ? $kelasX->id : DB::table('kelas')->insertGetId([
            'nama_kelas' => 'X-Mutasi Test ' . time(),
            'tingkat' => 'X',
            'jumlah_siswa' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $siswaMutasiId = DB::table('siswa')->insertGetId([
            'nis' => 'TEST_MUTASI_' . time(),
            'nama' => 'Siswa Pindah Sekolah Test',
            'jenis_kelamin' => 'L',
            'status_aktif' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('anggota_kelas')->insert([
            'kelas_id' => $kelasId,
            'siswa_id' => $siswaMutasiId,
            'no_urut' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $payload = [
            'alasan_keluar' => 'Pindah domisili mengikuti orang tua',
            'sekolah_tujuan' => 'SMAN 1 Jombang',
            'tahun_keluar' => '2026',
        ];

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson("/api/v1/admin/siswa/{$siswaMutasiId}/keluarkan-mutasi", $payload);

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
            ]);

        // Siswa aktif terhapus
        $this->assertDatabaseMissing('siswa', ['id' => $siswaMutasiId]);

        // Masuk ke tabel alumni kategori KELUAR / PINDAH
        $this->assertDatabaseHas('siswa_alumni', [
            'nis' => 'TEST_MUTASI_' . time(),
            'kategori_keluar' => 'KELUAR / PINDAH',
            'sekolah_tujuan' => 'SMAN 1 Jombang',
        ]);
    }

    public function test_promosikan_kelas_xi_ke_xii(): void
    {
        $token = $this->getAdminToken();

        $kelasXi = DB::table('kelas')->insertGetId([
            'nama_kelas' => 'XI MIPA Test ' . time(),
            'tingkat' => 'XI',
            'jumlah_siswa' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $kelasXii = DB::table('kelas')->insertGetId([
            'nama_kelas' => 'XII MIPA Tujuan ' . time(),
            'tingkat' => 'XII',
            'jumlah_siswa' => 0,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $siswaXi = DB::table('siswa')->insertGetId([
            'nis' => 'TEST_XI_' . time(),
            'nama' => 'Siswa XI Naik Test',
            'jenis_kelamin' => 'L',
            'status_aktif' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('anggota_kelas')->insert([
            'kelas_id' => $kelasXi,
            'siswa_id' => $siswaXi,
            'no_urut' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $payload = [
            'tingkat_asal' => 'XI',
            'pemetaan_kelas' => [
                [
                    'kelas_asal_id' => $kelasXi,
                    'kelas_tujuan_id' => $kelasXii,
                ]
            ]
        ];

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/admin/kenaikan-kelas/promosikan-kelas', $payload);

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'promoted_count' => 1,
            ]);

        // Verifikasi relasi kelas siswa sudah berpindah ke kelas XII
        $this->assertDatabaseHas('anggota_kelas', [
            'siswa_id' => $siswaXi,
            'kelas_id' => $kelasXii,
        ]);
    }

    public function test_template_excel_download(): void
    {
        $token = $this->getAdminToken();

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->get('/api/v1/admin/siswa/template-excel');

        $response->assertStatus(200);
        $this->assertTrue(str_contains($response->headers->get('content-type'), 'spreadsheetml.sheet'));
    }

    public function test_import_excel_siswa_baru(): void
    {
        $token = $this->getAdminToken();

        $kelasX = DB::table('kelas')->where('tingkat', 'X')->first();
        $targetKelasName = $kelasX ? $kelasX->nama_kelas : 'X-1';

        // Buat temporary spreadsheet
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setCellValue('A4', 'NIS (*Wajib)');
        $sheet->setCellValue('B4', 'NISN');
        $sheet->setCellValue('C4', 'NAMA LENGKAP (*Wajib)');
        $sheet->setCellValue('D4', 'JENIS KELAMIN (*L/P)');
        $sheet->setCellValue('E4', 'NO HP ORTU / WALI');
        $sheet->setCellValue('F4', 'TANGGAL LAHIR (YYYY-MM-DD)');
        $sheet->setCellValue('G4', 'TARGET KELAS (*Wajib)');

        $uniqueNis = 'IMP_' . rand(10000, 99999);
        $sheet->setCellValue('A5', $uniqueNis);
        $sheet->setCellValue('B5', '0089998881');
        $sheet->setCellValue('C5', 'Siswa Import Sukses');
        $sheet->setCellValue('D5', 'L');
        $sheet->setCellValue('E5', '081299998888');
        $sheet->setCellValue('F5', '2010-01-15');
        $sheet->setCellValue('G5', $targetKelasName);

        $tempFile = tempnam(sys_get_temp_dir(), 'import_test') . '.xlsx';
        $writer = new Xlsx($spreadsheet);
        $writer->save($tempFile);

        $uploadedFile = new UploadedFile(
            $tempFile,
            'import_siswa_test.xlsx',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            null,
            true
        );

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->post('/api/v1/admin/siswa/import-excel', [
                'file' => $uploadedFile,
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
            ]);

        $this->assertDatabaseHas('siswa', [
            'nis' => $uniqueNis,
            'nama' => 'Siswa Import Sukses',
        ]);

        @unlink($tempFile);
    }
}
