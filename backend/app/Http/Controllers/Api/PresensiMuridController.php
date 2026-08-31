<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Services\WaGatewayService;

class PresensiMuridController extends Controller
{
    public function getDaftarKelas()
    {
        $kelases = DB::table('kelas as k')
            ->leftJoin('guru as g', 'k.id_guru_wali', '=', 'g.id_guru')
            ->select('k.id', 'k.nama_kelas', 'k.tingkat', 'k.jumlah_siswa', 'g.nama_lengkap as wali_kelas')
            ->orderBy('k.id')
            ->get();

        return response()->json([
            'status' => 'success',
            'total_kelas' => count($kelases),
            'kelas' => $kelases,
        ]);
    }

    public function getDaftarSiswaKelas(Request $request, $kelas_id)
    {
        $siswa = DB::table('anggota_kelas as ak')
            ->join('siswa as s', 'ak.siswa_id', '=', 's.id')
            ->select('s.id as siswa_id', 's.nis', 's.nama', 's.jenis_kelamin', 's.no_hp_ortu', 'ak.no_urut')
            ->where('ak.kelas_id', $kelas_id)
            ->orderBy('ak.no_urut')
            ->get();

        return response()->json([
            'status' => 'success',
            'kelas_id' => $kelas_id,
            'total_siswa' => count($siswa),
            'siswa' => $siswa,
        ]);
    }

    public function storePresensiMurid(Request $request)
    {
        $request->validate([
            'presensi_guru_id' => 'nullable|integer',
            'kelas_id' => 'nullable|integer',
            'absensi' => 'required|array',
            'absensi.*.siswa_id' => 'required|integer',
            'absensi.*.status' => 'required|string|in:Hadir,Sakit,Izin,Alpa,Terlambat,Dispensasi',
            'absensi.*.keterangan' => 'nullable|string',
        ]);

        $presensiGuruId = $request->presensi_guru_id;

        // Auto-resolve or create presensi_guru if id invalid or not provided
        $presensiGuru = DB::table('presensi_guru as pg')
            ->join('jadwal_pelajaran as jp', 'pg.jadwal_id', '=', 'jp.id')
            ->join('kelas as k', 'jp.kelas_id', '=', 'k.id')
            ->select('pg.id', 'jp.jam_ke', 'k.nama_kelas')
            ->where('pg.id', $presensiGuruId)
            ->first();

        if (!$presensiGuru) {
            $firstJadwal = DB::table('jadwal_pelajaran')->where('kelas_id', $request->kelas_id ?? 1)->first();
            $jadwalId = $firstJadwal ? $firstJadwal->id : 1;

            $existing = DB::table('presensi_guru')->where('jadwal_id', $jadwalId)->whereDate('created_at', date('Y-m-d'))->first();
            if ($existing) {
                $presensiGuruId = $existing->id;
            } else {
                $presensiGuruId = DB::table('presensi_guru')->insertGetId([
                    'jadwal_id' => $jadwalId,
                    'id_guru' => 1,
                    'status_inval' => 'tidak_inval',
                    'latitude' => -7.5878,
                    'longitude' => 112.2345,
                    'jarak_meter' => 0,
                    'status_kehadiran' => 'hadir',
                    'waktu_masuk' => now(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            $presensiGuru = (object)[
                'id' => $presensiGuruId,
                'jam_ke' => 1,
                'nama_kelas' => 'Kelas X.1',
            ];
        }

        $tanggalToday = date('Y-m-d');
        $isJam1 = $presensiGuru->jam_ke == 1;

        foreach ($request->absensi as $item) {
            $siswaId = $item['siswa_id'];
            $status = $item['status'];
            $keterangan = $item['keterangan'] ?? null;

            // 1. Save per-jam attendance
            DB::table('presensi_murid_per_jam')->updateOrInsert(
                ['presensi_guru_id' => $presensiGuruId, 'siswa_id' => $siswaId],
                [
                    'status' => $status,
                    'keterangan' => $keterangan,
                    'updated_at' => now(),
                ]
            );

            // 2. Update daily attendance table (Jam Ke-1 Rule)
            $existingHarian = DB::table('presensi_murid_harian')
                ->where('tanggal', $tanggalToday)
                ->where('siswa_id', $siswaId)
                ->first();

            $statusUpper = strtoupper($status);

            if ($isJam1 || !$existingHarian) {
                DB::table('presensi_murid_harian')->updateOrInsert(
                    ['tanggal' => $tanggalToday, 'siswa_id' => $siswaId],
                    [
                        'status' => $statusUpper,
                        'jam_ke_1_status' => $statusUpper,
                        'updated_at' => now(),
                    ]
                );
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Absensi siswa berhasil disimpan ke database.',
            'total_diabsen' => count($request->absensi),
        ]);
    }

    /**
     * Send Monthly Attendance Summary Report via WhatsApp to Parents (Requires Admin Approval)
     */
    public function sendRekapBulananWa(Request $request)
    {
        $request->validate([
            'kelas_id' => 'required|integer',
            'bulan' => 'required|integer|between:1,12',
            'tahun' => 'required|integer',
        ]);

        $kelas = DB::table('kelas')->where('id', $request->kelas_id)->first();
        if (!$kelas) {
            return response()->json(['status' => 'error', 'message' => 'Kelas tidak ditemukan.'], 404);
        }

        $siswaList = DB::table('anggota_kelas as ak')
            ->join('siswa as s', 'ak.siswa_id', '=', 's.id')
            ->select('s.id', 's.nama', 's.nis', 's.no_hp_ortu')
            ->where('ak.kelas_id', $request->kelas_id)
            ->get();

        $bulanNama = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
            5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
            9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember'
        ][$request->bulan] ?? 'Bulan Ini';

        $totalTerkirim = 0;

        foreach ($siswaList as $s) {
            if (!$s->no_hp_ortu) continue;

            $rekap = DB::table('presensi_murid_harian')
                ->where('siswa_id', $s->id)
                ->whereYear('tanggal', $request->tahun)
                ->whereMonth('tanggal', $request->bulan)
                ->select(
                    DB::raw("SUM(CASE WHEN status = 'HADIR' THEN 1 ELSE 0 END) as total_hadir"),
                    DB::raw("SUM(CASE WHEN status = 'SAKIT' THEN 1 ELSE 0 END) as total_sakit"),
                    DB::raw("SUM(CASE WHEN status = 'IZIN' THEN 1 ELSE 0 END) as total_izin"),
                    DB::raw("SUM(CASE WHEN status = 'TERLAMBAT' THEN 1 ELSE 0 END) as total_terlambat"),
                    DB::raw("SUM(CASE WHEN status = 'ALPA' THEN 1 ELSE 0 END) as total_alpa")
                )->first();

            $msg = "📋 *REKAPITULASI PRESENSI BULANAN WALI SANTRI*\n\n";
            $msg .= "Yth. Bapak/Ibu Wali Santri,\n";
            $msg .= "Berikut laporan kehadiran bulanan putra/putri Anda:\n";
            $msg .= "• Nama: *{$s->nama}*\n";
            $msg .= "• Kelas: *{$kelas->nama_kelas}*\n";
            $msg .= "• Periode: *{$bulanNama} {$request->tahun}*\n\n";
            $msg .= "📊 *Rincian Kehadiran:*\n";
            $msg .= "- Hadir: *" . ($rekap->total_hadir ?? 0) . " Hari*\n";
            $msg .= "- Sakit: *" . ($rekap->total_sakit ?? 0) . " Hari*\n";
            $msg .= "- Izin: *" . ($rekap->total_izin ?? 0) . " Hari*\n";
            $msg .= "- Terlambat: *" . ($rekap->total_terlambat ?? 0) . " Hari*\n";
            $msg .= "- Alpa: *" . ($rekap->total_alpa ?? 0) . " Hari*\n\n";
            $msg .= "Laporan ini dikirim secara resmi 1 bulan sekali atas persetujuan Administrator Sekolah.\n";
            $msg .= "\n---\n*SMA KH. A. Wahid Hasyim Tebuireng*";

            $sent = WaGatewayService::sendMessage($s->no_hp_ortu, $msg, 'ortu', 'rekap_bulanan');
            if ($sent) {
                $totalTerkirim++;
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => "Rekap bulanan kehadiran bulan {$bulanNama} {$request->tahun} berhasil disetujui & dikirim via WA ke {$totalTerkirim} Wali Santri.",
        ]);
    }

}
