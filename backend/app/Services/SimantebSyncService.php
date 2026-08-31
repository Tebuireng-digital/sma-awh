<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SimantebSyncService
{
    /**
     * Execute daily attendance sync to SIMANTEB at 14:00 WIB
     */
    public static function syncDailyAttendance(?string $tanggalStr = null): array
    {
        $tanggal = $tanggalStr ?? date('Y-m-d');
        
        // 1. Get all active students
        $students = DB::table('siswa as s')
            ->leftJoin('anggota_kelas as ak', 's.id', '=', 'ak.siswa_id')
            ->leftJoin('kelas as k', 'ak.kelas_id', '=', 'k.id')
            ->select('s.id as siswa_id', 's.nis', 's.nama', 'k.nama_kelas')
            ->where('s.status_aktif', true)
            ->get();

        $payloadList = [];
        $successCount = 0;

        foreach ($students as $st) {
            // Check daily presence (or check jam ke-1 status)
            $harian = DB::table('presensi_murid_harian')
                ->where('tanggal', $tanggal)
                ->where('siswa_id', $st->siswa_id)
                ->first();

            $statusHarian = $harian ? $harian->status : 'HADIR'; // Default HADIR according to PRD
            $jam1Status = $harian ? $harian->jam_ke_1_status : 'HADIR';

            $payloadItem = [
                'nis' => $st->nis,
                'nama' => $st->nama,
                'kelas' => $st->nama_kelas ?? '-',
                'status_harian' => $statusHarian,
                'jam_ke_1_status' => $jam1Status,
            ];

            $payloadList[] = $payloadItem;

            // Update sync timestamp in presensi_murid_harian
            if ($harian) {
                DB::table('presensi_murid_harian')
                    ->where('id', $harian->id)
                    ->update(['synced_to_simanteb_at' => now()]);
            }
        }

        // 2. Send payload to SIMANTEB API (or local simulation endpoint)
        $simantebUrl = env('SIMANTEB_API_URL', 'http://localhost:8000/api/v1/integrasi/absen-sekolah');
        $apiKey = env('SIMANTEB_API_KEY', 'secret_simanteb_key');

        $syncStatus = 'success';
        $responseJson = null;

        try {
            $response = Http::withHeaders([
                'X-API-KEY' => $apiKey,
                'Accept' => 'application/json',
            ])->timeout(15)->post($simantebUrl, [
                'tanggal' => $tanggal,
                'sekolah' => 'SMA ABDUL WAHID HASYIM TEBUIRENG',
                'total_siswa' => count($payloadList),
                'presensi' => $payloadList,
            ]);

            $responseJson = $response->json();
            if ($response->successful()) {
                $successCount = count($payloadList);
            } else {
                $syncStatus = 'failed';
            }
        } catch (\Exception $e) {
            $syncStatus = 'failed';
            $responseJson = ['error' => $e->getMessage()];
            Log::error("SIMANTEB Sync Error: " . $e->getMessage());
        }

        // 3. Log execution
        foreach ($students as $st) {
            DB::table('log_sync_simanteb')->insert([
                'tanggal' => $tanggal,
                'siswa_id' => $st->siswa_id,
                'status_harian' => $payloadItem['status_harian'] ?? 'HADIR',
                'response_api' => json_encode($responseJson),
                'status_sync' => $syncStatus,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        return [
            'status' => $syncStatus,
            'tanggal' => $tanggal,
            'total_synced' => count($payloadList),
            'response' => $responseJson,
        ];
    }
}
