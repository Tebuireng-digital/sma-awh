<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RaporController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('rapor_sts')
            ->join('siswa', 'rapor_sts.siswa_id', '=', 'siswa.id')
            ->leftJoin('anggota_kelas', 'siswa.id', '=', 'anggota_kelas.siswa_id')
            ->leftJoin('kelas', 'anggota_kelas.kelas_id', '=', 'kelas.id')
            ->select(
                'rapor_sts.*',
                'siswa.nama as nama_siswa',
                'siswa.nis as no_induk',
                'kelas.nama_kelas as kelas'
            );

        if ($request->has('siswa_id')) {
            $query->where('rapor_sts.siswa_id', $request->siswa_id);
        }

        if ($request->has('kelas_id')) {
            $query->where('kelas.id', $request->kelas_id);
        }

        $rapor = $query->get();

        return response()->json([
            'status' => 'success',
            'data' => $rapor,
        ]);
    }

    public function show($siswa_id)
    {
        $rapor = DB::table('rapor_sts')
            ->join('siswa', 'rapor_sts.siswa_id', '=', 'siswa.id')
            ->leftJoin('anggota_kelas', 'siswa.id', '=', 'anggota_kelas.siswa_id')
            ->leftJoin('kelas', 'anggota_kelas.kelas_id', '=', 'kelas.id')
            ->select(
                'rapor_sts.*',
                'siswa.nama as nama_siswa',
                'siswa.nis as no_induk',
                'kelas.nama_kelas as kelas'
            )
            ->where('rapor_sts.siswa_id', $siswa_id)
            ->first();

        if (!$rapor) {
            // Return empty draft if not inserted yet
            $siswa = DB::table('siswa')
                ->leftJoin('anggota_kelas', 'siswa.id', '=', 'anggota_kelas.siswa_id')
                ->leftJoin('kelas', 'anggota_kelas.kelas_id', '=', 'kelas.id')
                ->select('siswa.id as siswa_id', 'siswa.nama as nama_siswa', 'siswa.nis as no_induk', 'kelas.nama_kelas as kelas')
                ->where('siswa.id', $siswa_id)
                ->first();

            if (!$siswa) {
                return response()->json(['status' => 'error', 'message' => 'Siswa tidak ditemukan.'], 404);
            }

            return response()->json([
                'status' => 'success',
                'data' => [
                    'siswa_id' => $siswa->siswa_id,
                    'nama_siswa' => $siswa->nama_siswa,
                    'no_induk' => $siswa->no_induk,
                    'kelas' => $siswa->kelas ?? 'X.1',
                    'tahun_ajaran' => '2026/2027',
                    'semester' => 'Ganjil',
                    'nilai_pai' => 0, 'nilai_ppkn' => 0, 'nilai_indo' => 0, 'nilai_mtk' => 0,
                    'nilai_inggris' => 0, 'nilai_seni' => 0, 'nilai_penjas' => 0, 'nilai_informa' => 0,
                    'nilai_sejarah' => 0, 'nilai_biologi' => 0, 'nilai_fisika' => 0, 'nilai_kimia' => 0,
                    'nilai_geografi' => 0, 'nilai_sosiologi' => 0, 'nilai_ekonomi' => 0, 'nilai_pkwu' => 0,
                    'nilai_alquran' => 0, 'nilai_akhlaq' => 0, 'nilai_fiqih' => 0, 'nilai_nahwu' => 0,
                    'nilai_aswaja' => 0,
                    'kktp' => 75,
                    'catatan_wali_kelas' => '',
                    'status_validasi' => 'draft',
                    'ttd_walikelas' => null,
                    'ttd_kepsek' => null,
                ]
            ]);
        }

        return response()->json([
            'status' => 'success',
            'data' => $rapor,
        ]);
    }

    public function storeOrUpdate(Request $request)
    {
        $request->validate([
            'siswa_id' => 'required|exists:siswa,id',
        ]);

        $keys = [
            'nilai_pai', 'nilai_ppkn', 'nilai_indo', 'nilai_mtk', 'nilai_inggris',
            'nilai_seni', 'nilai_penjas', 'nilai_informa', 'nilai_sejarah', 'nilai_biologi',
            'nilai_fisika', 'nilai_kimia', 'nilai_geografi', 'nilai_sosiologi', 'nilai_ekonomi',
            'nilai_pkwu', 'nilai_alquran', 'nilai_akhlaq', 'nilai_fiqih', 'nilai_nahwu', 'nilai_aswaja'
        ];

        $jumlah = 0;
        $dataToSave = [
            'siswa_id' => $request->siswa_id,
            'tahun_ajaran' => $request->tahun_ajaran ?? '2026/2027',
            'semester' => $request->semester ?? 'Ganjil',
            'kktp' => $request->kktp ?? 75,
            'catatan_wali_kelas' => $request->catatan_wali_kelas ?? '',
            'updated_at' => now(),
        ];

        foreach ($keys as $k) {
            $val = intval($request->input($k, 0));
            $dataToSave[$k] = $val;
            $jumlah += $val;
        }

        $dataToSave['jumlah'] = $jumlah;
        $dataToSave['rata_rata'] = round($jumlah / count($keys), 2);

        $existing = DB::table('rapor_sts')->where('siswa_id', $request->siswa_id)->first();
        if ($existing) {
            // Prevent guru from updating if already submitted
            $user = $request->user();
            if ($user && $user->role === 'guru' && in_array($existing->status_validasi, ['submitted_by_guru', 'approved_by_walikelas', 'approved_by_kepsek'])) {
                return response()->json(['status' => 'error', 'message' => 'Rapor sudah disubmit, tidak dapat diubah oleh Guru.'], 403);
            }
            DB::table('rapor_sts')->where('siswa_id', $request->siswa_id)->update($dataToSave);
        } else {
            $dataToSave['created_at'] = now();
            $dataToSave['status_validasi'] = 'draft';
            DB::table('rapor_sts')->insert($dataToSave);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Nilai Rapor STS berhasil disimpan.',
        ]);
    }

    public function submitToWaliKelas(Request $request, $siswa_id)
    {
        $rapor = DB::table('rapor_sts')->where('siswa_id', $siswa_id)->first();
        if (!$rapor) {
            return response()->json(['status' => 'error', 'message' => 'Simpan rapor (draft) terlebih dahulu sebelum dikirim.'], 400);
        }

        DB::table('rapor_sts')->where('id', $rapor->id)->update([
            'status_validasi' => 'submitted_by_guru',
            'updated_at' => now()
        ]);

        return response()->json(['status' => 'success', 'message' => 'Rapor berhasil dikirim ke Wali Kelas.']);
    }

    public function approveWaliKelas(Request $request, $siswa_id)
    {
        $rapor = DB::table('rapor_sts')->where('siswa_id', $siswa_id)->first();
        if (!$rapor) {
            return response()->json(['status' => 'error', 'message' => 'Rapor tidak ditemukan.'], 404);
        }
        
        DB::table('rapor_sts')->where('id', $rapor->id)->update([
            'status_validasi' => 'approved_by_walikelas',
            'catatan_wali_kelas' => $request->catatan_wali_kelas ?? $rapor->catatan_wali_kelas,
            'ttd_walikelas' => now(),
            'updated_at' => now()
        ]);

        return response()->json(['status' => 'success', 'message' => 'Rapor berhasil divalidasi oleh Wali Kelas.']);
    }

    public function approveKepsek(Request $request, $siswa_id)
    {
        $rapor = DB::table('rapor_sts')->where('siswa_id', $siswa_id)->first();
        if (!$rapor) {
            return response()->json(['status' => 'error', 'message' => 'Rapor tidak ditemukan.'], 404);
        }

        DB::table('rapor_sts')->where('id', $rapor->id)->update([
            'status_validasi' => 'approved_by_kepsek',
            'ttd_kepsek' => now(),
            'updated_at' => now()
        ]);

        return response()->json(['status' => 'success', 'message' => 'Rapor berhasil di-approve oleh Kepala Sekolah.']);
    }

    public function resetToDraft(Request $request, $siswa_id)
    {
        $rapor = DB::table('rapor_sts')->where('siswa_id', $siswa_id)->first();
        if (!$rapor) {
            return response()->json(['status' => 'error', 'message' => 'Rapor tidak ditemukan.'], 404);
        }

        DB::table('rapor_sts')->where('id', $rapor->id)->update([
            'status_validasi' => 'draft',
            'ttd_walikelas' => null,
            'ttd_kepsek' => null,
            'updated_at' => now()
        ]);

        return response()->json(['status' => 'success', 'message' => 'Rapor berhasil dikembalikan ke status Draft.']);
    }

    private function terbilang($nilai) {
        $huruf = [
            "", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"
        ];
        if ($nilai < 12) return $huruf[$nilai];
        elseif ($nilai < 20) return $huruf[$nilai - 10] . " Belas";
        elseif ($nilai < 100) return $huruf[floor($nilai / 10)] . " Puluh " . $huruf[$nilai % 10];
        elseif ($nilai == 100) return "Seratus";
        return "";
    }

    public function exportExcel($siswa_id)
    {
        $rapor = DB::table('rapor_sts')
            ->join('siswa', 'rapor_sts.siswa_id', '=', 'siswa.id')
            ->leftJoin('anggota_kelas', 'siswa.id', '=', 'anggota_kelas.siswa_id')
            ->leftJoin('kelas', 'anggota_kelas.kelas_id', '=', 'kelas.id')
            ->select(
                'rapor_sts.*',
                'siswa.nama as nama_siswa',
                'siswa.nis as no_induk',
                'kelas.nama_kelas as kelas'
            )
            ->where('rapor_sts.siswa_id', $siswa_id)
            ->first();

        if (!$rapor) {
            return response()->json(['status' => 'error', 'message' => 'Data rapor belum ada.'], 404);
        }

        $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // Header Title
        $sheet->mergeCells('A1:E1');
        $sheet->setCellValue('A1', 'YAYASAN HASYIM ASY\'ARI');
        $sheet->mergeCells('A2:E2');
        $sheet->setCellValue('A2', 'SMA KH. A. WAHID HASYIM TEBUIRENG');
        $sheet->mergeCells('A3:E3');
        $sheet->setCellValue('A3', 'LAPORAN HASIL BELAJAR SUMATIF TENGAH SEMESTER (STS)');

        $styleTitle = [
            'font' => ['bold' => true, 'size' => 14],
            'alignment' => ['horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER]
        ];
        $sheet->getStyle('A1:E3')->applyFromArray($styleTitle);

        // Student Info
        $sheet->setCellValue('A5', 'Nama Peserta Didik');
        $sheet->setCellValue('B5', ': ' . $rapor->nama_siswa);
        $sheet->setCellValue('A6', 'Nomor Induk');
        $sheet->setCellValue('B6', ': ' . $rapor->no_induk);
        $sheet->setCellValue('D5', 'Kelas');
        $sheet->setCellValue('E5', ': ' . $rapor->kelas);
        $sheet->setCellValue('D6', 'Semester');
        $sheet->setCellValue('E6', ': ' . $rapor->semester);
        $sheet->setCellValue('D7', 'Tahun Pelajaran');
        $sheet->setCellValue('E7', ': ' . $rapor->tahun_ajaran);

        // Table Header
        $row = 9;
        $sheet->setCellValue('A' . $row, 'NO');
        $sheet->setCellValue('B' . $row, 'MATA PELAJARAN');
        $sheet->setCellValue('C' . $row, 'KKTP');
        $sheet->setCellValue('D' . $row, 'NILAI ANGKA');
        $sheet->setCellValue('E' . $row, 'HURUF / TERBILANG');

        $styleTableHeader = [
            'font' => ['bold' => true],
            'alignment' => ['horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER],
            'borders' => ['allBorders' => ['borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN]]
        ];
        $sheet->getStyle('A' . $row . ':E' . $row)->applyFromArray($styleTableHeader);
        $sheet->getStyle('A' . $row . ':E' . $row)->getFill()->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)->getStartColor()->setARGB('FFEFEFEF');

        // Column Widths
        $sheet->getColumnDimension('A')->setWidth(5);
        $sheet->getColumnDimension('B')->setWidth(35);
        $sheet->getColumnDimension('C')->setWidth(10);
        $sheet->getColumnDimension('D')->setWidth(15);
        $sheet->getColumnDimension('E')->setWidth(30);

        // Subjects Map
        $mapels = [
            'nilai_pai' => 'Pendidikan Agama Islam (PAI)', 'nilai_ppkn' => 'PPKN', 'nilai_indo' => 'Bahasa Indonesia',
            'nilai_mtk' => 'Matematika', 'nilai_inggris' => 'Bhs. Inggris', 'nilai_seni' => 'Seni Budaya',
            'nilai_penjas' => 'Penjaskes', 'nilai_informa' => 'Informatika', 'nilai_sejarah' => 'Sejarah',
            'nilai_biologi' => 'IPA Biologi', 'nilai_fisika' => 'Fisika', 'nilai_kimia' => 'Kimia',
            'nilai_geografi' => 'IPS Geografi', 'nilai_sosiologi' => 'Sosiologi', 'nilai_ekonomi' => 'Ekonomi',
            'nilai_pkwu' => 'PKWU', 'nilai_alquran' => 'Al-Quran', 'nilai_akhlaq' => 'Akhlaq',
            'nilai_fiqih' => 'Fiqih', 'nilai_nahwu' => 'Nahwu Shorof', 'nilai_aswaja' => 'Ke-Aswaja-an'
        ];

        $row++;
        $no = 1;
        $startRow = $row;
        foreach ($mapels as $key => $name) {
            $nilai = $rapor->{$key};
            $sheet->setCellValue('A' . $row, $no);
            $sheet->setCellValue('B' . $row, $name);
            $sheet->setCellValue('C' . $row, $rapor->kktp);
            $sheet->setCellValue('D' . $row, $nilai);
            $sheet->setCellValue('E' . $row, $this->terbilang($nilai));
            
            $sheet->getStyle('A' . $row)->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle('C' . $row)->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle('D' . $row)->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle('E' . $row)->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
            
            $row++;
            $no++;
        }

        // Summary
        $sheet->setCellValue('A' . $row, 'JUMLAH');
        $sheet->mergeCells('A' . $row . ':C' . $row);
        $sheet->setCellValue('D' . $row, $rapor->jumlah);
        $sheet->mergeCells('E' . $row . ':E' . $row);
        
        $sheet->getStyle('A' . $row . ':E' . $row)->getFont()->setBold(true);
        $sheet->getStyle('D' . $row)->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
        $row++;

        $sheet->setCellValue('A' . $row, 'RATA-RATA');
        $sheet->mergeCells('A' . $row . ':C' . $row);
        $sheet->setCellValue('D' . $row, $rapor->rata_rata);
        $sheet->mergeCells('E' . $row . ':E' . $row);
        
        $sheet->getStyle('A' . $row . ':E' . $row)->getFont()->setBold(true);
        $sheet->getStyle('D' . $row)->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
        
        $endRow = $row;
        
        $styleTableBody = [
            'borders' => ['allBorders' => ['borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN]]
        ];
        $sheet->getStyle('A9:E' . $endRow)->applyFromArray($styleTableBody);

        // Footer / Signatures
        $row += 3;
        $sheet->setCellValue('D' . $row, 'Jombang, ' . date('d F Y'));
        $row++;
        $sheet->setCellValue('A' . $row, 'Mengetahui,');
        $row++;
        $sheet->setCellValue('A' . $row, 'Orang Tua / Wali');
        $sheet->setCellValue('D' . $row, 'Wali Kelas');
        
        $row += 4;
        $sheet->setCellValue('A' . $row, '(........................................)');
        $sheet->setCellValue('D' . $row, '(........................................)');
        
        $row += 2;
        $sheet->setCellValue('B' . $row, 'Mengetahui,');
        $sheet->setCellValue('B' . ($row + 1), 'Kepala SMA A. Wahid Hasyim');
        $sheet->setCellValue('B' . ($row + 5), '(........................................)');
        $sheet->getStyle('B' . $row . ':B' . ($row + 5))->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);

        $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);
        
        $fileName = 'Rapor_STS_' . str_replace(' ', '_', $rapor->nama_siswa) . '.xlsx';
        
        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header('Content-Disposition: attachment; filename="'. urlencode($fileName).'"');
        $writer->save('php://output');
        exit;
    }
}
