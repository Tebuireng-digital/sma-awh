<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use App\Models\KalenderAkademik;

class RencanaMingguEfektifService
{
    /**
     * Calculate Rincian Minggu Efektif (RME) for a specific Academic Year & Semester
     */
    public static function calculateRme(int $tahunAjaranId = 1, int $semesterId = 1): array
    {
        // Fetch all calendar entries for this academic year
        $kalenderEntries = KalenderAkademik::where('tahun_ajaran_id', $tahunAjaranId)->get();

        $bulanList = $semesterId == 1 ? [7, 8, 9, 10, 11, 12] : [1, 2, 3, 4, 5, 6];
        $rmeDetails = [];

        $totalMingguSemester = 0;
        $totalMingguEfektifSemester = 0;
        $totalMingguNonEfektifSemester = 0;

        foreach ($bulanList as $bulan) {
            $totalMingguBulan = 4; // Default standard 4 weeks per month
            $liburEntries = $kalenderEntries->filter(function($item) use ($bulan) {
                return (int) date('m', strtotime($item->tanggal)) === $bulan && $item->is_libur;
            });

            // Count total holiday days in this month
            $totalHariLibur = count($liburEntries);
            $mingguNonEfektif = (int) min(4, floor($totalHariLibur / 5)); // 5 active days = 1 non-effective week
            $mingguEfektif = max(0, $totalMingguBulan - $mingguNonEfektif);

            $rmeDetails[] = [
                'bulan' => $bulan,
                'total_minggu' => $totalMingguBulan,
                'minggu_efektif' => $mingguEfektif,
                'minggu_non_efektif' => $mingguNonEfektif,
                'jumlah_hari_libur' => $totalHariLibur,
            ];

            $totalMingguSemester += $totalMingguBulan;
            $totalMingguEfektifSemester += $mingguEfektif;
            $totalMingguNonEfektifSemester += $mingguNonEfektif;
        }

        return [
            'tahun_ajaran_id' => $tahunAjaranId,
            'semester_id' => $semesterId,
            'total_minggu_semester' => $totalMingguSemester,
            'total_minggu_efektif' => $totalMingguEfektifSemester,
            'total_minggu_non_efektif' => $totalMingguNonEfektifSemester,
            'estimasi_jam_efektif_per_jp' => $totalMingguEfektifSemester * 2, // Default 2 JP/week
            'detail_per_bulan' => $rmeDetails,
        ];
    }
}
