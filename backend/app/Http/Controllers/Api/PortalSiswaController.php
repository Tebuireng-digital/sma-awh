<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Siswa;

class PortalSiswaController extends Controller
{
    /**
     * Memastikan request berasal dari user santri/wali yang valid
     */
    protected function getAuthenticatedSiswaId(Request $request)
    {
        $user = $request->user();
        $siswaId = $user->id_siswa;

        if (!$siswaId) {
            abort(403, 'Akun ini tidak tertaut dengan data santri manapun.');
        }

        return $siswaId;
    }

    /**
     * 1. GET /v1/portal-siswa/ringkasan
     * Data profil santri (tanpa foto), ringkasan kehadiran, nilai rata-rata, dan status buku
     */
    public function ringkasan(Request $request)
    {
        $siswaId = $this->getAuthenticatedSiswaId($request);

        $siswa = DB::table('siswa')->where('id', $siswaId)->first();
        if (!$siswa) {
            return response()->json(['status' => 'error', 'message' => 'Data santri tidak ditemukan.'], 404);
        }

        // Kelas & Wali Kelas
        $kelasInfo = DB::table('anggota_kelas')
            ->join('kelas', 'anggota_kelas.kelas_id', '=', 'kelas.id')
            ->leftJoin('guru', 'kelas.id_guru_wali', '=', 'guru.id_guru')
            ->where('anggota_kelas.siswa_id', $siswaId)
            ->select(
                'kelas.id as kelas_id',
                'kelas.nama_kelas',
                'kelas.tingkat',
                'guru.nama_lengkap as nama_wali_kelas',
                'guru.no_hp as no_hp_wali_kelas'
            )
            ->first();

        // Rekap Presensi Harian
        $presensiStats = DB::table('presensi_murid_harian')
            ->where('siswa_id', $siswaId)
            ->selectRaw("
                COUNT(*) as total_hari,
                SUM(CASE WHEN status = 'HADIR' THEN 1 ELSE 0 END) as hadir,
                SUM(CASE WHEN status = 'SAKIT' THEN 1 ELSE 0 END) as sakit,
                SUM(CASE WHEN status = 'IZIN' THEN 1 ELSE 0 END) as izin,
                SUM(CASE WHEN status = 'ALPA' THEN 1 ELSE 0 END) as alpa,
                SUM(CASE WHEN status = 'TERLAMBAT' THEN 1 ELSE 0 END) as terlambat
            ")
            ->first();

        $totalHari = (int)($presensiStats->total_hari ?? 0);
        $totalHadir = (int)($presensiStats->hadir ?? 0);
        $persenHadir = $totalHari > 0 ? round(($totalHadir / $totalHari) * 100, 1) : 100.0;

        // Rata-rata Rapor STS
        $rapor = DB::table('rapor_sts')
            ->where('siswa_id', $siswaId)
            ->latest('created_at')
            ->first();

        $realRataRata = 0;
        $mapelDinilaiCount = 0;
        $subjectCols = [
            'nilai_pai', 'nilai_ppkn', 'nilai_indo', 'nilai_mtk', 'nilai_inggris',
            'nilai_seni', 'nilai_penjas', 'nilai_informa', 'nilai_sejarah',
            'nilai_biologi', 'nilai_fisika', 'nilai_kimia', 'nilai_geografi',
            'nilai_sosiologi', 'nilai_ekonomi', 'nilai_pkwu', 'nilai_alquran',
            'nilai_akhlaq', 'nilai_fiqih', 'nilai_nahwu', 'nilai_aswaja'
        ];

        if ($rapor) {
            $graded = [];
            foreach ($subjectCols as $col) {
                if (isset($rapor->$col) && (float)$rapor->$col > 0) {
                    $graded[] = (float)$rapor->$col;
                }
            }
            $mapelDinilaiCount = count($graded);
            if ($mapelDinilaiCount > 0) {
                $realRataRata = round(array_sum($graded) / $mapelDinilaiCount, 2);
            }
        }

        // Pinjaman Perpustakaan Aktif
        $pinjamanAktif = DB::table('peminjaman_buku')
            ->where('siswa_id', $siswaId)
            ->whereNull('tgl_kembali')
            ->count();

        // Prestasi & Poin Pelanggaran
        $totalPrestasi = DB::table('bk_prestasi')->where('siswa_id', $siswaId)->count();
        $totalPoinPelanggaran = (int)DB::table('bk_pelanggaran')->where('siswa_id', $siswaId)->sum('poin');

        return response()->json([
            'status' => 'success',
            'data' => [
                'siswa' => [
                    'id' => $siswa->id,
                    'nis' => $siswa->nis,
                    'nisn' => $siswa->nisn ?: ('008' . str_pad((string)$siswa->nis, 7, '0', STR_PAD_LEFT)),
                    'nama' => $siswa->nama,
                    'jenis_kelamin' => $siswa->jenis_kelamin,
                    'tanggal_lahir' => $siswa->tanggal_lahir ?: '2008-01-01',
                    'nama_wali' => ($siswa->nama_wali && $siswa->nama_wali !== 'Orang Tua / Wali Santri') ? $siswa->nama_wali : 'Orang Tua / Wali Murid',
                    'no_hp_ortu' => $siswa->no_hp_ortu,
                    'status_aktif' => (bool)$siswa->status_aktif,
                    'kelas' => $kelasInfo->nama_kelas ?? 'X.1',
                    'tingkat' => $kelasInfo->tingkat ?? 'X',
                    'wali_kelas' => $kelasInfo->nama_wali_kelas ?? 'Wali Kelas SMA AWH',
                ],
                'metrik' => [
                    'persentase_kehadiran' => $persenHadir,
                    'total_hari_presensi' => $totalHari,
                    'total_hadir' => $totalHadir,
                    'rata_rata_sts' => ($rapor && in_array($rapor->status_validasi, ['approved_by_walikelas', 'approved_by_kepsek'])) ? $realRataRata : null,
                    'mapel_dinilai_count' => $mapelDinilaiCount,
                    'total_mapel' => 21,
                    'kktp_standar' => $rapor ? $rapor->kktp : 75,
                    'status_validasi' => $rapor->status_validasi ?? 'draft',
                    'is_validated' => (bool)($rapor && in_array($rapor->status_validasi, ['approved_by_walikelas', 'approved_by_kepsek'])),
                    'pinjaman_buku_aktif' => $pinjamanAktif,
                    'total_prestasi' => $totalPrestasi,
                    'total_poin_pelanggaran' => $totalPoinPelanggaran,
                ]
            ]
        ]);
    }

    /**
     * 2. GET /v1/portal-siswa/presensi
     * Riwayat presensi harian read-only
     */
    public function presensi(Request $request)
    {
        $siswaId = $this->getAuthenticatedSiswaId($request);

        $bulan = $request->query('bulan', date('m'));
        $tahun = $request->query('tahun', date('Y'));

        $records = DB::table('presensi_murid_harian')
            ->where('siswa_id', $siswaId)
            ->whereYear('tanggal', $tahun)
            ->orderBy('tanggal', 'desc')
            ->limit(60)
            ->get();

        $rekap = DB::table('presensi_murid_harian')
            ->where('siswa_id', $siswaId)
            ->selectRaw("
                COUNT(*) as total,
                SUM(CASE WHEN status = 'HADIR' THEN 1 ELSE 0 END) as hadir,
                SUM(CASE WHEN status = 'SAKIT' THEN 1 ELSE 0 END) as sakit,
                SUM(CASE WHEN status = 'IZIN' THEN 1 ELSE 0 END) as izin,
                SUM(CASE WHEN status = 'ALPA' THEN 1 ELSE 0 END) as alpa,
                SUM(CASE WHEN status = 'TERLAMBAT' THEN 1 ELSE 0 END) as terlambat
            ")
            ->first();

        return response()->json([
            'status' => 'success',
            'data' => [
                'rekap' => $rekap,
                'riwayat' => $records
            ]
        ]);
    }

    /**
     * 3. GET /v1/portal-siswa/nilai
     * Nilai Rapor STS & Rapor Digital (Read-Only)
     * Wajib sudah divalidasi oleh Wali Kelas
     */
    public function nilai(Request $request)
    {
        $siswaId = $this->getAuthenticatedSiswaId($request);

        $rapor = DB::table('rapor_sts')
            ->where('siswa_id', $siswaId)
            ->latest('created_at')
            ->first();

        $isValidated = $rapor && in_array($rapor->status_validasi, ['approved_by_walikelas', 'approved_by_kepsek']);

        if (!$isValidated) {
            $kelasInfo = DB::table('anggota_kelas')
                ->join('kelas', 'anggota_kelas.kelas_id', '=', 'kelas.id')
                ->leftJoin('guru', 'kelas.id_guru_wali', '=', 'guru.id_guru')
                ->where('anggota_kelas.siswa_id', $siswaId)
                ->select('kelas.nama_kelas', 'guru.nama_lengkap as nama_wali')
                ->first();

            return response()->json([
                'status' => 'success',
                'data' => [
                    'is_validated' => false,
                    'status_validasi' => $rapor->status_validasi ?? 'draft',
                    'tahun_ajaran' => $rapor->tahun_ajaran ?? '2026/2027',
                    'semester' => $rapor->semester ?? 'Ganjil',
                    'wali_kelas' => $kelasInfo->nama_wali ?? 'Wali Kelas',
                    'nama_kelas' => $kelasInfo->nama_kelas ?? '-',
                    'message' => 'Rapor Sumatif Tengah Semester (STS) belum divalidasi oleh Wali Kelas. Rapor resmi hanya dapat diakses dalam format PDF setelah proses validasi selesai.',
                    'daftar_nilai' => []
                ]
            ]);
        }

        // 21 Subject Definitions
        $subjects = [
            ['key' => 'nilai_pai', 'kategori' => 'Kurikulum Nasional (Umum)', 'mapel' => 'Pendidikan Agama Islam (PAI)'],
            ['key' => 'nilai_ppkn', 'kategori' => 'Kurikulum Nasional (Umum)', 'mapel' => 'Pendidikan Pancasila & Kewarganegaraan (PPKn)'],
            ['key' => 'nilai_indo', 'kategori' => 'Kurikulum Nasional (Umum)', 'mapel' => 'Bahasa Indonesia'],
            ['key' => 'nilai_mtk', 'kategori' => 'Kurikulum Nasional (Umum)', 'mapel' => 'Matematika Umum'],
            ['key' => 'nilai_inggris', 'kategori' => 'Kurikulum Nasional (Umum)', 'mapel' => 'Bahasa Inggris'],
            ['key' => 'nilai_seni', 'kategori' => 'Kurikulum Nasional (Umum)', 'mapel' => 'Seni Budaya'],
            ['key' => 'nilai_penjas', 'kategori' => 'Kurikulum Nasional (Umum)', 'mapel' => 'Pendidikan Jasmani, Olahraga & Kesehatan (PJOK)'],
            ['key' => 'nilai_informa', 'kategori' => 'Kurikulum Nasional (Umum)', 'mapel' => 'Informatika'],
            ['key' => 'nilai_sejarah', 'kategori' => 'Kurikulum Nasional (Umum)', 'mapel' => 'Sejarah Indonesia'],
            ['key' => 'nilai_biologi', 'kategori' => 'Peminatan MIPA & SOSHUM', 'mapel' => 'Biologi'],
            ['key' => 'nilai_fisika', 'kategori' => 'Peminatan MIPA & SOSHUM', 'mapel' => 'Fisika'],
            ['key' => 'nilai_kimia', 'kategori' => 'Peminatan MIPA & SOSHUM', 'mapel' => 'Kimia'],
            ['key' => 'nilai_geografi', 'kategori' => 'Peminatan MIPA & SOSHUM', 'mapel' => 'Geografi'],
            ['key' => 'nilai_sosiologi', 'kategori' => 'Peminatan MIPA & SOSHUM', 'mapel' => 'Sosiologi'],
            ['key' => 'nilai_ekonomi', 'kategori' => 'Peminatan MIPA & SOSHUM', 'mapel' => 'Ekonomi'],
            ['key' => 'nilai_pkwu', 'kategori' => 'Peminatan MIPA & SOSHUM', 'mapel' => 'Prakarya & Kewirausahaan (PKWU)'],
            ['key' => 'nilai_alquran', 'kategori' => 'Muatan Khusus Pesantren Tebuireng', 'mapel' => 'Al-Quran & Tajwid'],
            ['key' => 'nilai_akhlaq', 'kategori' => 'Muatan Khusus Pesantren Tebuireng', 'mapel' => 'Akhlaqul Karimah'],
            ['key' => 'nilai_fiqih', 'kategori' => 'Muatan Khusus Pesantren Tebuireng', 'mapel' => 'Fiqih Ibadah'],
            ['key' => 'nilai_nahwu', 'kategori' => 'Muatan Khusus Pesantren Tebuireng', 'mapel' => 'Nahwu & Sharaf'],
            ['key' => 'nilai_aswaja', 'kategori' => 'Muatan Khusus Pesantren Tebuireng', 'mapel' => 'Aswaja (Ke-NU-an)'],
        ];

        $daftarNilai = [];
        $gradedScores = [];

        foreach ($subjects as $s) {
            $k = $s['key'];
            $score = ($rapor && isset($rapor->$k)) ? (int)$rapor->$k : 0;
            $isGraded = $score > 0;

            if ($isGraded) {
                $gradedScores[] = $score;
            }

            $daftarNilai[] = [
                'kategori' => $s['kategori'],
                'mapel' => $s['mapel'],
                'nilai' => $isGraded ? $score : null,
                'status' => $isGraded ? ($score >= 75 ? 'Tuntas' : 'Remedial') : 'Belum Diinput',
                'is_dinilai' => $isGraded,
            ];
        }

        $realRataRata = count($gradedScores) > 0 ? round(array_sum($gradedScores) / count($gradedScores), 2) : 0;

        return response()->json([
            'status' => 'success',
            'data' => [
                'is_validated' => true,
                'pdf_url' => '/api/v1/portal-siswa/rapor-pdf',
                'tahun_ajaran' => $rapor->tahun_ajaran ?? '2026/2027',
                'semester' => $rapor->semester ?? 'Ganjil',
                'kktp' => $rapor->kktp ?? 75,
                'rata_rata' => $realRataRata,
                'mapel_dinilai_count' => count($gradedScores),
                'total_mapel' => count($subjects),
                'status_validasi' => $rapor->status_validasi ?? 'draft',
                'catatan_wali_kelas' => ($rapor && !empty($rapor->catatan_wali_kelas)) ? $rapor->catatan_wali_kelas : null,
                'daftar_nilai' => $daftarNilai
            ]
        ]);
    }

    /**
     * Download / Stream Lembar Resmi PDF Rapor STS untuk Santri
     * Hanya dapat diakses jika rapor telah divalidasi oleh Wali Kelas
     */
    public function raporPdf(Request $request)
    {
        $siswaId = $this->getAuthenticatedSiswaId($request);

        $siswa = DB::table('siswa as s')
            ->leftJoin('anggota_kelas as ak', 's.id', '=', 'ak.siswa_id')
            ->leftJoin('kelas as k', 'ak.kelas_id', '=', 'k.id')
            ->leftJoin('guru as g', 'k.id_guru_wali', '=', 'g.id_guru')
            ->select('s.id as siswa_id', 's.nama', 's.nis', 's.nisn', 'k.nama_kelas', 'k.tingkat', 'g.nama_lengkap as nama_wali')
            ->where('s.id', $siswaId)
            ->first();

        if (!$siswa) {
            return response()->json(['status' => 'error', 'message' => 'Data santri tidak ditemukan.'], 404);
        }

        $activeSemRow = DB::table('semester')->where('is_active', true)->first();
        $activeTaRow = DB::table('tahun_ajaran')->where('is_active', true)->first();
        $semester = $request->get('semester', $activeSemRow ? $activeSemRow->nama : 'Ganjil');
        $tahunAjaran = $request->get('tahun_ajaran', $activeTaRow ? $activeTaRow->nama : '2026/2027');
        $altTa = str_contains($tahunAjaran, '/') ? str_replace('/', '-', $tahunAjaran) : str_replace('-', '/', $tahunAjaran);

        $rapor = DB::table('rapor_sts')
            ->where('siswa_id', $siswaId)
            ->whereIn('tahun_ajaran', [$tahunAjaran, $altTa])
            ->where('semester', $semester)
            ->first();

        if (!$rapor || !in_array($rapor->status_validasi, ['approved_by_walikelas', 'approved_by_kepsek'])) {
            return response()->json([
                'status' => 'error',
                'message' => 'Rapor STS belum divalidasi oleh Wali Kelas. Rapor resmi hanya dapat diakses setelah divalidasi.'
            ], 403);
        }

        $profilSekolah = DB::table('profil_sekolah')->first();
        $namaKepsek = $profilSekolah ? $profilSekolah->kepala_sekolah : 'NIKMATURROHMAH, M.Pd.';

        $fakeKelas = (object)[
            'nama_kelas' => $siswa->nama_kelas ?? '-',
            'nama_wali' => $siswa->nama_wali ?? '-',
        ];

        $raporController = app(\App\Http\Controllers\Api\RaporController::class);
        $pdfBinary = $raporController->generateRaporPdfBinary($siswa, $fakeKelas, $rapor, $semester, $tahunAjaran, $namaKepsek);

        $safeNama = preg_replace('/[^A-Za-z0-9_]/', '_', $siswa->nama);
        $pdfName = "Rapor_STS_{$siswa->nis}_{$safeNama}.pdf";

        return response($pdfBinary, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="' . $pdfName . '"',
        ]);
    }

    /**
     * 4. GET /v1/portal-siswa/jadwal
     * Jadwal Pelajaran Mingguan sesuai Kelas Santri (Read-Only)
     */
    public function jadwal(Request $request)
    {
        $siswaId = $this->getAuthenticatedSiswaId($request);

        $anggotaKelas = DB::table('anggota_kelas')->where('siswa_id', $siswaId)->first();
        if (!$anggotaKelas) {
            return response()->json(['status' => 'success', 'data' => []]);
        }

        $jadwal = DB::table('jadwal_pelajaran')
            ->join('mata_pelajaran', 'jadwal_pelajaran.mapel_id', '=', 'mata_pelajaran.id')
            ->leftJoin('guru', 'jadwal_pelajaran.id_guru', '=', 'guru.id_guru')
            ->where('jadwal_pelajaran.kelas_id', $anggotaKelas->kelas_id)
            ->select(
                'jadwal_pelajaran.hari',
                'jadwal_pelajaran.jam_ke',
                'jadwal_pelajaran.jam_mulai',
                'jadwal_pelajaran.jam_selesai',
                'mata_pelajaran.nama_mapel',
                'mata_pelajaran.kode as kode_mapel',
                'guru.nama_lengkap as nama_guru'
            )
            ->orderByRaw("CASE 
                WHEN jadwal_pelajaran.hari = 'Senin' THEN 1 
                WHEN jadwal_pelajaran.hari = 'Selasa' THEN 2 
                WHEN jadwal_pelajaran.hari = 'Rabu' THEN 3 
                WHEN jadwal_pelajaran.hari = 'Kamis' THEN 4 
                WHEN jadwal_pelajaran.hari = 'Jumat' THEN 5 
                WHEN jadwal_pelajaran.hari = 'Sabtu' THEN 6 
                ELSE 7 END")
            ->orderBy('jadwal_pelajaran.jam_ke')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $jadwal
        ]);
    }

    /**
     * 5. GET /v1/portal-siswa/kedisiplinan-prestasi
     * Riwayat prestasi yang diraih dan catatan kedisiplinan (Read-Only)
     */
    public function kedisiplinanPrestasi(Request $request)
    {
        $siswaId = $this->getAuthenticatedSiswaId($request);

        $prestasi = DB::table('bk_prestasi')
            ->where('siswa_id', $siswaId)
            ->orderBy('tanggal', 'desc')
            ->get();

        $pelanggaran = DB::table('bk_pelanggaran')
            ->where('siswa_id', $siswaId)
            ->select(
                'id',
                'jenis_pelanggaran',
                'kategori_bobot',
                'poin',
                'tanggal',
                'tindakan_penanganan',
                'status_publik'
            )
            ->orderBy('tanggal', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'prestasi' => $prestasi,
                'pelanggaran' => $pelanggaran,
                'total_poin_pelanggaran' => (int)$pelanggaran->sum('poin')
            ]
        ]);
    }

    /**
     * 6. GET /v1/portal-siswa/perpustakaan
     * Riwayat dan status pinjaman buku aktif di perpustakaan sekolah (Read-Only)
     */
    public function perpustakaan(Request $request)
    {
        $siswaId = $this->getAuthenticatedSiswaId($request);

        $peminjaman = DB::table('peminjaman_buku')
            ->join('buku_perpustakaan', 'peminjaman_buku.buku_id', '=', 'buku_perpustakaan.id')
            ->where('peminjaman_buku.siswa_id', $siswaId)
            ->select(
                'peminjaman_buku.id',
                'buku_perpustakaan.judul as judul_buku',
                'buku_perpustakaan.pengarang as penulis',
                'buku_perpustakaan.kategori',
                'peminjaman_buku.tgl_pinjam as tanggal_pinjam',
                'peminjaman_buku.tgl_tenggat as tanggal_jatuh_tempo',
                'peminjaman_buku.tgl_kembali as tanggal_kembali',
                'peminjaman_buku.status_denda'
            )
            ->orderBy('peminjaman_buku.tgl_pinjam', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $peminjaman
        ]);
    }
}
