<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use App\Models\ProgramTahunan;

class TahunAjaranRolloverService
{
    /**
     * Rollover to a New Academic Year and reuse CP & TP
     */
    public static function createNewAcademicYear(string $tahunAjaranNama, string $tanggalMulai = '2027-07-15', string $tanggalSelesai = '2028-06-20'): array
    {
        DB::beginTransaction();
        try {
            // 1. Deactivate old active academic year
            DB::table('tahun_ajaran')->update(['is_active' => false]);

            // 2. Create new Academic Year record
            $newTahunAjaranId = DB::table('tahun_ajaran')->insertGetId([
                'nama' => $tahunAjaranNama,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // 3. Create Semester Ganjil & Genap for new academic year
            DB::table('semester')->insert([
                ['tahun_ajaran_id' => $newTahunAjaranId, 'nama' => 'Ganjil', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
                ['tahun_ajaran_id' => $newTahunAjaranId, 'nama' => 'Genap', 'is_active' => false, 'created_at' => now(), 'updated_at' => now()],
            ]);

            // 4. Duplicate/Reuse Prota entries for all existing active subjects
            $mapelList = DB::table('mata_pelajaran')->get();

            $protaCount = 0;
            foreach ($mapelList as $mapel) {
                foreach (['X', 'XI', 'XII'] as $tingkat) {
                    ProgramTahunan::firstOrCreate([
                        'tahun_ajaran_id' => $newTahunAjaranId,
                        'mapel_id' => $mapel->id,
                        'tingkat' => $tingkat,
                    ], [
                        'total_jp' => 72,
                    ]);
                    $protaCount++;
                }
            }

            DB::commit();

            return [
                'status' => 'success',
                'message' => "Tahun Ajaran Baru {$tahunAjaranNama} berhasil dibuat. Master CP & TP siap digunakan.",
                'new_tahun_ajaran_id' => $newTahunAjaranId,
                'total_prota_created' => $protaCount,
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            return ['status' => 'error', 'message' => 'Gagal membuat tahun ajaran baru: ' . $e->getMessage()];
        }
    }
}
