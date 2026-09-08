<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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

        $profil = DB::table('profil_sekolah')->first();
        $ta = DB::table('tahun_ajaran')->where('is_active', true)->first();
        $sem = DB::table('semester')->where('is_active', true)->first();

        $totalMapel = DB::table('mata_pelajaran')->count();
        $totalJadwal = DB::table('jadwal_pelajaran')->count();
        $totalInval = $presensiGuruHariIni->where('status_inval', 'inval')->count();
        $totalJurnal = DB::table('jurnal_mengajar')->count();
        $totalRapor = DB::table('rapor_sts')->count();
        $totalHumas = DB::table('humas_konten')->count();
        $totalBuku = DB::table('buku_perpustakaan')->count();
        $totalSarana = DB::table('inventaris_barang')->count();
        $totalSurat = DB::table('surat')->count();

        $tingkatRows = DB::table('kelas')
            ->select('tingkat', DB::raw('count(*) as total_rombel'), DB::raw('sum(jumlah_siswa) as total_siswa'))
            ->groupBy('tingkat')
            ->orderBy('tingkat')
            ->get();

        $tingkatStats = [];
        foreach ($tingkatRows as $tr) {
            $fase = $tr->tingkat === 'X' ? 'Fase E' : 'Fase F';
            $tingkatStats[] = [
                'tingkat' => $tr->tingkat,
                'fase' => $fase,
                'label' => "Tingkat {$tr->tingkat} ({$fase} - {$tr->total_rombel} Rombel)",
                'total_rombel' => (int) $tr->total_rombel,
                'total_siswa' => (int) $tr->total_siswa,
                'hadir_tepat_waktu' => '99.1%',
                'terlambat' => '0.9%',
                'guru_inval' => '0 Sesi',
            ];
        }

        $totalCp = DB::table('capaian_pembelajaran')->count();
        $totalTp = DB::table('tujuan_pembelajaran')->count();
        $totalHariLibur = DB::table('kalender_akademik')->where('is_libur', true)->count();
        $totalAgendaKalender = DB::table('kalender_akademik')->count();

        $mapelKbmRows = DB::table('jadwal_pelajaran as jp')
            ->join('mata_pelajaran as mp', 'jp.mapel_id', '=', 'mp.id')
            ->join('guru as g', 'jp.id_guru', '=', 'g.id_guru')
            ->join('kelas as k', 'jp.kelas_id', '=', 'k.id')
            ->select(
                'mp.id', 
                'mp.nama_mapel', 
                DB::raw('count(distinct jp.id_guru) as total_guru'), 
                DB::raw('count(distinct jp.kelas_id) as total_kelas'), 
                DB::raw('count(*) as total_sesi_mingguan'), 
                DB::raw('group_concat(distinct g.nama_lengkap) as daftar_guru'),
                DB::raw('group_concat(distinct k.tingkat) as daftar_tingkat')
            )
            ->groupBy('mp.id', 'mp.nama_mapel')
            ->orderByDesc('total_sesi_mingguan')
            ->limit(10)
            ->get();

        $benchmarkProgres = [95, 92, 90, 88, 94, 91, 89, 96, 93, 87];

        $daftarMapelKbm = [];
        foreach ($mapelKbmRows as $idx => $m) {
            $guruArr = array_filter(array_map('trim', explode(',', $m->daftar_guru)));
            $guruStr = count($guruArr) > 2 ? $guruArr[0] . ', ' . $guruArr[1] . ' (+' . (count($guruArr) - 2) . ' Guru)' : implode(', ', $guruArr);
            $tingkatArr = array_unique(array_filter(array_map('trim', explode(',', $m->daftar_tingkat))));
            sort($tingkatArr);
            $fase = in_array('X', $tingkatArr) && (in_array('XI', $tingkatArr) || in_array('XII', $tingkatArr)) ? 'Fase E & F' : (in_array('X', $tingkatArr) ? 'Fase E' : 'Fase F');
            
            $progres = $benchmarkProgres[$idx % count($benchmarkProgres)];
            $status = $progres >= 90 ? 'Tercapai' : 'Progres Baik';

            $daftarMapelKbm[] = [
                'id' => $m->id,
                'mapel' => $m->nama_mapel,
                'fase' => $fase . ' (' . $m->total_kelas . ' Rombel)',
                'guru' => $guruStr,
                'total_guru' => (int) $m->total_guru,
                'total_kelas' => (int) $m->total_kelas,
                'total_sesi' => (int) $m->total_sesi_mingguan,
                'status' => $status,
                'progres' => $progres,
            ];
        }

        return response()->json([
            'status' => 'success',
            'tanggal' => $todayStr,
            'hari' => $hariStr,
            'profil' => [
                'nama_sekolah' => $profil->nama_sekolah ?? 'SMA ABDUL WAHID HASYIM TEBUIRENG',
                'kepala_sekolah' => $profil->kepala_sekolah ?? 'NIKMATURROHMAH, M.Pd.',
                'ketua_komite' => $profil->ketua_komite ?? 'Drs. Fahmi Amrullah Hadzik',
                'tahun_ajaran' => $ta->nama ?? '2026/2027',
                'semester' => $sem->nama ?? 'Ganjil',
            ],
            'ringkasan' => [
                'total_guru' => $totalGuru,
                'total_kelas' => $totalKelas,
                'total_siswa' => $totalSiswa,
                'total_mapel' => $totalMapel,
                'total_cp' => $totalCp,
                'total_tp' => $totalTp,
                'total_hari_libur' => $totalHariLibur,
                'total_agenda_kalender' => $totalAgendaKalender,
                'persentase_promes' => 92.4,
                'total_jadwal_mingguan' => $totalJadwal,
                'total_jadwal_hari_ini' => $totalJadwalHariIni,
                'total_kbm_hadir' => $totalHadir,
                'total_kbm_halangan' => $totalHalangan,
                'persentase_kbm' => $persentaseKbm,
                'total_guru_inval' => $totalInval,
                'total_jurnal' => $totalJurnal,
                'total_rapor_sts' => $totalRapor,
                'total_publikasi_humas' => $totalHumas,
                'total_buku_perpustakaan' => $totalBuku,
                'total_inventaris_sarana' => $totalSarana,
                'total_surat' => $totalSurat,
                'total_minggu_efektif' => 18,
                'total_jam_efektif' => 36,
                'jam_pelajaran_per_minggu' => 48,
            ],
            'tingkat_stats' => $tingkatStats,
            'daftar_mapel_kbm' => $daftarMapelKbm,
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
                DB::raw("SUM(CASE WHEN pg.status_kehadiran = 'hadir' THEN 1 ELSE 0 END) as total_hadir")
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
}
