<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class AttendanceAggregatorTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_attendance_summary_calculation_command(): void
    {
        $siswaId = DB::table('siswa')->first()?->id;
        $this->assertNotNull($siswaId);

        // Insert sample daily attendances
        DB::table('presensi_murid_harian')->insert([
            ['tanggal' => '2026-08-01', 'siswa_id' => $siswaId, 'status' => 'HADIR', 'created_at' => now(), 'updated_at' => now()],
            ['tanggal' => '2026-08-02', 'siswa_id' => $siswaId, 'status' => 'HADIR', 'created_at' => now(), 'updated_at' => now()],
            ['tanggal' => '2026-08-03', 'siswa_id' => $siswaId, 'status' => 'SAKIT', 'created_at' => now(), 'updated_at' => now()],
            ['tanggal' => '2026-08-04', 'siswa_id' => $siswaId, 'status' => 'IZIN', 'created_at' => now(), 'updated_at' => now()],
            ['tanggal' => '2026-08-05', 'siswa_id' => $siswaId, 'status' => 'ALPA', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // Run artisan command
        $this->artisan('presensi:rekap')
            ->assertSuccessful();

        // Check presensi_rekap_semester
        $rekap = DB::table('presensi_rekap_semester')
            ->where('siswa_id', $siswaId)
            ->first();

        $this->assertNotNull($rekap);
        $this->assertEquals(2, $rekap->hadir);
        $this->assertEquals(1, $rekap->sakit);
        $this->assertEquals(1, $rekap->izin);
        $this->assertEquals(1, $rekap->alpa);
    }
}
