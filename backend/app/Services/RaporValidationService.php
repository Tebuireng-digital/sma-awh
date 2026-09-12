<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class RaporValidationService
{
    /**
     * Memeriksa status validasi rapor untuk seluruh rombel/kelas pada semester dan tahun ajaran tertentu.
     * Syarat tervalidasi penuh: seluruh siswa di kelas memiliki rapor dengan status 'approved_by_walikelas' atau 'approved_by_kepsek'.
     */
    public static function checkSemesterValidation(string $tahunAjaran, string $semester): array
    {
        // Ambil seluruh kelas yang memiliki siswa terdaftar
        $allKelas = DB::table('kelas as k')
            ->leftJoin('guru as g', 'k.id_guru_wali', '=', 'g.id_guru')
            ->select('k.id', 'k.nama_kelas', 'k.tingkat', 'g.nama_lengkap as nama_wali')
            ->orderBy('k.nama_kelas')
            ->get();

        $totalKelas = 0;
        $kelasSelesai = 0;
        $kelasPending = [];
        $totalSiswaSemua = 0;
        $totalSiswaTervalidasiSemua = 0;

        foreach ($allKelas as $k) {
            // Dapatkan seluruh ID siswa di kelas ini
            $siswaIds = DB::table('anggota_kelas')
                ->where('kelas_id', $k->id)
                ->pluck('siswa_id')
                ->toArray();

            $totalSiswa = count($siswaIds);
            if ($totalSiswa === 0) {
                // Lewati kelas kosong jika tidak memiliki siswa
                continue;
            }

            $totalKelas++;
            $totalSiswaSemua += $totalSiswa;

            $altTahunAjaran = str_contains($tahunAjaran, '/') ? str_replace('/', '-', $tahunAjaran) : str_replace('-', '/', $tahunAjaran);

            // Hitung siswa yang sudah divalidasi oleh wali kelas atau kepsek
            $validCount = DB::table('rapor_sts')
                ->whereIn('siswa_id', $siswaIds)
                ->whereIn('tahun_ajaran', [$tahunAjaran, $altTahunAjaran])
                ->where('semester', $semester)
                ->whereIn('status_validasi', ['approved_by_walikelas', 'approved_by_kepsek'])
                ->count();

            $totalSiswaTervalidasiSemua += $validCount;

            $isComplete = ($validCount === $totalSiswa);
            if ($isComplete) {
                $kelasSelesai++;
            } else {
                $kelasPending[] = [
                    'kelas_id' => $k->id,
                    'nama_kelas' => $k->nama_kelas,
                    'tingkat' => $k->tingkat,
                    'wali_kelas' => $k->nama_wali ?: 'Belum Ditugaskan',
                    'total_siswa' => $totalSiswa,
                    'siswa_divalidasi' => $validCount,
                    'siswa_belum_divalidasi' => $totalSiswa - $validCount,
                    'persentase' => round(($validCount / max(1, $totalSiswa)) * 100, 1),
                ];
            }
        }

        $canProceed = ($totalKelas > 0 && $kelasSelesai === $totalKelas);

        return [
            'tahun_ajaran' => $tahunAjaran,
            'semester' => $semester,
            'can_proceed' => $canProceed,
            'ringkasan' => [
                'total_kelas' => $totalKelas,
                'kelas_selesai' => $kelasSelesai,
                'kelas_pending' => count($kelasPending),
                'total_siswa' => $totalSiswaSemua,
                'siswa_tervalidasi' => $totalSiswaTervalidasiSemua,
                'siswa_belum_tervalidasi' => $totalSiswaSemua - $totalSiswaTervalidasiSemua,
                'persentase_selesai' => $totalSiswaSemua > 0 ? round(($totalSiswaTervalidasiSemua / $totalSiswaSemua) * 100, 1) : 0,
            ],
            'kelas_pending' => $kelasPending,
        ];
    }

    /**
     * Memeriksa validasi penuh satu tahun ajaran (Semester Ganjil DAN Semester Genap).
     * Syarat ganti tahun ajaran: KEDUA semester harus sudah 100% tervalidasi oleh seluruh wali kelas.
     */
    public static function checkFullYearValidation(string $tahunAjaran): array
    {
        $ganjil = self::checkSemesterValidation($tahunAjaran, 'Ganjil');
        $genap = self::checkSemesterValidation($tahunAjaran, 'Genap');

        $canProceed = $ganjil['can_proceed'] && $genap['can_proceed'];

        return [
            'tahun_ajaran' => $tahunAjaran,
            'can_proceed' => $canProceed,
            'semester_ganjil' => $ganjil,
            'semester_genap' => $genap,
        ];
    }
}
