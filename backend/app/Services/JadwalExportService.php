<?php

namespace App\Services;

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Drawing;
use Illuminate\Support\Facades\DB;

class JadwalExportService
{
    public function generateExcel()
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        
        // 1. Basic Settings
        $sheet->getPageSetup()->setOrientation(\PhpOffice\PhpSpreadsheet\Worksheet\PageSetup::ORIENTATION_LANDSCAPE);
        $sheet->getPageSetup()->setPaperSize(\PhpOffice\PhpSpreadsheet\Worksheet\PageSetup::PAPERSIZE_LEGAL);
        
        // Setup Columns
        $sheet->getColumnDimension('A')->setWidth(3); // Hari
        $sheet->getColumnDimension('B')->setWidth(3); // Jam Ke
        $sheet->getColumnDimension('C')->setWidth(10); // Durasi
        
        // Kelas X, XI, XII (approx 25 classes) - let's set width to 3
        $colIndex = 4; // D
        for ($i=0; $i<25; $i++) {
            $colName = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colIndex);
            $sheet->getColumnDimension($colName)->setWidth(3.5);
            $colIndex++;
        }
        
        // Spacer
        $spacerCol = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colIndex);
        $sheet->getColumnDimension($spacerCol)->setWidth(2);
        
        // Guru List Columns
        $kodeCol = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colIndex+1);
        $guruCol = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colIndex+2);
        $mapelCol = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colIndex+3);
        
        $sheet->getColumnDimension($kodeCol)->setWidth(5);
        $sheet->getColumnDimension($guruCol)->setWidth(35);
        $sheet->getColumnDimension($mapelCol)->setWidth(30);

        $lastGridColIndex = $colIndex - 1;
        $lastGridCol = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($lastGridColIndex);
        
        // Header
        $sheet->mergeCells("A1:{$lastGridCol}2");
        $sheet->setCellValue('A1', "SMA A. WAHID HASYIM\nTEBUIRENG JOMBANG\n2026 - 2027\n\nJADWAL PELAJARAN");
        $sheet->getStyle('A1')->getAlignment()->setWrapText(true)->setHorizontal(Alignment::HORIZONTAL_CENTER)->setVertical(Alignment::VERTICAL_CENTER);
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(14);
        
        // Add Logo
        $logoPath = public_path('logo.png');
        if (file_exists($logoPath)) {
            $drawing = new Drawing();
            $drawing->setName('Logo');
            $drawing->setDescription('Logo Tebuireng');
            $drawing->setPath($logoPath);
            $drawing->setCoordinates('B1');
            $drawing->setHeight(75);
            $drawing->setOffsetX(15);
            $drawing->setOffsetY(10);
            $drawing->setWorksheet($sheet);
        }
        
        // Guru Table Header
        $sheet->setCellValue("{$kodeCol}4", 'KODE');
        $sheet->setCellValue("{$guruCol}4", 'NAMA GURU');
        $sheet->setCellValue("{$mapelCol}4", 'MATA PELAJARAN');
        $sheet->getStyle("{$kodeCol}4:{$mapelCol}4")->getFont()->setBold(true);
        $sheet->getStyle("{$kodeCol}4:{$mapelCol}4")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        // Fetch Guru List
        $guruList = DB::table('guru')->orderBy('id_guru')->get();
        // Just for simplicity, we map their primary mapel if any (we don't have it explicitly, so we just list their names)
        $currentRow = 5;
        foreach ($guruList as $guru) {
            $sheet->setCellValue("{$kodeCol}{$currentRow}", $guru->id_guru);
            $sheet->setCellValue("{$guruCol}{$currentRow}", $guru->nama_lengkap);
            
            // Find all unique mapels they teach
            $taughtMapels = DB::table('jadwal_pelajaran')
                ->join('mata_pelajaran', 'jadwal_pelajaran.mapel_id', '=', 'mata_pelajaran.id')
                ->where('id_guru', $guru->id_guru)
                ->distinct()
                ->pluck('nama_mapel')
                ->join(' / ');
                
            $sheet->setCellValue("{$mapelCol}{$currentRow}", $taughtMapels ?: '-');
            
            // Borders for guru list
            $sheet->getStyle("{$kodeCol}{$currentRow}:{$mapelCol}{$currentRow}")->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN);
            $currentRow++;
        }
        
        // Main Grid Headers
        $sheet->setCellValue('A4', 'HARI');
        $sheet->setCellValue('B4', 'Jam');
        $sheet->setCellValue('C4', 'DURASI');
        
        $kelas = DB::table('kelas')
            ->get()
            ->sort(function($a, $b) {
                $tA = strlen($a->tingkat);
                $tB = strlen($b->tingkat);
                if ($tA !== $tB) return $tA <=> $tB;
                $nA = (int)explode('.', $a->nama_kelas)[1];
                $nB = (int)explode('.', $b->nama_kelas)[1];
                return $nA <=> $nB;
            })->values();
        $kelasX = $kelas->filter(fn($k) => $k->tingkat == 'X')->values();
        $kelasXI = $kelas->filter(fn($k) => $k->tingkat == 'XI')->values();
        $kelasXII = $kelas->filter(fn($k) => $k->tingkat == 'XII')->values();
        
        $startColX = 4;
        $endColX = 4 + count($kelasX) - 1;
        
        $startColXI = $endColX + 1;
        $endColXI = $startColXI + count($kelasXI) - 1;
        
        $startColXII = $endColXI + 1;
        $endColXII = $startColXII + count($kelasXII) - 1;
        
        $sheet->mergeCells(\PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($startColX).'4:'.\PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($endColX).'4');
        $sheet->setCellValue(\PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($startColX).'4', 'KELAS X');
        
        $sheet->mergeCells(\PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($startColXI).'4:'.\PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($endColXI).'4');
        $sheet->setCellValue(\PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($startColXI).'4', 'KELAS XI');
        
        $sheet->mergeCells(\PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($startColXII).'4:'.\PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($endColXII).'4');
        $sheet->setCellValue(\PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($startColXII).'4', 'KELAS XII');
        
        // Class Names
        $colIdx = 4;
        foreach ($kelas as $k) {
            $colName = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colIdx);
            $sheet->setCellValue("{$colName}5", str_replace('.', '', $k->nama_kelas));
            $colIdx++;
        }
        
        $sheet->getStyle("A4:{$lastGridCol}5")->getFont()->setBold(true);
        $sheet->getStyle("A4:{$lastGridCol}5")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getStyle("A4:{$lastGridCol}5")->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN);
        $sheet->getStyle("A4:{$lastGridCol}5")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB('FFD9E1F2');

        // Fetch Schedule Data
        $jadwalData = DB::table('jadwal_pelajaran')->get();
        $matrix = [];
        foreach ($jadwalData as $j) {
            $matrix[$j->hari][$j->jam_ke][$j->kelas_id] = $j->id_guru;
        }
        
        $days = ['Sabtu', 'Ahad', 'Senin', 'Selasa', 'Rabu', 'Kamis'];
        $timeSlots = [
            1 => '07.20 - 08.00',
            2 => '08.00 - 08.40',
            3 => '08.40 - 09.20',
            4 => '09.20 - 10.00',
            5 => '10.20 - 11.00',
            6 => '11.00 - 11.40',
            7 => '11.40 - 12.20',
            8 => '12.20 - 13.00'
        ];
        
        $ahadTimeSlots = [
            1 => '07.20 - 07.50',
            2 => '07.50 - 08.20',
            3 => '08.20 - 08.50',
            4 => '08.50 - 09.20',
            5 => '10.00 - 10.30',
            6 => '10.30 - 11.00',
            7 => '11.00 - 11.30',
            8 => '11.30 - 12.00',
            9 => '12.00 - 12.30',
            10=> '12.30 - 13.00'
        ];
        
        $gridRow = 6;
        foreach ($days as $day) {
            $startDayRow = $gridRow;
            $isAhad = strtoupper($day) === 'AHAD';
            $isSenin = strtoupper($day) === 'SENIN';
            
            // Dhuha
            $sheet->mergeCells("B{$gridRow}:C{$gridRow}");
            $sheet->setCellValue("B{$gridRow}", "06.45 - 07.20");
            $sheet->mergeCells("D{$gridRow}:{$lastGridCol}{$gridRow}");
            $sheet->setCellValue("D{$gridRow}", "SHOLAT DHUHA");
            $sheet->getStyle("B{$gridRow}:{$lastGridCol}{$gridRow}")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB('FF0070C0');
            $sheet->getStyle("B{$gridRow}:{$lastGridCol}{$gridRow}")->getFont()->getColor()->setARGB('FFFFFFFF');
            $sheet->getStyle("B{$gridRow}:{$lastGridCol}{$gridRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $gridRow++;

            for ($jam = 1; $jam <= 8; $jam++) {
                if ($jam == 5) {
                    // Istirahat
                    $sheet->mergeCells("B{$gridRow}:C{$gridRow}");
                    $sheet->setCellValue("B{$gridRow}", $isAhad ? "09.20 - 10.00" : "10.00 - 10.20");
                    $sheet->mergeCells("D{$gridRow}:{$lastGridCol}{$gridRow}");
                    $sheet->setCellValue("D{$gridRow}", "ISTIRAHAT");
                    $sheet->getStyle("B{$gridRow}:{$lastGridCol}{$gridRow}")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB('FFD9E1F2');
                    $sheet->getStyle("B{$gridRow}:{$lastGridCol}{$gridRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                    $gridRow++;
                }
                
                $sheet->setCellValue("B{$gridRow}", $jam);
                $sheet->setCellValue("C{$gridRow}", $isAhad ? $ahadTimeSlots[$jam] : $timeSlots[$jam]);
                
                $colIdx = 4;
                foreach ($kelas as $k) {
                    $colName = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colIdx);
                    $guruId = $matrix[$day][$jam][$k->id] ?? '-';
                    $sheet->setCellValue("{$colName}{$gridRow}", $guruId);
                    $sheet->getStyle("{$colName}{$gridRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                    
                    if ($isSenin && $jam == 1) {
                        $sheet->getStyle("{$colName}{$gridRow}")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB('FFFFC000');
                    }
                    
                    $colIdx++;
                }
                $gridRow++;
            }
            
            // Add Jam 9 and 10 for Ahad
            if ($isAhad) {
                for ($jam = 9; $jam <= 10; $jam++) {
                    $sheet->setCellValue("B{$gridRow}", $jam);
                    $sheet->setCellValue("C{$gridRow}", $ahadTimeSlots[$jam]);
                    
                    $startColStrX = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($startColX);
                    $endColStrX = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($endColX);
                    $sheet->mergeCells("{$startColStrX}{$gridRow}:{$endColStrX}{$gridRow}");
                    $sheet->setCellValue("{$startColStrX}{$gridRow}", "EKSTRAKULIKULER PRAMUKA");
                    $sheet->getStyle("{$startColStrX}{$gridRow}:{$endColStrX}{$gridRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                    
                    $startColStrXI = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($startColXI);
                    $endColStrXI = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($endColXI);
                    $sheet->mergeCells("{$startColStrXI}{$gridRow}:{$endColStrXI}{$gridRow}");
                    $sheet->setCellValue("{$startColStrXI}{$gridRow}", "KOKULIKULER RISET");
                    $sheet->getStyle("{$startColStrXI}{$gridRow}:{$endColStrXI}{$gridRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                    
                    $startColStrXII = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($startColXII);
                    $endColStrXII = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($endColXII);
                    $sheet->mergeCells("{$startColStrXII}{$gridRow}:{$endColStrXII}{$gridRow}");
                    $sheet->setCellValue("{$startColStrXII}{$gridRow}", "BIMBINGAN BELAJAR\nTES KEMAMPUAN AKADEMIK");
                    $sheet->getStyle("{$startColStrXII}{$gridRow}:{$endColStrXII}{$gridRow}")->getAlignment()->setWrapText(true)->setHorizontal(Alignment::HORIZONTAL_CENTER)->setVertical(Alignment::VERTICAL_CENTER);
                    
                    $gridRow++;
                }
            }
            
            // Merge Day Column
            $endDayRow = $gridRow - 1;
            $sheet->mergeCells("A{$startDayRow}:A{$endDayRow}");
            // Spell out day vertically
            $vertDay = implode("\n", str_split(strtoupper($day)));
            $sheet->setCellValue("A{$startDayRow}", $vertDay);
            $sheet->getStyle("A{$startDayRow}")->getAlignment()->setWrapText(true)->setHorizontal(Alignment::HORIZONTAL_CENTER)->setVertical(Alignment::VERTICAL_CENTER);
            $sheet->getStyle("A{$startDayRow}")->getFont()->setBold(true);
            
            $sheet->getStyle("A{$startDayRow}:{$lastGridCol}{$endDayRow}")->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN);
            
            // Thick border bottom of each day block
            $sheet->getStyle("A{$endDayRow}:{$lastGridCol}{$endDayRow}")->getBorders()->getBottom()->setBorderStyle(Border::BORDER_MEDIUM);
        }

        // Final thick outline around matrix
        $sheet->getStyle("A4:{$lastGridCol}".($gridRow-1))->getBorders()->getOutline()->setBorderStyle(Border::BORDER_MEDIUM);
        
        // Legend at bottom
        $legendRow = $gridRow + 1;
        $sheet->setCellValue("B{$legendRow}", "Jadwal berlaku mulai hari AHAD 19 Juli 2026");
        $sheet->getStyle("B{$legendRow}")->getFont()->setBold(true);
        $sheet->setCellValue("B".($legendRow+1), "Tembusan : Mudir Pendidikan PP Tebuireng");
        $sheet->getStyle("B".($legendRow+1))->getFont()->setBold(true);
        $sheet->setCellValue("B".($legendRow+2), "ket :");
        $sheet->setCellValue("C".($legendRow+2), "Jam Pendampingan Wali Kelas");
        $sheet->getStyle("B".($legendRow+2))->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB('FFFFC000');
        
        $writer = new Xlsx($spreadsheet);
        $tempFile = tempnam(sys_get_temp_dir(), 'jadwal');
        $writer->save($tempFile);
        
        return $tempFile;
    }
}
