<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class RaporValidationRulesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_admin_cannot_toggle_semester_when_classes_pending_validation()
    {
        $admin = User::where('role', 'admin')->first();
        if (!$admin) {
            $admin = User::factory()->create(['role' => 'admin']);
        }

        $response = $this->actingAs($admin)->postJson('/api/v1/admin/semester/toggle');

        // Harus 422 karena kelas belum tervalidasi penuh
        $response->assertStatus(422)
            ->assertJsonPath('status', 'error')
            ->assertJsonPath('can_toggle', false)
            ->assertJsonStructure([
                'status',
                'can_toggle',
                'message',
                'validation' => [
                    'can_proceed',
                    'ringkasan',
                    'kelas_pending'
                ]
            ]);
    }

    public function test_admin_cannot_update_tahun_ajaran_when_either_semester_not_validated()
    {
        $admin = User::where('role', 'admin')->first();
        if (!$admin) {
            $admin = User::factory()->create(['role' => 'admin']);
        }

        $response = $this->actingAs($admin)->postJson('/api/v1/admin/tahun-ajaran', [
            'tahun_ajaran' => '2027/2028'
        ]);

        // Harus 422 karena semester Ganjil dan/atau Genap belum tervalidasi penuh
        $response->assertStatus(422)
            ->assertJsonPath('status', 'error')
            ->assertJsonPath('can_change_year', false)
            ->assertJsonStructure([
                'status',
                'can_change_year',
                'message',
                'validation' => [
                    'can_proceed',
                    'semester_ganjil',
                    'semester_genap'
                ]
            ]);
    }

    public function test_admin_can_check_validation_status_endpoint()
    {
        $admin = User::where('role', 'admin')->first();
        if (!$admin) {
            $admin = User::factory()->create(['role' => 'admin']);
        }

        $response = $this->actingAs($admin)->getJson('/api/v1/admin/rapor-validation-status?mode=semester');

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonStructure([
                'status',
                'data' => [
                    'tahun_ajaran',
                    'semester',
                    'can_proceed',
                    'ringkasan',
                    'kelas_pending'
                ]
            ]);

        $responseFullYear = $this->actingAs($admin)->getJson('/api/v1/admin/rapor-validation-status?mode=full_year');

        $responseFullYear->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonStructure([
                'status',
                'data' => [
                    'tahun_ajaran',
                    'can_proceed',
                    'semester_ganjil',
                    'semester_genap'
                ]
            ]);
    }

    public function test_export_class_rapor_zip_returns_valid_zip_with_pdfs()
    {
        $admin = User::where('role', 'admin')->first();
        if (!$admin) {
            $admin = User::factory()->create(['role' => 'admin']);
        }

        $anggota = DB::table('anggota_kelas')->first();
        $kelasId = $anggota ? $anggota->kelas_id : DB::table('kelas')->value('id');

        $response = $this->actingAs($admin)->get('/api/v1/rapor-sts/export-zip?kelas_id=' . $kelasId);

        $response->assertStatus(200);
        $this->assertEquals('application/zip', $response->headers->get('content-type'));

        $tmpZip = tempnam(sys_get_temp_dir(), 'test_zip_');
        file_put_contents($tmpZip, $response->streamedContent());

        $zip = new \ZipArchive();
        $this->assertTrue($zip->open($tmpZip) === true);
        $this->assertGreaterThan(0, $zip->numFiles);

        for ($i = 0; $i < $zip->numFiles; $i++) {
            $name = $zip->getNameIndex($i);
            $this->assertStringEndsWith('.pdf', $name, "Entry {$name} must be a .pdf file");
            $stream = $zip->getStream($name);
            $header = fread($stream, 5);
            fclose($stream);
            $this->assertStringStartsWith('%PDF', $header, "File {$name} must be a valid PDF");
        }
        $zip->close();
        unlink($tmpZip);
    }

    public function test_wali_kelas_cannot_directly_cancel_validation_without_admin_approval()
    {
        $guru = User::where('role', 'guru')->first();
        if (!$guru) {
            $guru = User::factory()->create(['role' => 'guru', 'id_guru' => 1]);
        }

        $anggota = DB::table('anggota_kelas')->first();
        $siswaId = $anggota->siswa_id;

        // Set status rapor ke approved_by_walikelas
        DB::table('rapor_sts')->where('siswa_id', $siswaId)->update([
            'status_validasi' => 'approved_by_walikelas',
            'ttd_walikelas' => now(),
        ]);

        // Guru/wali kelas mencoba membatalkan validasi langsung
        $response = $this->actingAs($guru)->postJson("/api/v1/rapor-sts/{$siswaId}/cancel-validasi");

        $response->assertStatus(403)
            ->assertJsonPath('status', 'error')
            ->assertJsonPath('requires_admin_approval', true);

        // Pastikan status rapor tetap approved_by_walikelas
        $rapor = DB::table('rapor_sts')->where('siswa_id', $siswaId)->first();
        $this->assertEquals('approved_by_walikelas', $rapor->status_validasi);
    }

    public function test_wali_kelas_can_submit_unvalidation_request_and_admin_can_approve()
    {
        $admin = User::where('role', 'admin')->first();
        $guru = User::where('role', 'guru')->first();

        $anggota = DB::table('anggota_kelas')->first();
        $kelasId = $anggota->kelas_id;
        $siswaId = $anggota->siswa_id;

        // Pastikan guru terdaftar sebagai wali kelas
        DB::table('kelas')->where('id', $kelasId)->update(['id_guru_wali' => $guru->id_guru ?: 1]);

        DB::table('rapor_sts')->where('siswa_id', $siswaId)->update([
            'status_validasi' => 'approved_by_walikelas',
            'ttd_walikelas' => now(),
        ]);

        // 1. Wali kelas mengajukan permohonan pembatalan validasi
        $reqResponse = $this->actingAs($guru)->postJson('/api/v1/rapor-sts/request-cancel-validasi', [
            'kelas_id' => $kelasId,
            'siswa_id' => $siswaId,
            'alasan' => 'Terdapat perbaikan nilai mapel Fiqih dan catatan santri.',
        ]);

        $reqResponse->assertStatus(201)
            ->assertJsonPath('status', 'success');

        $requestId = $reqResponse->json('request_id');
        $this->assertDatabaseHas('rapor_pembatalan_validasi', [
            'id' => $requestId,
            'status' => 'pending',
        ]);

        // 2. Admin memeriksa daftar permohonan
        $listResponse = $this->actingAs($admin)->getJson('/api/v1/rapor-sts/unvalidation-requests?status=pending');
        $listResponse->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('pending_count', 1);

        // 3. Admin menyetujui permohonan pembatalan validasi
        $approveResponse = $this->actingAs($admin)->postJson("/api/v1/rapor-sts/unvalidation-requests/{$requestId}/approve", [
            'catatan_admin' => 'Disetujui. Silakan perbaiki nilai santri.',
        ]);

        $approveResponse->assertStatus(200)
            ->assertJsonPath('status', 'success');

        // Status permohonan menjadi approved
        $this->assertDatabaseHas('rapor_pembatalan_validasi', [
            'id' => $requestId,
            'status' => 'approved',
        ]);

        // Status rapor santri kembali ke draft
        $rapor = DB::table('rapor_sts')->where('siswa_id', $siswaId)->first();
        $this->assertEquals('draft', $rapor->status_validasi);
        $this->assertNull($rapor->ttd_walikelas);
    }

    public function test_student_cannot_access_rapor_pdf_when_not_validated()
    {
        $anggota = DB::table('anggota_kelas')->first();
        $siswaId = $anggota->siswa_id;

        $studentUser = User::where('id_siswa', $siswaId)->first();
        if (!$studentUser) {
            $studentUser = User::factory()->create([
                'role' => 'siswa',
                'id_siswa' => $siswaId,
                'username' => 'siswa_test_' . $siswaId,
            ]);
        }

        // Set status rapor ke draft
        DB::table('rapor_sts')->where('siswa_id', $siswaId)->update([
            'status_validasi' => 'draft',
            'ttd_walikelas' => null,
        ]);

        // Siswa mencoba akses data nilai via portal
        $resNilai = $this->actingAs($studentUser)->getJson('/api/v1/portal-siswa/nilai');
        $resNilai->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.is_validated', false);
        $this->assertEmpty($resNilai->json('data.daftar_nilai'));

        // Siswa mencoba download PDF via portal
        $resPdfPortal = $this->actingAs($studentUser)->get('/api/v1/portal-siswa/rapor-pdf');
        $resPdfPortal->assertStatus(403)
            ->assertJsonPath('status', 'error');

        // Siswa mencoba download PDF via endpoint langsung
        $resPdfDirect = $this->actingAs($studentUser)->get("/api/v1/rapor-sts/{$siswaId}/export-pdf");
        $resPdfDirect->assertStatus(403)
            ->assertJsonPath('status', 'error');
    }

    public function test_student_can_access_rapor_pdf_when_validated()
    {
        $anggota = DB::table('anggota_kelas')->first();
        $siswaId = $anggota->siswa_id;

        $studentUser = User::where('id_siswa', $siswaId)->first();
        if (!$studentUser) {
            $studentUser = User::factory()->create([
                'role' => 'siswa',
                'id_siswa' => $siswaId,
                'username' => 'siswa_test_' . $siswaId,
            ]);
        }

        // Set status rapor ke approved_by_walikelas
        DB::table('rapor_sts')->where('siswa_id', $siswaId)->update([
            'status_validasi' => 'approved_by_walikelas',
            'ttd_walikelas' => now(),
        ]);

        // Siswa akses portal nilai
        $resNilai = $this->actingAs($studentUser)->getJson('/api/v1/portal-siswa/nilai');
        $resNilai->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.is_validated', true);
        $this->assertNotEmpty($resNilai->json('data.daftar_nilai'));

        // Siswa download PDF resmi
        $resPdf = $this->actingAs($studentUser)->get('/api/v1/portal-siswa/rapor-pdf');
        $resPdf->assertStatus(200);
        $this->assertEquals('application/pdf', $resPdf->headers->get('content-type'));
        $this->assertStringStartsWith('%PDF', $resPdf->getContent());
    }
}
