<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Services\GeofenceService;
use App\Services\WaGatewayService;

class GuruPresensiController extends Controller
{
    public function getJadwalHariIni(Request $request)
    {
        $user = $request->user();
        $hariStr = $request->get('hari', date('N') == 7 ? 'Minggu' : ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][date('N') - 1]);

        $jadwal = DB::table('jadwal_pelajaran as jp')
            ->join('kelas as k', 'jp.kelas_id', '=', 'k.id')
            ->join('mata_pelajaran as mp', 'jp.mapel_id', '=', 'mp.id')
            ->leftJoin('presensi_guru as pg', function($join) {
                $join->on('jp.id', '=', 'pg.jadwal_id')
                     ->whereDate('pg.created_at', date('Y-m-d'));
            })
            ->select(
                'jp.id as jadwal_id',
                'jp.kelas_id',
                'jp.mapel_id',
                'k.nama_kelas',
                'k.tingkat',
                'mp.nama_mapel',
                'jp.hari',
                'jp.jam_ke',
                'jp.jam_mulai',
                'jp.jam_selesai',
                'pg.id as presensi_guru_id',
                'pg.status_kehadiran',
                'pg.status_inval',
                'pg.waktu_masuk',
                'pg.waktu_selesai'
            )
            ->where('jp.id_guru', $user->id_guru)
            ->where('jp.hari', $hariStr)
            ->orderBy('jp.jam_ke')
            ->get();

        // Attach Promes & Auto-Shift Smart Suggestions
        foreach ($jadwal as $item) {
            $item->promes_suggestion = \App\Services\SmartPromesSuggestionService::getSuggestedTp(
                $item->kelas_id,
                $item->mapel_id
            );
        }

        return response()->json([
            'status' => 'success',
            'hari' => $hariStr,
            'id_guru' => $user->id_guru,
            'jadwal' => $jadwal,
        ]);
    }

    public function presensiMasuk(Request $request)
    {
        $request->validate([
            'jadwal_id' => 'required|integer',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'status_kehadiran' => 'nullable|string|in:hadir,sakit,izin,dinas,alpa',
            'tugas_mandiri' => 'nullable|string',
        ]);

        $user = $request->user();
        $statusKehadiran = $request->status_kehadiran ?? 'hadir';

        // 1. Validate Geofence (GPS Radius) if status is 'hadir'
        if ($statusKehadiran === 'hadir') {
            $geoResult = GeofenceService::validateLocation(
                (float) $request->latitude,
                (float) $request->longitude
            );

            if (!$geoResult['is_valid']) {
                return response()->json([
                    'status' => 'error',
                    'message' => "Lokasi Anda diluar radius area sekolah! Jarak Anda: {$geoResult['distance_meter']} meter (Maksimal radius: {$geoResult['allowed_radius_meter']}m).",
                    'geofence' => $geoResult,
                ], 422);
            }
        } else {
            $geoResult = [
                'distance_meter' => 0,
            ];
        }

        // 2. Check if already presensi today
        $existing = DB::table('presensi_guru')
            ->where('jadwal_id', $request->jadwal_id)
            ->whereDate('created_at', date('Y-m-d'))
            ->first();

        if ($existing) {
            return response()->json([
                'status' => 'error',
                'message' => 'Anda sudah melakukan presensi masuk untuk jadwal ini hari ini.',
                'presensi_guru_id' => $existing->id,
            ], 400);
        }

        // 3. Record Presensi Guru
        $statusInval = in_array($statusKehadiran, ['sakit', 'izin', 'dinas', 'alpa']) ? 'inval_diproses' : 'tidak_inval';

        $presensiId = DB::table('presensi_guru')->insertGetId([
            'jadwal_id' => $request->jadwal_id,
            'id_guru' => $user->id_guru,
            'id_guru_inval' => null,
            'status_inval' => $statusInval,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'jarak_meter' => $geoResult['distance_meter'],
            'status_kehadiran' => $statusKehadiran,
            'waktu_masuk' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // If absent (Sakit/Izin/Dinas), trigger WA alert to Guru Piket!
        if ($statusInval === 'inval_diproses') {
            $jadwalInfo = DB::table('jadwal_pelajaran as jp')
                ->join('kelas as k', 'jp.kelas_id', '=', 'k.id')
                ->join('mata_pelajaran as mp', 'jp.mapel_id', '=', 'mp.id')
                ->select('k.nama_kelas', 'mp.nama_mapel', 'jp.jam_ke')
                ->where('jp.id', $request->jadwal_id)
                ->first();

            if ($jadwalInfo) {
                WaGatewayService::notifyPiketOnEmptyClass(
                    $jadwalInfo->nama_kelas,
                    $jadwalInfo->nama_mapel,
                    $jadwalInfo->jam_ke,
                    $request->tugas_mandiri
                );
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => $statusKehadiran === 'hadir' ? 'Presensi masuk berhasil di-verify via GPS.' : 'Laporan ketidakhadiran berhasil disimpan & diajukan ke Guru Piket.',
            'presensi_guru_id' => $presensiId,
        ]);
    }

    public function presensiSelesai(Request $request, $id)
    {
        $presensi = DB::table('presensi_guru')->where('id', $id)->first();
        if (!$presensi) {
            return response()->json(['status' => 'error', 'message' => 'Record presensi tidak ditemukan.'], 404);
        }

        DB::table('presensi_guru')->where('id', $id)->update([
            'waktu_selesai' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Sesi mengajar diselesaikan. Silakan isi Jurnal Mengajar.',
        ]);
    }

    public function getKelasKosongPiket()
    {
        $todayStr = date('N') == 7 ? 'Minggu' : ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][date('N') - 1];

        $kelasKosong = DB::table('presensi_guru as pg')
            ->join('jadwal_pelajaran as jp', 'pg.jadwal_id', '=', 'jp.id')
            ->join('kelas as k', 'jp.kelas_id', '=', 'k.id')
            ->join('mata_pelajaran as mp', 'jp.mapel_id', '=', 'mp.id')
            ->join('guru as g', 'pg.id_guru', '=', 'g.id_guru')
            ->select(
                'pg.id as presensi_guru_id',
                'k.nama_kelas',
                'mp.nama_mapel',
                'jp.jam_ke',
                'g.nama_lengkap as nama_guru_asli',
                'pg.status_kehadiran',
                'pg.status_inval',
                'pg.id_guru_inval'
            )
            ->whereDate('pg.created_at', date('Y-m-d'))
            ->whereIn('pg.status_kehadiran', ['sakit', 'izin', 'dinas', 'alpa'])
            ->get();

        return response()->json([
            'status' => 'success',
            'tanggal' => date('Y-m-d'),
            'total_kelas_kosong' => count($kelasKosong),
            'kelas_kosong' => $kelasKosong,
        ]);
    }

    public function klaimInval(Request $request)
    {
        $request->validate([
            'presensi_guru_id' => 'required|integer',
        ]);

        $user = $request->user();
        if (!$user->id_guru && $user->role !== 'piket') {
            return response()->json(['status' => 'error', 'message' => 'Hanya Guru Piket atau Guru Terdaftar yang dapat mengklaim kelas inval.'], 403);
        }

        DB::table('presensi_guru')->where('id', $request->presensi_guru_id)->update([
            'id_guru_inval' => $user->id_guru ?? 1, // default to teacher ID
            'status_inval' => 'inval_diklaim',
            'updated_at' => now(),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Kelas inval berhasil diklaim. Anda berhak mengabsen murid di kelas ini.',
        ]);
    }
}
