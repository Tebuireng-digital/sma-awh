<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\CapaianPembelajaran;
use App\Models\TujuanPembelajaran;
use App\Services\PromesExcelParserService;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class PerangkatAjarController extends Controller
{
    public function index(Request $request)
    {
        $mapelId = $request->get('mapel_id', 1);
        $tingkat = $request->get('tingkat', 'X');

        $cpList = CapaianPembelajaran::with('tujuanPembelajaran')
            ->where('mapel_id', $mapelId)
            ->where('tingkat', $tingkat)
            ->get();

        $promesList = DB::table('program_semester as ps')
            ->join('program_tahunan as pt', 'ps.prota_id', '=', 'pt.id')
            ->join('tujuan_pembelajaran as tp', 'ps.tp_id', '=', 'tp.id')
            ->select('ps.id as promes_id', 'tp.kode_tp', 'tp.deskripsi_tp', 'ps.bulan', 'ps.minggu_ke', 'ps.target_jp', 'ps.status_selesai')
            ->where('pt.mapel_id', $mapelId)
            ->where('pt.tingkat', $tingkat)
            ->orderBy('ps.bulan')
            ->orderBy('ps.minggu_ke')
            ->get();

        return response()->json([
            'status' => 'success',
            'mapel_id' => (int) $mapelId,
            'tingkat' => $tingkat,
            'capaian_pembelajaran' => $cpList,
            'program_semester' => $promesList,
        ]);
    }

    public function storeCpTp(Request $request)
    {
        $request->validate([
            'mapel_id' => 'required|integer',
            'tingkat' => 'required|string|in:X,XI,XII',
            'elemen' => 'required|string',
            'deskripsi_cp' => 'required|string',
            'tujuan_pembelajaran' => 'required|array|min:1',
            'tujuan_pembelajaran.*.kode_tp' => 'required|string',
            'tujuan_pembelajaran.*.deskripsi_tp' => 'required|string',
            'tujuan_pembelajaran.*.alokasi_jp' => 'required|integer|min:1',
        ]);

        DB::beginTransaction();
        try {
            $cp = CapaianPembelajaran::create([
                'mapel_id' => $request->mapel_id,
                'fase' => in_array($request->tingkat, ['XI', 'XII']) ? 'F' : 'E',
                'tingkat' => $request->tingkat,
                'elemen' => $request->elemen,
                'deskripsi_cp' => $request->deskripsi_cp,
            ]);

            foreach ($request->tujuan_pembelajaran as $idx => $tpData) {
                TujuanPembelajaran::create([
                    'cp_id' => $cp->id,
                    'kode_tp' => $tpData['kode_tp'],
                    'deskripsi_tp' => $tpData['deskripsi_tp'],
                    'alokasi_jp' => $tpData['alokasi_jp'],
                    'urutan' => $idx + 1,
                ]);
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Capaian Pembelajaran (CP) & Tujuan Pembelajaran (TP) berhasil disimpan via Web Form.',
                'cp_id' => $cp->id,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    public function importExcelPromes(Request $request)
    {
        $request->validate([
            'file_excel' => 'required|file|mimes:xlsx,xls,csv',
            'mapel_id' => 'required|integer',
            'tingkat' => 'required|string|in:X,XI,XII',
        ]);

        $file = $request->file('file_excel');
        $result = PromesExcelParserService::importFromExcel(
            $file->getRealPath(),
            $request->mapel_id,
            $request->tingkat
        );

        if ($result['status'] === 'success') {
            return response()->json($result);
        }

        return response()->json($result, 400);
    }

    public function exportTemplatePromes()
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // Set Header Columns
        $sheet->setCellValue('A1', 'Kode TP');
        $sheet->setCellValue('B1', 'Deskripsi Capaian Pembelajaran (CP)');
        $sheet->setCellValue('C1', 'Elemen');
        $sheet->setCellValue('D1', 'Deskripsi Tujuan Pembelajaran (TP)');
        $sheet->setCellValue('E1', 'Alokasi JP');
        $sheet->setCellValue('F1', 'Bulan (7-12 / 1-6)');
        $sheet->setCellValue('G1', 'Minggu Ke (1-5)');

        // Sample Row Data
        $sheet->setCellValue('A2', 'TP-BIO-10.1');
        $sheet->setCellValue('B2', 'Peserta didik mampu memahami keanekaragaman hayati dan perannya.');
        $sheet->setCellValue('C2', 'Pemahaman Biologi');
        $sheet->setCellValue('D2', 'Menganalisis keanekaragaman hayati tingkat gen, jenis, dan ekosistem.');
        $sheet->setCellValue('E2', 2);
        $sheet->setCellValue('F2', 7);
        $sheet->setCellValue('G2', 1);

        $writer = new Xlsx($spreadsheet);
        $fileName = 'Template_Promes_SMA_AWH.xlsx';
        $tempPath = storage_path($fileName);
        $writer->save($tempPath);

        return response()->download($tempPath)->deleteFileAfterSend(true);
    }
}
