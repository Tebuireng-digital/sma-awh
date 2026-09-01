<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AdminPengaturanController;
use App\Http\Controllers\Api\GuruPresensiController;
use App\Http\Controllers\Api\JurnalMengajarController;
use App\Http\Controllers\Api\PresensiMuridController;
use App\Http\Controllers\Api\KurikulumController;
use App\Http\Controllers\Api\PerangkatAjarController;
use App\Http\Controllers\Api\KalenderAkademikController;
use App\Http\Controllers\Api\AdminMasterController;

Route::prefix('v1')->group(function () {

    // Public Auth Route
    Route::post('/auth/login', [AuthController::class, 'login']);

    // SIMANTEB Sync Webhook Endpoint
    Route::post('/integrasi/absen-sekolah', [KurikulumController::class, 'triggerSimantebSync']);

    // Protected Routes (Sanctum)
    Route::middleware('auth:sanctum')->group(function () {
        // User Auth
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/change-password', [AuthController::class, 'changePassword']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);

        // Admin & Settings
        Route::get('/admin/pengaturan', [AdminPengaturanController::class, 'getPengaturan']);
        Route::post('/admin/pengaturan', [AdminPengaturanController::class, 'updatePengaturan']);
        Route::get('/admin/wa-status', [AdminPengaturanController::class, 'getWaStatus']);
        Route::post('/admin/wa-disconnect', [AdminPengaturanController::class, 'disconnectWa']);
        Route::post('/admin/wa-test', [AdminPengaturanController::class, 'sendTestWa']);
        Route::post('/admin/wa-rekap-bulanan', [PresensiMuridController::class, 'sendRekapBulananWa']);

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

        // Kalender Akademik (Libur & Acara Pondok Tebuireng)
        Route::get('/admin/kalender-akademik', [KalenderAkademikController::class, 'index']);
        Route::post('/admin/kalender-akademik', [KalenderAkademikController::class, 'store']);
        Route::delete('/admin/kalender-akademik/{id}', [KalenderAkademikController::class, 'destroy']);
        Route::post('/admin/tahun-ajaran-rollover', [KalenderAkademikController::class, 'rolloverTahunAjaran']);

        // Perangkat Ajar (CP, TP, Prota, Promes)
        Route::get('/kurikulum/perangkat-ajar', [PerangkatAjarController::class, 'index']);
        Route::post('/kurikulum/perangkat-ajar/cp-tp', [PerangkatAjarController::class, 'storeCpTp']);
        Route::post('/kurikulum/perangkat-ajar/import-excel', [PerangkatAjarController::class, 'importExcelPromes']);
        Route::get('/kurikulum/perangkat-ajar/template-excel', [PerangkatAjarController::class, 'exportTemplatePromes']);

        // Guru & Presensi KBM
        Route::get('/guru/jadwal-hari-ini', [GuruPresensiController::class, 'getJadwalHariIni']);
        Route::post('/guru/presensi-masuk', [GuruPresensiController::class, 'presensiMasuk']);
        Route::post('/guru/presensi-selesai/{id}', [GuruPresensiController::class, 'presensiSelesai']);

        // Guru Piket / Inval
        Route::get('/piket/kelas-kosong', [GuruPresensiController::class, 'getKelasKosongPiket']);
        Route::post('/piket/klaim-inval', [GuruPresensiController::class, 'klaimInval']);

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
        Route::post('/kurikulum/simanteb-sync', [KurikulumController::class, 'triggerSimantebSync']);
    });
});
