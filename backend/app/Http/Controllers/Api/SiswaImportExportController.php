<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Kelas;
use App\Models\Siswa;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SiswaImportExportController extends Controller
{
    /**
     * Memastikan hanya role admin yang memiliki akses.
     */
    private function ensureAdmin(Request $request): void
    {
        $user = $request->user();
        $roles = $user ? (method_exists($user, 'getAllRolesAttribute') ? $user->all_roles : [$user->role]) : [];
        if (!in_array('admin', $roles)) {
            abort(403, 'Akses ditolak. Fitur ini hanya dapat dieksekusi oleh Administrator.');
        }
    }

    /**
     * Generate and Download Format Template Excel (.xlsx) untuk Siswa Baru.
     */
    public function downloadTemplate(Request $request): StreamedResponse
    {
        $this->ensureAdmin($request);

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Template Siswa Baru');

        // Ambil daftar nama kelas aktif untuk panduan
        $kelasList = DB::table('kelas')->orderBy('tingkat')->orderBy('nama_kelas')->pluck('nama_kelas')->toArray();
        $contohKelas = count($kelasList) > 0 ? $kelasList[0] : 'X-1';

        // Header Title
        $sheet->setCellValue('A1', 'FORMAT IMPORT DATA SISWA BARU - SMA A. WAHID HASYIM');
        $sheet->mergeCells('A1:G1');
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(13)->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color('001B44'));
        $sheet->getStyle('A1')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        // Petunjuk Pengisian
        $sheet->setCellValue('A2', 'Petunjuk: Isi data mulai baris 5. Kolom NIS, NAMA LENGKAP, JENIS KELAMIN (L/P), dan TARGET KELAS wajib diisi.');
        $sheet->mergeCells('A2:G2');
        $sheet->getStyle('A2')->getFont()->setItalic(true)->setSize(9)->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color('555555'));

        $sheet->setCellValue('A3', 'Daftar Kelas Tersedia: ' . implode(', ', $kelasList));
        $sheet->mergeCells('A3:G3');
        $sheet->getStyle('A3')->getFont()->setBold(true)->setSize(9)->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color('0B6623'));

        // Table Headers
        $headers = [
            'A4' => 'NIS (*Wajib)',
            'B4' => 'NISN',
            'C4' => 'NAMA LENGKAP (*Wajib)',
            'D4' => 'JENIS KELAMIN (*L/P)',
            'E4' => 'NO HP ORTU / WALI',
            'F4' => 'TANGGAL LAHIR (YYYY-MM-DD)',
            'G4' => 'TARGET KELAS (*Wajib)',
        ];

        foreach ($headers as $cell => $title) {
            $sheet->setCellValue($cell, $title);
        }

        // Header Styling
        $headerRange = 'A4:G4';
        $sheet->getStyle($headerRange)->applyFromArray([
            'font' => [
                'bold' => true,
                'color' => ['rgb' => 'FFFFFF'],
                'size' => 10,
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '004B87'], // Navy Green
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['rgb' => '000000'],
                ],
            ],
        ]);
        $sheet->getRowDimension(4)->setRowHeight(28);

        // Baris Contoh Data (Row 5 & 6)
        $sampleData = [
            ['20261001', '0081234567', 'Ahmad Fulan Al-Hasyimi', 'L', '081234567890', '2009-05-12', $contohKelas],
            ['20261002', '0087654321', 'Siti Fatimah Az-Zahra', 'P', '081398765432', '2009-08-20', $contohKelas],
        ];

        $rowIdx = 5;
        foreach ($sampleData as $row) {
            $sheet->setCellValue('A' . $rowIdx, $row[0]);
            $sheet->setCellValueExplicit('A' . $rowIdx, $row[0], \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
            $sheet->setCellValueExplicit('B' . $rowIdx, $row[1], \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
            $sheet->setCellValue('C' . $rowIdx, $row[2]);
            $sheet->setCellValue('D' . $rowIdx, $row[3]);
            $sheet->setCellValueExplicit('E' . $rowIdx, $row[4], \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
            $sheet->setCellValue('F' . $rowIdx, $row[5]);
            $sheet->setCellValue('G' . $rowIdx, $row[6]);

            $sheet->getStyle("A{$rowIdx}:G{$rowIdx}")->applyFromArray([
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                        'color' => ['rgb' => 'CCCCCC'],
                    ],
                ],
            ]);
            $rowIdx++;
        }

        // Auto size columns
        foreach (range('A', 'G') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        $response = new StreamedResponse(function () use ($spreadsheet) {
            $writer = new Xlsx($spreadsheet);
            $writer->save('php://output');
        });

        $filename = 'Template_Import_Siswa_SMA_AWH_' . date('Ymd') . '.xlsx';
        $response->headers->set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        $response->headers->set('Content-Disposition', 'attachment; filename="' . $filename . '"');
        $response->headers->set('Cache-Control', 'max-age=0');

        return $response;
    }

    /**
     * Upload & Proses File Excel (.xlsx / .xls) untuk import data siswa baru.
     */
    public function importExcel(Request $request)
    {
        $this->ensureAdmin($request);

        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv|max:10240', // max 10MB
            'default_kelas_id' => 'nullable|integer|exists:kelas,id',
        ]);

        $file = $request->file('file');
        $defaultKelasId = $request->default_kelas_id ? (int)$request->default_kelas_id : null;

        try {
            $spreadsheet = \PhpOffice\PhpSpreadsheet\IOFactory::load($file->getRealPath());
            $sheet = $spreadsheet->getActiveSheet();
            $rows = $sheet->toArray(null, true, true, true);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal membaca file spreadsheet: ' . $e->getMessage(),
            ], 422);
        }

        // Index mapping kelas by nama_kelas (case-insensitive) & id
        $allKelas = DB::table('kelas')->get();
        $kelasMapByName = [];
        foreach ($allKelas as $k) {
            $kelasMapByName[strtoupper(trim($k->nama_kelas))] = $k->id;
        }

        $tahunAjaranAktif = DB::table('tahun_ajaran')->where('is_active', true)->first()
            ?? DB::table('tahun_ajaran')->latest('id')->first();
        $tahunAjaranId = $tahunAjaranAktif ? $tahunAjaranAktif->id : 1;

        $totalRowsRead = 0;
        $importedCount = 0;
        $errors = [];

        // Data mulai dari baris ke-5 jika memakai template kita, atau baris ke-2 jika file biasa
        $startRow = 5;
        // Cek apakah header berada di baris 1
        if (isset($rows[1]) && (str_contains(strtoupper($rows[1]['A'] ?? ''), 'NIS') || str_contains(strtoupper($rows[1]['C'] ?? ''), 'NAMA'))) {
            $startRow = 2;
        } elseif (isset($rows[4]) && (str_contains(strtoupper($rows[4]['A'] ?? ''), 'NIS') || str_contains(strtoupper($rows[4]['C'] ?? ''), 'NAMA'))) {
            $startRow = 5;
        }

        DB::beginTransaction();
        try {
            for ($i = $startRow; $i <= count($rows); $i++) {
                $row = $rows[$i] ?? null;
                if (!$row) {
                    continue;
                }

                $nis = trim((string)($row['A'] ?? ''));
                $nisn = trim((string)($row['B'] ?? ''));
                $nama = trim((string)($row['C'] ?? ''));
                $jk = strtoupper(trim((string)($row['D'] ?? 'L')));
                $noHpOrtu = trim((string)($row['E'] ?? ''));
                $tglLahir = trim((string)($row['F'] ?? ''));
                $targetKelasName = trim((string)($row['G'] ?? ''));

                // Lewati baris yang benar-benar kosong
                if ($nis === '' && $nama === '') {
                    continue;
                }

                $totalRowsRead++;

                // Validasi kolom wajib
                if ($nis === '') {
                    $errors[] = "Baris {$i}: NIS wajib diisi.";
                    continue;
                }

                if ($nama === '') {
                    $errors[] = "Baris {$i} (NIS {$nis}): Nama lengkap wajib diisi.";
                    continue;
                }

                if (!in_array($jk, ['L', 'P'])) {
                    $jk = 'L'; // default
                }

                // Cek duplikasi NIS di database siswa aktif
                $exists = DB::table('siswa')->where('nis', $nis)->exists();
                if ($exists) {
                    $errors[] = "Baris {$i}: NIS '{$nis}' sudah terdaftar di sistem.";
                    continue;
                }

                // Tentukan Kelas Tujuan
                $targetKelasId = null;
                if ($targetKelasName !== '' && isset($kelasMapByName[strtoupper($targetKelasName)])) {
                    $targetKelasId = $kelasMapByName[strtoupper($targetKelasName)];
                } elseif ($defaultKelasId) {
                    $targetKelasId = $defaultKelasId;
                } else {
                    // Coba cari kelas default pertama (misal X-1 atau kelas X pertama)
                    $firstX = DB::table('kelas')->where('tingkat', 'X')->first();
                    $targetKelasId = $firstX ? $firstX->id : ($allKelas->first()?->id);
                }

                if (!$targetKelasId) {
                    $errors[] = "Baris {$i} (NIS {$nis}): Target kelas '{$targetKelasName}' tidak ditemukan di sistem.";
                    continue;
                }

                // Format tanggal lahir jika valid
                $tglLahirParsed = null;
                if ($tglLahir !== '') {
                    $timestamp = strtotime($tglLahir);
                    if ($timestamp !== false) {
                        $tglLahirParsed = date('Y-m-d', $timestamp);
                    }
                }

                // Insert ke tabel siswa
                $siswaId = DB::table('siswa')->insertGetId([
                    'nis' => $nis,
                    'nisn' => $nisn !== '' ? $nisn : null,
                    'nama' => $nama,
                    'jenis_kelamin' => $jk,
                    'no_hp_ortu' => $noHpOrtu !== '' ? $noHpOrtu : null,
                    'tanggal_lahir' => $tglLahirParsed,
                    'status_aktif' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // Insert ke anggota_kelas
                $maxNoUrut = DB::table('anggota_kelas')->where('kelas_id', $targetKelasId)->max('no_urut') ?? 0;
                DB::table('anggota_kelas')->insert([
                    'kelas_id' => $targetKelasId,
                    'siswa_id' => $siswaId,
                    'no_urut' => $maxNoUrut + 1,
                    'tahun_ajaran_id' => $tahunAjaranId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                $importedCount++;
            }

            // Sinkronkan ulang jumlah_siswa di seluruh tabel kelas
            foreach ($allKelas as $k) {
                $actual = DB::table('anggota_kelas')->where('kelas_id', $k->id)->count();
                DB::table('kelas')->where('id', $k->id)->update(['jumlah_siswa' => $actual]);
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => "Proses import selesai. Berhasil mengimpor {$importedCount} siswa baru.",
                'summary' => [
                    'total_baris_terbaca' => $totalRowsRead,
                    'berhasil_diimpor' => $importedCount,
                    'gagal_diimpor' => count($errors),
                    'errors' => $errors,
                ],
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memproses import data siswa: ' . $e->getMessage(),
            ], 500);
        }
    }
}
