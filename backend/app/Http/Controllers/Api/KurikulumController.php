<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Services\SimantebSyncService;

class KurikulumController extends Controller
{
    public function getDashboardStats()
    {
        $todayStr = date('Y-m-d');
        $hariStr = date('N') == 7 ? 'Minggu' : ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][date('N') - 1];

        $totalGuru = DB::table('guru')->where('status_aktif', true)->count();
        $totalKelas = DB::table('kelas')->count();
        $totalSiswa = DB::table('siswa')->where('status_aktif', true)->count();

        // Total scheduled lessons for today
        $totalJadwalHariIni = DB::table('jadwal_pelajaran')->where('hari', $hariStr)->count();

        // Completed / Ongoing presensi guru today
        $presensiGuruHariIni = DB::table('presensi_guru')->whereDate('created_at', $todayStr)->get();
        $totalHadir = $presensiGuruHariIni->where('status_kehadiran', 'hadir')->count();
        $totalHalangan = $presensiGuruHariIni->whereIn('status_kehadiran', ['sakit', 'izin', 'dinas', 'alpa'])->count();

        $persentaseKbm = $totalJadwalHariIni > 0 ? round(($totalHadir / $totalJadwalHariIni) * 100, 1) : 0;

        // Recent teaching journals
        $recentJournals = DB::table('jurnal_mengajar as jm')
            ->join('presensi_guru as pg', 'jm.presensi_guru_id', '=', 'pg.id')
            ->join('jadwal_pelajaran as jp', 'pg.jadwal_id', '=', 'jp.id')
            ->join('kelas as k', 'jp.kelas_id', '=', 'k.id')
            ->join('mata_pelajaran as mp', 'jp.mapel_id', '=', 'mp.id')
            ->join('guru as g', 'pg.id_guru', '=', 'g.id_guru')
            ->select('jm.id', 'g.nama_lengkap', 'k.nama_kelas', 'mp.nama_mapel', 'jm.bab_materi', 'jm.catatan_kelas', 'jm.created_at')
            ->whereDate('jm.created_at', $todayStr)
            ->orderByDesc('jm.id')
            ->limit(10)
            ->get();

        return response()->json([
            'status' => 'success',
            'tanggal' => $todayStr,
            'hari' => $hariStr,
            'ringkasan' => [
                'total_guru' => $totalGuru,
                'total_kelas' => $totalKelas,
                'total_siswa' => $totalSiswa,
                'total_jadwal_hari_ini' => $totalJadwalHariIni,
                'total_kbm_hadir' => $totalHadir,
                'total_kbm_halangan' => $totalHalangan,
                'persentase_kbm' => $persentaseKbm,
            ],
            'jurnal_terbaru' => $recentJournals,
        ]);
    }

    public function getRekapJamMengajar(Request $request)
    {
        $bulan = $request->get('bulan', date('m'));
        $tahun = $request->get('tahun', date('Y'));

        $rekap = DB::table('presensi_guru as pg')
            ->join('guru as g', 'pg.id_guru', '=', 'g.id_guru')
            ->join('jadwal_pelajaran as jp', 'pg.jadwal_id', '=', 'jp.id')
            ->join('mata_pelajaran as mp', 'jp.mapel_id', '=', 'mp.id')
            ->select(
                'g.id_guru',
                'g.nama_lengkap',
                DB::raw('COUNT(pg.id) as total_sesi'),
                DB::raw("SUM(CASE WHEN pg.status_kehadiran = 'hadir' THEN 1 ELSE 0 END) as total_hadir"),
                DB::raw("SUM(CASE WHEN pg.status_inval = 'inval_diklaim' THEN 1 ELSE 0 END) as total_inval")
            )
            ->whereMonth('pg.created_at', $bulan)
            ->whereYear('pg.created_at', $tahun)
            ->groupBy('g.id_guru', 'g.nama_lengkap')
            ->get();

        return response()->json([
            'status' => 'success',
            'bulan' => (int) $bulan,
            'tahun' => (int) $tahun,
            'rekap_guru' => $rekap,
        ]);
    }

    public function triggerSimantebSync(Request $request)
    {
        $tanggal = $request->get('tanggal', date('Y-m-d'));
        $result = SimantebSyncService::syncDailyAttendance($tanggal);
        return response()->json($result);
    }
}
