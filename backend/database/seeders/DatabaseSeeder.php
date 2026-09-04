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
        // 1. Read db_seed_data.json if exists
        $jsonPath = base_path('../docs/db_seed_data.json');
        if (!File::exists($jsonPath)) {
            $jsonPath = base_path('db_seed_data.json');
        }

        $data = File::exists($jsonPath) ? json_decode(File::get($jsonPath), true) : null;

        // 2. Profil Sekolah
        DB::table('profil_sekolah')->insert([
            'nama_sekolah' => 'SMA ABDUL WAHID HASYIM TEBUIRENG',
            'nss' => '20540007',
            'izin_operasional' => '421.3/1521/415.28/2014',
            'luas_tanah_m2' => 12300,
            'alamat' => 'Jl. Irian jaya no.10 Tebuireng, Cukir',
            'kecamatan' => 'Diwek',
            'kabupaten' => 'Jombang',
            'provinsi' => 'Jawa Timur',
            'kepala_sekolah' => 'Drs. H. Hari Winarto, MM.',
            'ketua_komite' => 'Drs. Fahmi Amrullah Hadzik',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 3. Pengaturan Sekolah
        DB::table('pengaturan_sekolah')->insert([
            'latitude_sekolah' => -7.5878000,
            'longitude_sekolah' => 112.2345000,
            'radius_toleransi_meter' => 100,
            'toleransi_terlambat_menit' => 20,
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

        // 5. Guru (64 Guru Sesuai SK)
        $guruData = [
            [1, "NI'MATURROHMAH, M.Pd."], [2, "ARIFIN ALI PURWADI, S.Si, M.MPd."], [3, "ULFAH CHURMIYAH, M.Pd."],
            [4, "DEFFI APRILIA SUSANTI, S.Pd."], [5, "MUKHAMMAD HAFIDZ ABIZAR, M.H."], [6, "H. SUWARSO IDRIS, S.Pd."],
            [7, "SRI UTAMI, S.Pd."], [8, "SITI NURJANAH, S.Pd."], [9, "Drs. H. DJOKO PITONO"],
            [10, "Drs. ISMAIL"], [11, "Drs. H.M. ROKHANUDIN"], [12, "H. NAJIB, S.Ag."],
            [13, "Drs. FAHMI AMRULLAH"], [14, "PARTINI, S.Pd."], [15, "CAHYONISASI, S.Pd."],
            [16, "H. FAUZAN KAMAL, S.Ag."], [17, "SUJATI, S.Pd."], [18, "AGUS MAULANA, S.Ag., S.Pd.I."],
            [19, "DWI INDAH LESTARI, S.Pd."], [20, "ABDUL MALIK, S.Ag., S.Pd.I."], [21, "EVA DESSY PINASTI, S.Si."],
            [22, "IDA CHUSNUL KHOTIMAH, S.Pd."], [23, "IMAMUDIN, S.Pd."], [24, "ODIK TUGIMIN, S.Pd."],
            [25, "YANUARI MUTIK, M.Psi."], [26, "MUSTAKIM MOHAMAD, S.Sos.I"], [27, "IKA YUNITA INDRAWATI, M.Pd."],
            [28, "HUSNUL KHOTIMAH, S.Si."], [29, "M. SYAM'UN ROSYADI, M.HI."], [30, "YULI KHARISMA DZATI, S.Pd."],
            [31, "MUHAMMAD ANSORI, M.Pd.I."], [32, "ACHMAD FAUZI, M.Si."], [33, "DWI MULYANI, S.Pd."],
            [34, "NAILUL HIKMAH, M.Pd."], [35, "M. UMAR ABDUL AZIZ, S.Ag."], [36, "BUSROL ADHIM, S.Ag."],
            [37, "NURUL QOMARIYAH SAYUTI, S.Si."], [38, "WAHYU HIDAYATI, S.Pd."], [39, "ZUNITA LISDIANA, S.Pd."],
            [40, "YOGI MAULANA FERDIANSYAH, S.Pd."], [41, "MIRZA NURUL LAILI, S.Pd."], [42, "MOCH. LUTHFI FAZRI, S.A., S.H."],
            [43, "NIDHOM ALI HAZMI, S.Sy."], [44, "ACH. QONI' ALI CHAFID, S.Pd."], [45, "KHOIROTUNNISA', S.Pd."],
            [46, "FATIMAH FITRIANA, S.Sos."], [47, "LIHAM HASAN AL MUJAB, S.H."], [48, "MUHAMAD FAHRUDIN, S.Ag."],
            [49, "MUHAMMAD YAZID Z.M., M.Pd."], [50, "RAHMADANI TRI HANDAYANI, S.Pd."], [51, "LAILLATUL FAIZAH, S.Sos."],
            [52, "BILLY YUSSAQ DESAOSA, S.Pd."], [53, "NOVITA JUNI ANDRIYANI, S.Psi."], [54, "RIFQI HAWARI, M.Pd."],
            [55, "RONA PUSVITA, S.Pd."], [56, "EVITRI SUTANTI, S.Si."], [57, "MUHAMAD KEMAL RIZA, S.M."],
            [58, "LAZIMAH NUR AINI P., S.Pd."], [59, "THOHA BISYRI, S.H."], [60, "PRATIMI INTAN FITRIYANA, S.Pd."],
            [61, "RIZKI FIRMANSYAH, S.Pd."], [62, "LILIK NURIYATI, S.Si."], [63, "ABDAN FILARDI"], [64, "MOH. FIKRI ARDIANTO, S.Pd."]
        ];

        foreach ($guruData as $g) {
            DB::table('guru')->insert([
                'id_guru' => $g[0],
                'nama_lengkap' => $g[1],
                'pendidikan_terakhir' => 'S1',
                'no_hp' => '081234567890',
                'status_aktif' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 6. Kelas
        $kelasMap = [];
        if ($data && isset($data['kelas'])) {
            foreach ($data['kelas'] as $k) {
                $guruWali = $k['id_guru_wali'] ?? 1;
                if ($guruWali > 64) $guruWali = rand(1, 64);

                $kId = DB::table('kelas')->insertGetId([
                    'nama_kelas' => $k['nama_kelas'],
                    'tingkat' => $k['tingkat'],
                    'id_guru_wali' => $guruWali,
                    'jumlah_siswa' => $k['jumlah_siswa'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                $kelasMap[$k['nama_kelas']] = $kId;
            }
        } else {
            $tingkats = ['X', 'XI', 'XII'];
            foreach ($tingkats as $t) {
                for ($num = 1; $num <= 8; $num++) {
                    $namaK = "$t.$num";
                    $kId = DB::table('kelas')->insertGetId([
                        'nama_kelas' => $namaK,
                        'tingkat' => $t,
                        'id_guru_wali' => rand(1, 64),
                        'jumlah_siswa' => 30,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                    $kelasMap[$namaK] = $kId;
                }
            }
        }

        // 7. Siswa & Anggota Kelas
        $sampleSiswaId = 1;
        if ($data && isset($data['siswa'])) {
            foreach ($data['siswa'] as $index => $s) {
                $siswaId = DB::table('siswa')->insertGetId([
                    'nis' => $s['nis'],
                    'nama' => $s['nama'],
                    'jenis_kelamin' => $s['jenis_kelamin'] ?? 'L',
                    'no_hp_ortu' => '081234567890',
                    'status_aktif' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                if ($index === 0) $sampleSiswaId = $siswaId;

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
        } else {
            $firstKelasId = reset($kelasMap);
            $sampleSiswaId = DB::table('siswa')->insertGetId([
                'nis' => '2026001',
                'nama' => 'AHMAD SANTRI PERDANA',
                'jenis_kelamin' => 'L',
                'no_hp_ortu' => '081234567890',
                'status_aktif' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('anggota_kelas')->insert([
                'kelas_id' => $firstKelasId,
                'siswa_id' => $sampleSiswaId,
                'no_urut' => 1,
                'tahun_ajaran_id' => $taId,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $rolesConfig = [
            ['name' => 'Kepala Sekolah', 'username' => 'kepsek', 'role' => 'kepala_sekolah'],
            ['name' => 'Wakil Kepala Sekolah', 'username' => 'waka', 'role' => 'waka'],
            ['name' => 'Kepala TU', 'username' => 'kepala_tu', 'role' => 'kepala_tu'],
            ['name' => 'Staf Kurikulum', 'username' => 'kurikulum', 'role' => 'kurikulum'],
            ['name' => 'Staf Kesiswaan', 'username' => 'kesiswaan', 'role' => 'kesiswaan'],
            ['name' => 'Staf Sarana Prasarana', 'username' => 'sarana', 'role' => 'sarana'],
            ['name' => 'Staf Kepegawaian (HRD)', 'username' => 'kepegawaian', 'role' => 'kepegawaian'],
            ['name' => 'Staf Administrasi Persuratan', 'username' => 'persuratan', 'role' => 'persuratan'],
            ['name' => 'Staf Branding & Humas', 'username' => 'humas', 'role' => 'humas'],
            ['name' => 'Wali Santri / Orang Tua', 'username' => 'walisantri', 'role' => 'wali_santri', 'id_siswa' => $sampleSiswaId],
            ['name' => 'Pustakawan Sekolah', 'username' => 'pustakawan', 'role' => 'pustakawan'],
            ['name' => 'Siswa / Santri', 'username' => 'siswa', 'role' => 'siswa', 'id_siswa' => $sampleSiswaId],
            ['name' => 'Administrator Utama', 'username' => 'admin', 'role' => 'admin'],
        ];

        foreach ($rolesConfig as $rc) {
            DB::table('users')->insert([
                'name' => $rc['name'],
                'username' => $rc['username'],
                'email' => $rc['username'] . '@smaawh.sch.id',
                'password' => Hash::make('password123'),
                'role' => $rc['role'],
                'id_guru' => null,
                'id_siswa' => $rc['id_siswa'] ?? null,
                'must_change_password' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Add users for all 64 Gurus
        foreach ($guruData as $g) {
            DB::table('users')->insert([
                'name' => $g[1],
                'username' => 'guru_' . $g[0],
                'email' => 'guru_' . $g[0] . '@smaawh.sch.id',
                'password' => Hash::make('guru123'),
                'role' => 'guru',
                'id_guru' => $g[0],
                'id_siswa' => null,
                'must_change_password' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 9. Mapel List
        $mapels = [
            'PAI', 'Biologi', 'Geografi', 'Matematika TL', 'Penjaskes', 'Bahasa Indonesia',
            'Pend. Kewarganegaraan', 'Seni Budaya', 'Nahwu Shorof', 'Bahasa Inggris', 'Fisika',
            'Matematika', 'Al-Quran', 'Ekonomi', 'PAI / Fiqih', 'Bahasa Inggris / Bhs Inggris TL',
            'PAI / Aswaja', 'Kimia', 'BK', 'Geografi / Antropologi', 'Akhlaq', 'Fiqih / Bahasa Arab',
            'Biologi / Informatika', 'Ekonomi/ PKWU/ Antropologi', 'Bahasa Arab / Nahwu Shorof',
            'Fiqih', 'Sejarah / Antropologi', 'PAI / Akhlaq', 'Akhlaq/ Nahwu Shorof', 
            'Sosiologi / Antropologi', 'Al Quran / Aswaja', 'Aswaja', 'Seni Budaya / Informatika', 
            'Akhlaq / Fiqih'
        ];

        foreach ($mapels as $idx => $m) {
            $kode = strtoupper(preg_replace('/[^A-Za-z]/', '', $m)) . '_' . ($idx + 1);
            if (strlen($kode) > 10) {
                $kode = substr($kode, 0, 7) . '_' . ($idx + 1);
            }
            DB::table('mata_pelajaran')->insert([
                'kode' => $kode,
                'nama_mapel' => $m,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 10. REAL Schedule entries from image transcribed
        $jadwalMatrix = [
            'Sabtu' => [
                1 => [[24, 56, 58, 50, 57, 20, 55, 54, 35, 15, 21, 33, 44, 42, 14, 19, 34, 49, 47, 12, 18, 52, 39, 1, 27]],
                2 => [[24, 56, 58, 50, 57, 20, 55, 54, 35, 15, 21, 33, 44, 42, 14, 19, 34, 49, 47, 12, 18, 52, 39, 1, 27]],
                3 => [[32, 24, 42, 56, 54, 57, 20, 55, 44, 35, 14, 15, 33, 36, 58, 34, 31, 47, 18, 19, 12, 49, 52, 39, 50]],
                4 => [[32, 24, 42, 56, 54, 57, 20, 55, 44, 35, 14, 15, 33, 36, 58, 34, 31, 47, 18, 19, 12, 49, 52, 39, 50]],
                5 => [[32, 52, 56, 24, 50, 55, 54, 57, 15, 44, 35, 36, 34, 14, 42, 58, 20, 18, 39, 33, 27, 47, 49, 60, 1]],
                6 => [[32, 52, 56, 24, 50, 55, 54, 57, 15, 44, 35, 36, 34, 14, 42, 58, 20, 18, 39, 33, 27, 47, 49, 60, 1]],
                7 => [[17, 58, 24, 42, 56, 50, 57, 20, 47, 14, 15, 35, 36, 19, 44, 27, 54, 39, 34, 18, 49, 32, 22, 33, 60]],
                8 => [[17, 58, 24, 42, 56, 50, 57, 20, 47, 14, 15, 35, 36, 19, 44, 27, 54, 39, 34, 18, 49, 32, 22, 33, 60]]
            ],
            'Ahad' => [
                1 => [[40, 61, 10, 43, 51, 58, 60, 46, 38, 47, 36, 24, 45, 30, 37, 31, 41, 21, 49, 42, 39, 18, 55, 52, 12]],
                2 => [[40, 61, 10, 43, 51, 58, 60, 46, 38, 47, 36, 24, 45, 30, 37, 31, 41, 21, 49, 42, 39, 18, 55, 52, 12]],
                3 => [[46, 43, 28, 10, 55, 60, 58, 31, 36, 32, 21, 39, 24, 37, 54, 42, 51, 40, 30, 49, 47, 45, 12, 18, 52]],
                4 => [[46, 43, 28, 10, 55, 60, 58, 31, 36, 32, 21, 39, 24, 37, 54, 42, 51, 40, 30, 49, 47, 45, 12, 18, 52]],
                5 => [[43, 28, 52, 33, 58, 24, 64, 38, 31, 30, 44, 46, 35, 45, 56, 51, 42, 37, 59, 40, 5, 21, 47, 12, 18]],
                6 => [[43, 28, 52, 33, 58, 24, 64, 38, 31, 30, 44, 46, 35, 45, 56, 51, 42, 37, 59, 40, 5, 21, 47, 12, 18]],
                7 => [[28, 46, 43, 61, 60, 37, 24, 59, 38, 36, 30, 51, 42, 35, 31, 44, 45, 4, 21, 39, 58, 12, 18, 47, 55]],
                8 => [[28, 46, 43, 61, 60, 37, 24, 59, 38, 36, 30, 51, 42, 35, 31, 44, 45, 4, 21, 39, 58, 12, 18, 47, 55]]
            ],
            'Senin' => [
                1 => [[47, 24, 31, 40, 44, 41, 51, 46, 30, 56, 21, 19, 33, 39, 37, 27, 58, 15, 45, 54, 34, 32, 22, 50, 17]],
                2 => [[47, 32, 37, 59, 60, 63, 51, 22, 10, 56, 20, 8, 41, 39, 45, 27, 58, 15, 5, 54, 23, 30, 14, 50, 17]],
                3 => [[56, 17, 47, 50, 22, 40, 59, 24, 52, 32, 14, 8, 19, 37, 45, 20, 58, 21, 5, 54, 34, 10, 31, 33, 23]],
                4 => [[56, 17, 47, 50, 22, 40, 59, 24, 52, 32, 14, 8, 19, 37, 45, 20, 58, 21, 5, 54, 34, 10, 31, 33, 23]],
                5 => [[47, 42, 10, 37, 63, 21, 50, 60, 56, 52, 45, 31, 8, 18, 30, 54, 41, 15, 34, 33, 7, 14, 23, 17, 27]],
                6 => [[32, 42, 10, 37, 63, 21, 50, 60, 56, 52, 45, 31, 24, 18, 8, 54, 41, 15, 34, 33, 7, 14, 23, 17, 27]],
                7 => [[42, 47, 32, 10, 24, 50, 60, 58, 20, 31, 22, 19, 46, 14, 34, 45, 27, 37, 7, 15, 54, 21, 30, 23, 17]],
                8 => [[42, 47, 32, 10, 24, 50, 60, 58, 20, 31, 22, 19, 46, 14, 34, 45, 27, 37, 7, 15, 54, 21, 30, 23, 17]]
            ],
            'Selasa' => [
                1 => [[13, 11, 17, 40, 60, 22, 50, 61, 56, 8, 39, 24, 18, 34, 14, 41, 15, 7, 10, 3, 51, 23, 31, 27, 46]],
                2 => [[13, 11, 17, 40, 60, 22, 50, 61, 56, 8, 39, 24, 18, 34, 14, 41, 15, 7, 10, 3, 51, 23, 31, 27, 46]],
                3 => [[63, 13, 33, 59, 40, 61, 22, 60, 45, 7, 20, 11, 41, 39, 18, 34, 8, 10, 2, 3, 23, 30, 14, 46, 50]],
                4 => [[63, 13, 33, 37, 40, 61, 22, 60, 45, 7, 8, 11, 24, 56, 18, 34, 44, 10, 2, 15, 58, 30, 50, 46, 17]],
                5 => [[58, 32, 13, 33, 44, 59, 63, 41, 39, 20, 40, 45, 31, 56, 34, 51, 18, 23, 14, 10, 15, 55, 21, 50, 27]],
                6 => [[58, 32, 13, 33, 44, 59, 63, 41, 39, 20, 40, 45, 31, 56, 34, 51, 18, 23, 14, 10, 15, 55, 21, 50, 27]],
                7 => [[33, 63, 37, 11, 59, 60, 21, 50, 32, 56, 19, 44, 8, 34, 55, 18, 41, 14, 15, 51, 27, 30, 10, 23, 31]],
                8 => [[33, 63, 37, 11, 59, 60, 21, 50, 32, 56, 19, 44, 8, 34, 55, 18, 41, 14, 15, 51, 27, 45, 10, 23, 31]]
            ],
            'Rabu' => [
                1 => [[11, 32, 29, 13, 62, 41, 61, 47, 10, 30, 7, 42, 20, 8, 56, 15, 40, 19, 21, 23, 16, 39, 9, 54, 31]],
                2 => [[11, 32, 29, 13, 62, 41, 61, 47, 10, 30, 7, 42, 20, 8, 56, 15, 40, 19, 21, 23, 16, 39, 9, 54, 31]],
                3 => [[28, 6, 11, 29, 13, 51, 41, 21, 7, 39, 31, 20, 46, 8, 37, 40, 34, 42, 30, 16, 10, 32, 54, 9, 47]],
                4 => [[28, 6, 11, 29, 13, 51, 41, 21, 7, 39, 31, 20, 46, 56, 37, 40, 34, 42, 30, 16, 10, 32, 54, 9, 47]],
                5 => [[29, 28, 31, 62, 42, 13, 47, 22, 30, 19, 34, 40, 11, 20, 8, 41, 51, 54, 45, 7, 17, 9, 16, 46, 39]],
                6 => [[29, 28, 31, 62, 42, 13, 47, 22, 30, 19, 34, 40, 11, 20, 8, 41, 51, 54, 45, 7, 17, 9, 16, 46, 39]],
                7 => [[6, 29, 28, 63, 37, 47, 62, 50, 32, 8, 30, 34, 39, 11, 20, 46, 41, 14, 42, 17, 51, 54, 21, 27, 9]],
                8 => [[6, 29, 28, 63, 37, 47, 62, 50, 32, 56, 30, 34, 39, 11, 20, 46, 41, 14, 42, 17, 51, 54, 21, 27, 9]]
            ],
            'Kamis' => [
                1 => [[59, 62, 61, 37, 50, 54, 23, 29, 19, 20, 42, 46, 15, 30, 40, 55, 8, 4, 14, 51, 9, 16, 22, 17, 27]],
                2 => [[59, 62, 61, 37, 50, 54, 23, 29, 19, 20, 42, 46, 15, 30, 40, 55, 8, 4, 14, 51, 9, 16, 22, 17, 27]],
                3 => [[62, 6, 46, 51, 47, 22, 29, 61, 30, 63, 20, 33, 41, 40, 19, 8, 55, 59, 54, 9, 15, 50, 14, 23, 16]],
                4 => [[62, 6, 46, 51, 47, 22, 29, 61, 30, 63, 20, 33, 41, 40, 19, 8, 55, 59, 54, 9, 58, 50, 14, 23, 16]],
                5 => [[6, 33, 59, 47, 29, 62, 61, 64, 20, 14, 22, 51, 40, 44, 15, 8, 23, 19, 9, 17, 34, 45, 30, 55, 46]],
                6 => [[6, 33, 59, 47, 29, 62, 61, 64, 20, 14, 22, 51, 40, 44, 15, 27, 23, 19, 9, 17, 34, 50, 30, 55, 46]],
                7 => [[61, 59, 62, 58, 41, 29, 22, 23, 63, 45, 8, 20, 33, 15, 30, 46, 27, 9, 2, 19, 17, 14, 50, 16, 54]],
                8 => [[61, 59, 62, 58, 41, 29, 51, 23, 63, 45, 8, 20, 33, 15, 30, 46, 27, 9, 2, 19, 17, 14, 50, 16, 54]]
            ]
        ];

        $allKelas = DB::table('kelas')
            ->get()
            ->sort(function($a, $b) {
                $tA = strlen($a->tingkat);
                $tB = strlen($b->tingkat);
                if ($tA !== $tB) return $tA <=> $tB;
                $nA = (int)explode('.', $a->nama_kelas)[1];
                $nB = (int)explode('.', $b->nama_kelas)[1];
                return $nA <=> $nB;
            })->values();
        
        $guruMapelRaw = [
            1 => 'PAI', 2 => 'Biologi', 3 => 'Geografi', 4 => 'Matematika TL', 5 => 'Penjaskes', 6 => 'Bahasa Indonesia',
            7 => 'Pend. Kewarganegaraan', 8 => 'Bahasa Indonesia', 9 => 'Seni Budaya', 10 => 'Bahasa Indonesia',
            11 => 'Pend. Kewarganegaraan', 12 => 'Nahwu Shorof', 13 => 'Bahasa Inggris', 14 => 'Fisika', 15 => 'Matematika',
            16 => 'Al-Quran', 17 => 'Ekonomi', 18 => 'PAI / Fiqih', 19 => 'Bahasa Inggris / Bhs Inggris TL', 20 => 'PAI / Aswaja',
            21 => 'Kimia', 22 => 'Biologi', 23 => 'Bahasa Inggris / Bhs Inggris TL', 24 => 'Geografi', 25 => 'BK', 26 => 'BK',
            27 => 'Geografi / Antropologi', 28 => 'Matematika', 29 => 'Akhlaq', 30 => 'Matematika TL', 31 => 'Fiqih / Bahasa Arab',
            32 => 'Biologi / Informatika', 33 => 'Ekonomi/ PKWU/ Antropologi', 34 => 'Bahasa Arab / Nahwu Shorof', 35 => 'Al-Quran',
            36 => 'Fiqih', 37 => 'Biologi / Informatika', 38 => 'Fisika', 39 => 'Sejarah / Antropologi', 40 => 'Penjaskes',
            41 => 'Ekonomi/ PKWU/ Antropologi', 42 => 'PAI / Akhlaq', 43 => 'Al-Quran', 44 => 'Seni Budaya', 45 => 'Bahasa Inggris / Bhs Inggris TL',
            46 => 'Sosiologi / Antropologi', 47 => 'Akhlaq/ Nahwu Shorof', 48 => 'BK', 49 => 'PAI', 50 => 'Matematika',
            51 => 'Sosiologi / Antropologi', 52 => 'Penjaskes', 53 => 'BK', 54 => 'Al Quran / Aswaja', 55 => 'Pend. Kewarganegaraan',
            56 => 'Matematika', 57 => 'Ekonomi', 58 => 'Sejarah / Antropologi', 59 => 'Aswaja', 60 => 'Bahasa Indonesia',
            61 => 'Seni Budaya / Informatika', 62 => 'Fisika', 63 => 'Akhlaq / Fiqih', 64 => 'Penjaskes'
        ];
        
        $mapelDb = DB::table('mata_pelajaran')->pluck('id', 'nama_mapel')->toArray();
        $guruToMapelId = [];
        foreach ($guruMapelRaw as $gid => $mapelName) {
            $guruToMapelId[$gid] = $mapelDb[$mapelName] ?? 1;
        }

        $normalTimeSlots = [
            1 => ['07:20:00', '08:00:00'],
            2 => ['08:00:00', '08:40:00'],
            3 => ['08:40:00', '09:20:00'],
            4 => ['09:20:00', '10:00:00'],
            5 => ['10:20:00', '11:00:00'],
            6 => ['11:00:00', '11:40:00'],
            7 => ['11:40:00', '12:20:00'],
            8 => ['12:20:00', '13:00:00']
        ];
        
        $ahadTimeSlots = [
            1 => ['07:20:00', '07:50:00'],
            2 => ['07:50:00', '08:20:00'],
            3 => ['08:20:00', '08:50:00'],
            4 => ['08:50:00', '09:20:00'],
            5 => ['10:00:00', '10:30:00'],
            6 => ['10:30:00', '11:00:00'],
            7 => ['11:00:00', '11:30:00'],
            8 => ['11:30:00', '12:00:00'],
            9 => ['12:00:00', '12:30:00'],
            10 => ['12:30:00', '13:00:00']
        ];

        foreach ($jadwalMatrix as $hari => $jamData) {
            $isAhad = strtoupper($hari) === 'AHAD';
            foreach ($jamData as $jamKe => $rowArr) {
                $row = $rowArr[0]; // array of 25 guru IDs
                
                $jamMulai = $isAhad ? ($ahadTimeSlots[$jamKe][0] ?? '00:00:00') : ($normalTimeSlots[$jamKe][0] ?? '00:00:00');
                $jamSelesai = $isAhad ? ($ahadTimeSlots[$jamKe][1] ?? '00:00:00') : ($normalTimeSlots[$jamKe][1] ?? '00:00:00');

                foreach ($row as $idx => $idGuru) {
                    if ($idGuru > 0 && isset($allKelas[$idx])) {
                        DB::table('jadwal_pelajaran')->insert([
                            'kelas_id' => $allKelas[$idx]->id,
                            'mapel_id' => $guruToMapelId[$idGuru] ?? 1,
                            'id_guru' => $idGuru,
                            'hari' => $hari,
                            'jam_ke' => $jamKe,
                            'jam_mulai' => $jamMulai,
                            'jam_selesai' => $jamSelesai,
                            'semester_id' => 1,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                    }
                }
            }
        }

        // 11. Sample Rapor STS
        DB::table('rapor_sts')->insert([
            'siswa_id' => $sampleSiswaId,
            'tahun_ajaran' => '2026/2027',
            'semester' => 'Ganjil',
            'nilai_pai' => 88,
            'nilai_ppkn' => 85,
            'nilai_indo' => 90,
            'nilai_mtk' => 82,
            'nilai_inggris' => 86,
            'nilai_seni' => 88,
            'nilai_penjas' => 92,
            'nilai_informa' => 85,
            'nilai_sejarah' => 84,
            'nilai_biologi' => 80,
            'nilai_fisika' => 78,
            'nilai_kimia' => 82,
            'nilai_geografi' => 86,
            'nilai_sosiologi' => 88,
            'nilai_ekonomi' => 85,
            'nilai_pkwu' => 90,
            'nilai_alquran' => 95,
            'nilai_akhlaq' => 92,
            'nilai_fiqih' => 90,
            'nilai_nahwu' => 87,
            'nilai_aswaja' => 90,
            'kktp' => 75,
            'jumlah' => 1813,
            'rata_rata' => 86.33,
            'catatan_wali_kelas' => 'Pertahankan prestasi dan tetap semangat beribadah serta belajar.',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 12. Sample Kepegawaian, BK, Sarana, Persuratan, Humas, Perpustakaan
        $pegId = DB::table('pegawai')->insertGetId([
            'nip' => '198501012010011001',
            'nama_lengkap' => 'Drs. H. M. Rokhanudin',
            'jabatan' => 'Guru Fiqih / Staf',
            'status_kepegawaian' => 'Tetap',
            'no_hp' => '081234567890',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('pengajuan_kepegawaian')->insert([
            'pegawai_id' => $pegId,
            'jenis' => 'Cuti',
            'alasan' => 'Pengajuan Cuti Tahunan',
            'tgl_mulai' => now()->toDateString(),
            'tgl_selesai' => now()->addDays(3)->toDateString(),
            'status_ktu' => 'Disetujui',
            'status_kepsek' => 'Disetujui',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('bk_catatan')->insert([
            'siswa_id' => $sampleSiswaId,
            'tanggal' => now()->toDateString(),
            'kategori' => 'Konseling',
            'judul' => 'Bimbingan Minat Bakat dan Studi Lanjut',
            'catatan_rahasia' => 'Siswa berminat melanjutkan ke Perguruan Tinggi Negeri jurusan Teknik Informatika.',
            'ditangani_oleh' => 'Guru BK',
            'status' => 'Selesai',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('inventaris_barang')->insert([
            'kode_barang' => 'LAB-LAP-001',
            'nama_barang' => 'Laptop Asus Core i5',
            'kategori' => 'Aset IT',
            'jumlah' => 20,
            'kondisi' => 'Baik',
            'lokasi' => 'Laboratorium Komputer',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('surat')->insert([
            'no_surat' => '001/SMA-AWH/IX/2026',
            'jenis' => 'Surat Keluar',
            'perihal' => 'Surat Pemberitahuan Rapor Sumatif Tengah Semester',
            'pengirim_penerima' => 'Wali Santri Kelas X',
            'tanggal' => now()->toDateString(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('humas_konten')->insert([
            'judul' => 'Kegiatan Pembukaan Sumatif Tengah Semester 2026/2027',
            'kategori' => 'Berita',
            'isi' => 'SMA KH. A. Wahid Hasyim Tebuireng menggelar pelaksanaan STS Ganjil dengan lancar.',
            'status' => 'Published',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $bukuId = DB::table('buku_perpustakaan')->insertGetId([
            'kode_buku' => 'BK-FIQ-001',
            'judul' => 'Kitab Fathul Qorib',
            'pengarang' => 'Syaikh Muhammad bin Qasim Al-Ghazi',
            'penerbit' => 'Pustaka Tebuireng',
            'stok' => 15,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('peminjaman_buku')->insert([
            'buku_id' => $bukuId,
            'siswa_id' => $sampleSiswaId,
            'tgl_pinjam' => now()->toDateString(),
            'tgl_tenggat' => now()->addDays(7)->toDateString(),
            'status' => 'Dipinjam',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
