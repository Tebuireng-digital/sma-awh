<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AdminPengaturanController;
use App\Http\Controllers\Api\GuruPresensiController;
use App\Http\Controllers\Api\JurnalMengajarController;
use App\Http\Controllers\Api\PresensiMuridController;
use App\Http\Controllers\Api\KurikulumController;
use App\Http\Controllers\Api\KalenderAkademikController;
use App\Http\Controllers\Api\AdminMasterController;

Route::prefix('v1')->group(function () {

    // Public Auth Route (Dengan Proteksi Brute-Force Rate Limiting 5x / menit)
    Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:login');
    Route::post('/auth/login-siswa', [AuthController::class, 'loginSiswa'])->middleware('throttle:login');
    Route::get('/humas/konten-publik', [\App\Http\Controllers\Api\HumasController::class, 'getKontenPublik']);
    Route::get('/humas/konten-publik/{idOrSlug}', [\App\Http\Controllers\Api\HumasController::class, 'detailKontenPublik']);

    // Protected Routes (Sanctum)
    Route::middleware('auth:sanctum')->group(function () {
        // User Auth
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/change-password', [AuthController::class, 'changePassword']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);

        // Admin & Settings
        Route::get('/admin/pengaturan', [AdminPengaturanController::class, 'getPengaturan']);
        Route::post('/admin/pengaturan', [AdminPengaturanController::class, 'updatePengaturan']);
        Route::get('/admin/semester', [AdminPengaturanController::class, 'getSemester']);
        Route::post('/admin/semester/toggle', [AdminPengaturanController::class, 'toggleSemester']);
        Route::get('/admin/tahun-ajaran', [AdminPengaturanController::class, 'getTahunAjaran']);
        Route::post('/admin/tahun-ajaran', [AdminPengaturanController::class, 'updateTahunAjaran']);

        // Admin Master Data CRUD (Guru, Kelas, Siswa)
        Route::get('/admin/guru', [AdminMasterController::class, 'indexGuru']);
        Route::post('/admin/guru', [AdminMasterController::class, 'storeGuru']);
        Route::put('/admin/guru/{id}', [AdminMasterController::class, 'updateGuru']);
        Route::delete('/admin/guru/{id}', [AdminMasterController::class, 'destroyGuru']);

        Route::get('/admin/kelas', [AdminMasterController::class, 'indexKelas']);
        Route::post('/admin/kelas', [AdminMasterController::class, 'storeKelas']);
        Route::put('/admin/kelas/{id}', [AdminMasterController::class, 'updateKelas']);
        Route::delete('/admin/kelas/{id}', [AdminMasterController::class, 'destroyKelas']);

        Route::get('/admin/siswa', [AdminMasterController::class, 'indexSiswa']);
        Route::post('/admin/siswa', [AdminMasterController::class, 'storeSiswa']);
        Route::put('/admin/siswa/{id}', [AdminMasterController::class, 'updateSiswa']);
        Route::delete('/admin/siswa/{id}', [AdminMasterController::class, 'destroySiswa']);

        // Admin Master Data CRUD (Mapel & Jadwal)
        Route::get('/admin/mapel', [\App\Http\Controllers\Api\AdminJadwalController::class, 'indexMapel']);
        Route::post('/admin/mapel', [\App\Http\Controllers\Api\AdminJadwalController::class, 'storeMapel']);
        Route::put('/admin/mapel/{id}', [\App\Http\Controllers\Api\AdminJadwalController::class, 'updateMapel']);
        Route::delete('/admin/mapel/{id}', [\App\Http\Controllers\Api\AdminJadwalController::class, 'destroyMapel']);

        Route::get('/admin/jadwal', [\App\Http\Controllers\Api\AdminJadwalController::class, 'indexJadwal']);
        Route::get('/admin/jadwal/export', [\App\Http\Controllers\Api\AdminJadwalController::class, 'exportJadwalMatrix']);
        Route::post('/admin/jadwal', [\App\Http\Controllers\Api\AdminJadwalController::class, 'storeJadwal']);
        Route::put('/admin/jadwal/{id}', [\App\Http\Controllers\Api\AdminJadwalController::class, 'updateJadwal']);
        Route::delete('/admin/jadwal/{id}', [\App\Http\Controllers\Api\AdminJadwalController::class, 'destroyJadwal']);

        // Kalender Akademik (Libur & Acara Pondok Tebuireng)
        Route::get('/admin/kalender-akademik', [KalenderAkademikController::class, 'index']);
        Route::post('/admin/kalender-akademik', [KalenderAkademikController::class, 'store']);
        Route::delete('/admin/kalender-akademik/{id}', [KalenderAkademikController::class, 'destroy']);
        Route::post('/admin/tahun-ajaran-rollover', [KalenderAkademikController::class, 'rolloverTahunAjaran']);

        // Guru & Presensi KBM
        Route::get('/guru/jadwal-hari-ini', [GuruPresensiController::class, 'getJadwalHariIni']);
        Route::post('/guru/presensi-masuk', [GuruPresensiController::class, 'presensiMasuk']);
        Route::post('/guru/presensi-selesai/{id}', [GuruPresensiController::class, 'presensiSelesai']);

        // Jurnal Mengajar
        Route::post('/guru/jurnal-mengajar', [JurnalMengajarController::class, 'store']);
        Route::get('/guru/jurnal-mengajar/{id}', [JurnalMengajarController::class, 'show']);

        // Presensi Murid (Fast Checklist)
        Route::get('/master/kelas', [PresensiMuridController::class, 'getDaftarKelas']);
        Route::get('/guru/siswa-kelas/{kelas_id}', [PresensiMuridController::class, 'getDaftarSiswaKelas']);
        Route::post('/guru/presensi-murid', [PresensiMuridController::class, 'storePresensiMurid']);

        // Waka Kurikulum Monitoring
        Route::get('/kurikulum/dashboard-stats', [KurikulumController::class, 'getDashboardStats']);
        Route::get('/kurikulum/rekap-jam-mengajar', [KurikulumController::class, 'getRekapJamMengajar']);

        // Rapor STS (RAPOR STS X-1.docx)
        Route::get('/rapor-sts-access/my-permissions', [\App\Http\Controllers\Api\RaporController::class, 'myAccess']);
        Route::get('/rapor-sts/mapel-kelas', [\App\Http\Controllers\Api\RaporController::class, 'getNilaiMapelKelas']);
        Route::post('/rapor-sts/mapel-kelas', [\App\Http\Controllers\Api\RaporController::class, 'storeNilaiMapelKelas']);
        Route::get('/rapor-sts/walikelas-view', [\App\Http\Controllers\Api\RaporController::class, 'getWaliKelasRapor']);
        Route::post('/rapor-sts/{siswa_id}/catatan-walikelas', [\App\Http\Controllers\Api\RaporController::class, 'saveCatatanWaliKelas']);
        Route::post('/rapor-sts/{siswa_id}/cancel-validasi', [\App\Http\Controllers\Api\RaporController::class, 'cancelValidasiWaliKelas']);
        Route::post('/rapor-sts/bulk-approve-walikelas', [\App\Http\Controllers\Api\RaporController::class, 'bulkApproveWaliKelas']);
        Route::post('/rapor-sts/bulk-cancel-validasi', [\App\Http\Controllers\Api\RaporController::class, 'bulkCancelValidasiWaliKelas']);
        Route::get('/rapor-sts', [\App\Http\Controllers\Api\RaporController::class, 'index']);
        Route::get('/rapor-sts/{siswa_id}', [\App\Http\Controllers\Api\RaporController::class, 'show']);
        Route::post('/rapor-sts', [\App\Http\Controllers\Api\RaporController::class, 'storeOrUpdate']);
        Route::post('/rapor-sts/{siswa_id}/submit', [\App\Http\Controllers\Api\RaporController::class, 'submitToWaliKelas']);
        Route::post('/rapor-sts/{siswa_id}/approve-walikelas', [\App\Http\Controllers\Api\RaporController::class, 'approveWaliKelas']);
        Route::post('/rapor-sts/{siswa_id}/approve-kepsek', [\App\Http\Controllers\Api\RaporController::class, 'approveKepsek']);
        Route::post('/rapor-sts/{siswa_id}/reset', [\App\Http\Controllers\Api\RaporController::class, 'resetToDraft']);
        Route::get('/rapor-sts/{siswa_id}/export', [\App\Http\Controllers\Api\RaporController::class, 'exportExcel']);

        // Modul Kepegawaian (HRD)
        Route::get('/kepegawaian/pegawai', [\App\Http\Controllers\Api\ModuleRevisiController::class, 'getPegawai']);
        Route::post('/kepegawaian/pegawai', [\App\Http\Controllers\Api\ModuleRevisiController::class, 'storePegawai']);
        Route::post('/kepegawaian/pegawai/{id}', [\App\Http\Controllers\Api\ModuleRevisiController::class, 'updatePegawai']);
        Route::get('/kepegawaian/pengajuan', [\App\Http\Controllers\Api\ModuleRevisiController::class, 'getPengajuanKepegawaian']);
        Route::post('/kepegawaian/pengajuan', [\App\Http\Controllers\Api\ModuleRevisiController::class, 'storePengajuanKepegawaian']);
        Route::post('/kepegawaian/approval/{id}', [\App\Http\Controllers\Api\ModuleRevisiController::class, 'updateApprovalKepegawaian']);
        Route::get('/kepegawaian/riwayat-jabatan', [\App\Http\Controllers\Api\ModuleRevisiController::class, 'getRiwayatJabatan']);
        Route::post('/kepegawaian/riwayat-jabatan', [\App\Http\Controllers\Api\ModuleRevisiController::class, 'storeRiwayatJabatan']);
        Route::get('/kepegawaian/penilaian-kinerja', [\App\Http\Controllers\Api\ModuleRevisiController::class, 'getPenilaianKinerja']);
        Route::post('/kepegawaian/penilaian-kinerja', [\App\Http\Controllers\Api\ModuleRevisiController::class, 'storePenilaianKinerja']);

        Route::get('/bk/siswa-list', [\App\Http\Controllers\Api\ModuleRevisiController::class, 'getBKSiswaList']);
        Route::get('/bk/catatan', [\App\Http\Controllers\Api\ModuleRevisiController::class, 'getBKCatatan']);
        Route::post('/bk/catatan', [\App\Http\Controllers\Api\ModuleRevisiController::class, 'storeBKCatatan']);
        Route::put('/bk/catatan/{id}', [\App\Http\Controllers\Api\ModuleRevisiController::class, 'updateBKCatatan']);
        Route::delete('/bk/catatan/{id}', [\App\Http\Controllers\Api\ModuleRevisiController::class, 'deleteBKCatatan']);

        Route::get('/bk/pelanggaran', [\App\Http\Controllers\Api\ModuleRevisiController::class, 'getBKPelanggaran']);
        Route::post('/bk/pelanggaran', [\App\Http\Controllers\Api\ModuleRevisiController::class, 'storeBKPelanggaran']);
        Route::put('/bk/pelanggaran/{id}', [\App\Http\Controllers\Api\ModuleRevisiController::class, 'updateBKPelanggaran']);
        Route::delete('/bk/pelanggaran/{id}', [\App\Http\Controllers\Api\ModuleRevisiController::class, 'deleteBKPelanggaran']);

        Route::get('/bk/prestasi', [\App\Http\Controllers\Api\ModuleRevisiController::class, 'getBKPrestasi']);
        Route::post('/bk/prestasi', [\App\Http\Controllers\Api\ModuleRevisiController::class, 'storeBKPrestasi']);
        Route::put('/bk/prestasi/{id}', [\App\Http\Controllers\Api\ModuleRevisiController::class, 'updateBKPrestasi']);
        Route::delete('/bk/prestasi/{id}', [\App\Http\Controllers\Api\ModuleRevisiController::class, 'deleteBKPrestasi']);

        Route::get('/bk/studi-lanjut', [\App\Http\Controllers\Api\ModuleRevisiController::class, 'getBKStudiLanjut']);
        Route::post('/bk/studi-lanjut', [\App\Http\Controllers\Api\ModuleRevisiController::class, 'storeBKStudiLanjut']);
        Route::put('/bk/studi-lanjut/{id}', [\App\Http\Controllers\Api\ModuleRevisiController::class, 'updateBKStudiLanjut']);
        Route::delete('/bk/studi-lanjut/{id}', [\App\Http\Controllers\Api\ModuleRevisiController::class, 'deleteBKStudiLanjut']);

        Route::get('/bk/absensi', [\App\Http\Controllers\Api\ModuleRevisiController::class, 'getBKAbsensi']);
        Route::post('/bk/absensi', [\App\Http\Controllers\Api\ModuleRevisiController::class, 'storeBKAbsensi']);
        Route::put('/bk/absensi/{id}', [\App\Http\Controllers\Api\ModuleRevisiController::class, 'updateBKAbsensi']);
        Route::delete('/bk/absensi/{id}', [\App\Http\Controllers\Api\ModuleRevisiController::class, 'deleteBKAbsensi']);

        Route::get('/sarana/inventaris', [\App\Http\Controllers\Api\ModuleRevisiController::class, 'getInventaris']);
        Route::post('/sarana/inventaris', [\App\Http\Controllers\Api\ModuleRevisiController::class, 'storeInventaris']);
        Route::get('/sarana/peminjaman', [\App\Http\Controllers\Api\ModuleRevisiController::class, 'getPeminjamanInventaris']);
        Route::post('/sarana/peminjaman', [\App\Http\Controllers\Api\ModuleRevisiController::class, 'storePeminjamanInventaris']);
        Route::post('/sarana/peminjaman/{id}/kembali', [\App\Http\Controllers\Api\ModuleRevisiController::class, 'kembalikanInventaris']);
        Route::get('/sarana/mutasi', [\App\Http\Controllers\Api\ModuleRevisiController::class, 'getSaranaMutasi']);
        Route::post('/sarana/mutasi', [\App\Http\Controllers\Api\ModuleRevisiController::class, 'storeSaranaMutasi']);
        Route::get('/sarana/perawatan', [\App\Http\Controllers\Api\ModuleRevisiController::class, 'getSaranaPerawatan']);
        Route::post('/sarana/perawatan', [\App\Http\Controllers\Api\ModuleRevisiController::class, 'storeSaranaPerawatan']);
        Route::post('/sarana/perawatan/{id}/status', [\App\Http\Controllers\Api\ModuleRevisiController::class, 'updateStatusPerawatan']);
        Route::get('/sarana/penghapusan', [\App\Http\Controllers\Api\ModuleRevisiController::class, 'getSaranaPenghapusan']);
        Route::post('/sarana/penghapusan', [\App\Http\Controllers\Api\ModuleRevisiController::class, 'storeSaranaPenghapusan']);
        Route::post('/sarana/penghapusan/{id}/approval', [\App\Http\Controllers\Api\ModuleRevisiController::class, 'approvePenghapusan']);

        // Persuratan & Archiving
        Route::get('/persuratan/surat', [\App\Http\Controllers\Api\ModuleRevisiController::class, 'getSurat']);
        Route::post('/persuratan/surat', [\App\Http\Controllers\Api\ModuleRevisiController::class, 'storeSurat']);
        Route::put('/persuratan/surat/{id}', [\App\Http\Controllers\Api\ModuleRevisiController::class, 'updateSurat']);
        Route::delete('/persuratan/surat/{id}', [\App\Http\Controllers\Api\ModuleRevisiController::class, 'deleteSurat']);
        Route::get('/persuratan/generate-nomor', [\App\Http\Controllers\Api\ModuleRevisiController::class, 'generateNomorSurat']);
        Route::get('/persuratan/template', [\App\Http\Controllers\Api\ModuleRevisiController::class, 'getTemplateSurat']);

        // Humas & Branding CMS
        Route::get('/humas/konten', [\App\Http\Controllers\Api\HumasController::class, 'index']);
        Route::post('/humas/konten', [\App\Http\Controllers\Api\HumasController::class, 'store']);
        Route::put('/humas/konten/{id}', [\App\Http\Controllers\Api\HumasController::class, 'update']);
        Route::delete('/humas/konten/{id}', [\App\Http\Controllers\Api\HumasController::class, 'destroy']);
        Route::post('/humas/konten/{id}/approval', [\App\Http\Controllers\Api\HumasController::class, 'approve']);
        Route::post('/humas/konten/{id}/toggle-pin', [\App\Http\Controllers\Api\HumasController::class, 'togglePin']);
        Route::post('/humas/sync-website', [\App\Http\Controllers\Api\HumasController::class, 'syncWebsite']);

        // Perpustakaan Digital
        Route::get('/perpustakaan/siswa-list', [\App\Http\Controllers\Api\ModuleRevisiController::class, 'getBKSiswaList']);
        Route::get('/perpustakaan/buku', [\App\Http\Controllers\Api\ModuleRevisiController::class, 'getBuku']);
        Route::post('/perpustakaan/buku', [\App\Http\Controllers\Api\ModuleRevisiController::class, 'storeBuku']);
        Route::put('/perpustakaan/buku/{id}', [\App\Http\Controllers\Api\ModuleRevisiController::class, 'updateBuku']);
        Route::delete('/perpustakaan/buku/{id}', [\App\Http\Controllers\Api\ModuleRevisiController::class, 'deleteBuku']);

        Route::get('/perpustakaan/peminjaman', [\App\Http\Controllers\Api\ModuleRevisiController::class, 'getPeminjamanBuku']);
        Route::post('/perpustakaan/peminjaman', [\App\Http\Controllers\Api\ModuleRevisiController::class, 'storePeminjamanBuku']);
        Route::put('/perpustakaan/peminjaman/{id}', [\App\Http\Controllers\Api\ModuleRevisiController::class, 'updatePeminjamanBuku']);
        Route::post('/perpustakaan/peminjaman/{id}/kembali', [\App\Http\Controllers\Api\ModuleRevisiController::class, 'kembalikanBuku']);
        Route::delete('/perpustakaan/peminjaman/{id}', [\App\Http\Controllers\Api\ModuleRevisiController::class, 'deletePeminjamanBuku']);

        Route::get('/perpustakaan/denda', [\App\Http\Controllers\Api\ModuleRevisiController::class, 'getDendaPerpustakaan']);
        Route::post('/perpustakaan/denda/{id}/bayar', [\App\Http\Controllers\Api\ModuleRevisiController::class, 'bayarDenda']);

        Route::get('/perpustakaan/kunjungan', [\App\Http\Controllers\Api\ModuleRevisiController::class, 'getKunjunganPerpustakaan']);
        Route::post('/perpustakaan/kunjungan', [\App\Http\Controllers\Api\ModuleRevisiController::class, 'storeKunjunganPerpustakaan']);
        Route::put('/perpustakaan/kunjungan/{id}', [\App\Http\Controllers\Api\ModuleRevisiController::class, 'updateKunjunganPerpustakaan']);
        Route::delete('/perpustakaan/kunjungan/{id}', [\App\Http\Controllers\Api\ModuleRevisiController::class, 'deleteKunjunganPerpustakaan']);

        // Portal Terpadu Santri & Wali Santri (100% Read-Only)
        Route::prefix('portal-siswa')->group(function () {
            Route::get('/ringkasan', [\App\Http\Controllers\Api\PortalSiswaController::class, 'ringkasan']);
            Route::get('/presensi', [\App\Http\Controllers\Api\PortalSiswaController::class, 'presensi']);
            Route::get('/nilai', [\App\Http\Controllers\Api\PortalSiswaController::class, 'nilai']);
            Route::get('/jadwal', [\App\Http\Controllers\Api\PortalSiswaController::class, 'jadwal']);
            Route::get('/kedisiplinan-prestasi', [\App\Http\Controllers\Api\PortalSiswaController::class, 'kedisiplinanPrestasi']);
            Route::get('/perpustakaan', [\App\Http\Controllers\Api\PortalSiswaController::class, 'perpustakaan']);
        });
    });
});
