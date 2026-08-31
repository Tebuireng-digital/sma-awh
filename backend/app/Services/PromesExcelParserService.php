<?php

namespace App\Services;

use PhpOffice\PhpSpreadsheet\IOFactory;
use Illuminate\Support\Facades\DB;
use App\Models\CapaianPembelajaran;
use App\Models\TujuanPembelajaran;
use App\Models\ProgramTahunan;
use App\Models\ProgramSemester;

class PromesExcelParserService
{
    /**
     * Import CP, TP, Prota, Promes from Excel file
     */
    public static function importFromExcel(string $filePath, int $mapelId, string $tingkat = 'X', int $tahunAjaranId = 1, int $semesterId = 1): array
    {
        $spreadsheet = IOFactory::load($filePath);
        $sheet = $spreadsheet->getActiveSheet();
        $rows = $sheet->toArray();

        if (count($rows) < 2) {
            return ['status' => 'error', 'message' => 'File Excel kosong atau format tidak sesuai.'];
        }

        // Header row index 0: Kode TP | Deskripsi CP | Elemen | Deskripsi TP | Alokasi JP | Bulan | Minggu Ke
        $importedTpCount = 0;
        $importedPromesCount = 0;

        DB::beginTransaction();
        try {
            // 1. Create or Find Prota
            $prota = ProgramTahunan::firstOrCreate([
                'tahun_ajaran_id' => $tahunAjaranId,
                'mapel_id' => $mapelId,
                'tingkat' => $tingkat,
            ], [
                'total_jp' => 72,
            ]);

            for ($i = 1; $i < count($rows); $i++) {
                $row = $rows[$i];
                if (empty($row[0]) && empty($row[3])) continue; // skip empty lines

                $kodeTp = trim($row[0] ?? ('TP-' . ($i)));
                $deskripsiCp = trim($row[1] ?? 'Capaian Pembelajaran Umumu');
                $elemen = trim($row[2] ?? 'Pemahaman Konsep');
                $deskripsiTp = trim($row[3] ?? $kodeTp);
                $alokasiJp = (int) ($row[4] ?? 2);
                $bulan = (int) ($row[5] ?? 7);
                $mingguKe = (int) ($row[6] ?? 1);

                // Create CP if not exists
                $cp = CapaianPembelajaran::firstOrCreate([
                    'mapel_id' => $mapelId,
                    'tingkat' => $tingkat,
                    'elemen' => $elemen,
                ], [
                    'fase' => in_array($tingkat, ['XI', 'XII']) ? 'F' : 'E',
                    'deskripsi_cp' => $deskripsiCp,
                ]);

                // Create TP
                $tp = TujuanPembelajaran::updateOrCreate([
                    'cp_id' => $cp->id,
                    'kode_tp' => $kodeTp,
                ], [
                    'deskripsi_tp' => $deskripsiTp,
                    'alokasi_jp' => $alokasiJp,
                    'urutan' => $i,
                ]);
                $importedTpCount++;

                // Create Promes Mapping
                ProgramSemester::updateOrCreate([
                    'prota_id' => $prota->id,
                    'semester_id' => $semesterId,
                    'tp_id' => $tp->id,
                ], [
                    'bulan' => $bulan,
                    'minggu_ke' => $mingguKe,
                    'target_jp' => $alokasiJp,
                    'status_selesai' => false,
                ]);
                $importedPromesCount++;
            }

            DB::commit();

            return [
                'status' => 'success',
                'message' => "Berhasil mengimpor {$importedTpCount} TP dan {$importedPromesCount} Jadwal Promes.",
                'total_tp' => $importedTpCount,
                'total_promes' => $importedPromesCount,
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            return ['status' => 'error', 'message' => 'Gagal mengimpor file Excel: ' . $e->getMessage()];
        }
    }
}
