<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GuruPresensiController extends Controller
{
    public function getJadwalHariIni(Request $request)
    {
        $user = $request->user();
        $hariStr = $request->get('hari', date('N') == 7 ? 'Minggu' : ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][date('N') - 1]);

        $query = DB::table('jadwal_pelajaran as jp')
            ->join('kelas as k', 'jp.kelas_id', '=', 'k.id')
            ->join('mata_pelajaran as mp', 'jp.mapel_id', '=', 'mp.id')
            ->leftJoin('presensi_guru as pg', function($join) {
                $join->on('jp.id', '=', 'pg.jadwal_id')
                     ->whereDate('pg.created_at', date('Y-m-d'));
            })
            ->select(
                'jp.id as id',
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
                'pg.waktu_masuk',
                'pg.waktu_selesai'
            );

        if ($user->role !== 'admin' && $user->id_guru) {
            $query->where('jp.id_guru', $user->id_guru);
        }

        $jadwal = $query->where('jp.hari', $hariStr)
            ->orderBy('jp.jam_ke')
            ->get();

        // Removed fallback dummy schedule so it accurately reflects empty days

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
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'status_kehadiran' => 'nullable|string|in:hadir,sakit,izin,dinas,alpa',
        ]);

        $user = $request->user();
        $statusKehadiran = $request->status_kehadiran ?? 'hadir';

        // Check if already presensi today
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

        // Record Presensi Guru
        $presensiId = DB::table('presensi_guru')->insertGetId([
            'jadwal_id' => $request->jadwal_id,
            'id_guru' => $user->id_guru,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'status_kehadiran' => $statusKehadiran,
            'waktu_masuk' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Presensi berhasil dicatat.',
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
}
