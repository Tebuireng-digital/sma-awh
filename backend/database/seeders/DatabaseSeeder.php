<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\File;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Read db_seed_data.json
        $jsonPath = base_path('../docs/db_seed_data.json');
        if (!File::exists($jsonPath)) {
            $jsonPath = base_path('db_seed_data.json');
        }

        if (!File::exists($jsonPath)) {
            $this->command->error("File db_seed_data.json not found!");
            return;
        }

        $data = json_decode(File::get($jsonPath), true);

        // 2. Profil Sekolah
        $s = $data['sekolah'];
        DB::table('profil_sekolah')->insert([
            'nama_sekolah' => $s['nama_sekolah'] ?? 'SMA ABDUL WAHID HASYIM TEBUIRENG',
            'nss' => $s['nss'] ?? '20540007',
            'izin_operasional' => $s['izin_operasional'] ?? '421.3/1521/415.28/2014',
            'luas_tanah_m2' => $s['luas_tanah_m2'] ?? 12300,
            'alamat' => $s['alamat'] ?? 'Jl. Irian jaya no.10 Tebuireng, Cukir',
            'kecamatan' => $s['kecamatan'] ?? 'Diwek',
            'kabupaten' => $s['kabupaten'] ?? 'Jombang',
            'provinsi' => $s['provinsi'] ?? 'Jawa Timur',
            'kepala_sekolah' => $s['kepala_sekolah'] ?? 'Drs. H. Hari Winarto, MM.',
            'ketua_komite' => $s['ketua_komite'] ?? 'Drs. Fahmi Amrullah Hadzik',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 3. Pengaturan Sekolah
        DB::table('pengaturan_sekolah')->insert([
            'latitude_sekolah' => -7.5878000,
            'longitude_sekolah' => 112.2345000,
            'radius_toleransi_meter' => 100,
            'toleransi_terlambat_menit' => 20,
            'wa_bot_enabled' => true,
            'wa_gateway_url' => 'http://localhost:3000',
            'wa_gateway_key' => 'secret_key_bot_tebuireng',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 4. Tahun Ajaran & Semester
        $taId = DB::table('tahun_ajaran')->insertGetId([
            'nama' => '2026/2027',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $semId = DB::table('semester')->insertGetId([
            'tahun_ajaran_id' => $taId,
            'nama' => 'Ganjil',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 5. Guru
        foreach ($data['guru'] as $g) {
            DB::table('guru')->insert([
                'id_guru' => $g['id_guru'],
                'nama_lengkap' => $g['nama_lengkap'],
                'pendidikan_terakhir' => $g['pendidikan_terakhir'] ?? null,
                'no_hp' => $g['no_hp'] ?? null,
                'status_aktif' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Create User account for Teacher
            $username = 'guru_' . $g['id_guru'];
            DB::table('users')->insert([
                'name' => $g['nama_lengkap'],
                'username' => $username,
                'email' => $username . '@smaawh.sch.id',
                'password' => Hash::make('guru123'),
                'role' => 'guru',
                'id_guru' => $g['id_guru'],
                'no_hp' => $g['no_hp'] ?? null,
                'must_change_password' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 6. Kelas
        $kelasMap = [];
        foreach ($data['kelas'] as $k) {
            $kId = DB::table('kelas')->insertGetId([
                'nama_kelas' => $k['nama_kelas'],
                'tingkat' => $k['tingkat'],
                'id_guru_wali' => $k['id_guru_wali'] ?? null,
                'jumlah_siswa' => $k['jumlah_siswa'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $kelasMap[$k['nama_kelas']] = $kId;
        }

        // 7. Siswa & Anggota Kelas
        foreach ($data['siswa'] as $s) {
            $siswaId = DB::table('siswa')->insertGetId([
                'nis' => $s['nis'],
                'nama' => $s['nama'],
                'jenis_kelamin' => $s['jenis_kelamin'] ?? 'L',
                'no_hp_ortu' => '081234567890',
                'status_aktif' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            if (isset($kelasMap[$s['kelas']])) {
                DB::table('anggota_kelas')->insert([
                    'kelas_id' => $kelasMap[$s['kelas']],
                    'siswa_id' => $siswaId,
                    'no_urut' => $s['no_urut'] ?? 1,
                    'tahun_ajaran_id' => $taId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        // 8. System Admin Accounts
        DB::table('users')->insert([
            'name' => 'Administrator Sistem',
            'username' => 'admin',
            'email' => 'admin@smaawh.sch.id',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
            'id_guru' => null,
            'must_change_password' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('users')->insert([
            'name' => 'Waka Kurikulum',
            'username' => 'kurikulum',
            'email' => 'kurikulum@smaawh.sch.id',
            'password' => Hash::make('kurikulum123'),
            'role' => 'kurikulum',
            'id_guru' => null,
            'must_change_password' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('users')->insert([
            'name' => 'Guru Piket Sekolah',
            'username' => 'piket',
            'email' => 'piket@smaawh.sch.id',
            'password' => Hash::make('piket123'),
            'role' => 'piket',
            'id_guru' => null,
            'must_change_password' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 9. Sample Mata Pelajaran & Jadwal Pelajaran
        $mapelList = [
            ['kode' => 'PAI', 'nama_mapel' => 'Pendidikan Agama Islam'],
            ['kode' => 'PKN', 'nama_mapel' => 'Pendidikan Pancasila & Kewarganegaraan'],
            ['kode' => 'BIN', 'nama_mapel' => 'Bahasa Indonesia'],
            ['kode' => 'BIG', 'nama_mapel' => 'Bahasa Inggris'],
            ['kode' => 'MAT', 'nama_mapel' => 'Matematika'],
            ['kode' => 'FIS', 'nama_mapel' => 'Fisika'],
            ['kode' => 'KIM', 'nama_mapel' => 'Kimia'],
            ['kode' => 'BIO', 'nama_mapel' => 'Biologi'],
            ['kode' => 'EKO', 'nama_mapel' => 'Ekonomi'],
            ['kode' => 'GEO', 'nama_mapel' => 'Geografi'],
            ['kode' => 'SOS', 'nama_mapel' => 'Sosiologi'],
            ['kode' => 'PJK', 'nama_mapel' => 'Pendidikan Jasmani'],
        ];

        foreach ($mapelList as $mp) {
            DB::table('mata_pelajaran')->insert([
                'kode' => $mp['kode'],
                'nama_mapel' => $mp['nama_mapel'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 10. Sample Schedule entries for testing
        $hariStr = date('N') == 7 ? 'Minggu' : ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][date('N') - 1];
        $firstKelas = DB::table('kelas')->first();

        DB::table('jadwal_pelajaran')->insert([
            [
                'kelas_id' => $firstKelas ? $firstKelas->id : 1,
                'mapel_id' => 1,
                'id_guru' => 1,
                'hari' => $hariStr,
                'jam_ke' => 1,
                'jam_mulai' => '07:00:00',
                'jam_selesai' => '08:30:00',
                'semester_id' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'kelas_id' => $firstKelas ? $firstKelas->id : 1,
                'mapel_id' => 2,
                'id_guru' => 2,
                'hari' => $hariStr,
                'jam_ke' => 2,
                'jam_mulai' => '08:30:00',
                'jam_selesai' => '10:00:00',
                'semester_id' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
