<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class RecalculateAttendanceSummary extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'presensi:rekap {--tahun_ajaran_id= : ID Tahun Ajaran (opsional, default: aktif)} {--semester= : Semester GANJIL/GENAP (opsional, default: aktif)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Kalkulasi & perbarui ringkasan agregasi presensi semesteran siswa ke tabel presensi_rekap_semester';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Memulai agregasi data presensi siswa...');

        $tahunAjaranId = $this->option('tahun_ajaran_id');
        $semesterInput = $this->option('semester');

        if (!$tahunAjaranId) {
            $activeTA = DB::table('tahun_ajaran')->where('is_active', true)->first() 
                ?? DB::table('tahun_ajaran')->latest('id')->first();
            $tahunAjaranId = $activeTA ? $activeTA->id : 1;
        }

        if (!$semesterInput) {
            $activeSem = DB::table('semester')
                ->where('tahun_ajaran_id', $tahunAjaranId)
                ->where('is_active', true)
                ->first();
            $semesterInput = $activeSem ? strtoupper($activeSem->nama) : 'GANJIL';
        } else {
            $semesterInput = strtoupper($semesterInput);
        }

        // Ambil data agregasi dari presensi_murid_harian
        $aggregates = DB::table('presensi_murid_harian')
            ->select(
                'siswa_id',
                DB::raw("SUM(CASE WHEN UPPER(status) = 'HADIR' THEN 1 ELSE 0 END) as total_hadir"),
                DB::raw("SUM(CASE WHEN UPPER(status) = 'SAKIT' THEN 1 ELSE 0 END) as total_sakit"),
                DB::raw("SUM(CASE WHEN UPPER(status) = 'IZIN' THEN 1 ELSE 0 END) as total_izin"),
                DB::raw("SUM(CASE WHEN UPPER(status) = 'ALPA' THEN 1 ELSE 0 END) as total_alpa"),
                DB::raw("SUM(CASE WHEN UPPER(status) = 'TERLAMBAT' THEN 1 ELSE 0 END) as total_terlambat"),
                DB::raw("SUM(CASE WHEN UPPER(status) = 'DISPENSASI' THEN 1 ELSE 0 END) as total_dispensasi"),
                DB::raw("COUNT(*) as total_hari")
            )
            ->groupBy('siswa_id')
            ->get();

        $count = 0;
        foreach ($aggregates as $row) {
            $totalHari = (int)$row->total_hari;
            $hadirCount = (int)$row->total_hadir + (int)$row->total_terlambat + (int)$row->total_dispensasi;
            $persentase = $totalHari > 0 ? round(($hadirCount / $totalHari) * 100, 2) : 100.00;

            DB::table('presensi_rekap_semester')->updateOrInsert(
                [
                    'siswa_id' => $row->siswa_id,
                    'tahun_ajaran_id' => $tahunAjaranId,
                    'semester' => in_array($semesterInput, ['GANJIL', 'GENAP']) ? $semesterInput : 'GANJIL',
                ],
                [
                    'hadir' => (int)$row->total_hadir,
                    'sakit' => (int)$row->total_sakit,
                    'izin' => (int)$row->total_izin,
                    'alpa' => (int)$row->total_alpa,
                    'terlambat' => (int)$row->total_terlambat,
                    'dispensasi' => (int)$row->total_dispensasi,
                    'persentase_kehadiran' => $persentase,
                    'terakhir_dihitung' => now(),
                    'updated_at' => now(),
                ]
            );
            $count++;
        }

        $this->info("Berhasil mengagregasi data presensi untuk {$count} siswa (Tahun Ajaran ID: {$tahunAjaranId}, Semester: {$semesterInput}).");
        return Command::SUCCESS;
    }
}
