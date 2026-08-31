<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use App\Models\KalenderAkademik;
use App\Models\ProgramSemester;

class SmartPromesSuggestionService
{
    /**
     * Check if a specific date is a holiday / pondok event
     */
    public static function checkHoliday(?string $tanggalStr = null): array
    {
        $tanggal = $tanggalStr ?? date('Y-m-d');
        $kalender = KalenderAkademik::where('tanggal', $tanggal)->first();

        if ($kalender && $kalender->is_libur) {
            return [
                'is_libur' => true,
                'keterangan' => $kalender->keterangan,
                'is_acara_pondok' => (bool) $kalender->is_acara_pondok,
            ];
        }

        return [
            'is_libur' => false,
            'keterangan' => 'Hari Efektif KBM',
            'is_acara_pondok' => false,
        ];
    }

    /**
     * Suggest TP for current lesson session with Auto-Shift logic
     */
    public static function getSuggestedTp(int $kelasId, int $mapelId, ?string $tanggalStr = null): array
    {
        $tanggal = $tanggalStr ?? date('Y-m-d');
        $holidayCheck = self::checkHoliday($tanggal);

        if ($holidayCheck['is_libur']) {
            return [
                'status' => 'holiday',
                'message' => "Hari ini KBM diliburkan: {$holidayCheck['keterangan']}",
                'tp_rekomendasi' => null,
            ];
        }

        // Determine current month & week of month
        $bulan = (int) date('m', strtotime($tanggal));
        $dayOfMonth = (int) date('d', strtotime($tanggal));
        $mingguKe = (int) ceil($dayOfMonth / 7);

        // 1. Check if there are any UNFULFILLED TPs from previous weeks (Auto-Shift Logic)
        $unfulfilledPromes = DB::table('program_semester as ps')
            ->join('program_tahunan as pt', 'ps.prota_id', '=', 'pt.id')
            ->join('tujuan_pembelajaran as tp', 'ps.tp_id', '=', 'tp.id')
            ->select('ps.id as promes_id', 'tp.id as tp_id', 'tp.kode_tp', 'tp.deskripsi_tp', 'ps.bulan', 'ps.minggu_ke', 'ps.status_selesai')
            ->where('pt.mapel_id', $mapelId)
            ->where('ps.status_selesai', false)
            ->orderBy('ps.bulan')
            ->orderBy('ps.minggu_ke')
            ->first();

        if ($unfulfilledPromes) {
            $isShifted = ($unfulfilledPromes->bulan < $bulan) || ($unfulfilledPromes->bulan == $bulan && $unfulfilledPromes->minggu_ke < $mingguKe);
            return [
                'status' => 'found',
                'is_auto_shifted' => $isShifted,
                'catatan_shift' => $isShifted ? "Rekomendasi disesuaikan (Auto-Shift) dari target minggu ke-{$unfulfilledPromes->minggu_ke} bulan {$unfulfilledPromes->bulan} akibat libur/pertemuan terlewat." : "Sesuai target Promes minggu ke-{$mingguKe} bulan {$bulan}.",
                'promes_id' => $unfulfilledPromes->promes_id,
                'tp_id' => $unfulfilledPromes->tp_id,
                'kode_tp' => $unfulfilledPromes->kode_tp,
                'deskripsi_tp' => $unfulfilledPromes->deskripsi_tp,
            ];
        }

        return [
            'status' => 'not_configured',
            'message' => 'Belum ada Promes yang terdaftar untuk mapel ini. Menggunakan mode input jurnal manual.',
            'tp_rekomendasi' => null,
        ];
    }
}
