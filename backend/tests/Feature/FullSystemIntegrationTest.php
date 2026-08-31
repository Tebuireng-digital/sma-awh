<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Services\GeofenceService;
use App\Services\WaGatewayService;
use App\Services\SmartPromesSuggestionService;
use App\Services\RencanaMingguEfektifService;
use App\Services\TahunAjaranRolloverService;
use Illuminate\Support\Facades\DB;

class FullSystemIntegrationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_01_database_seeder_populated_all_master_data_correctly()
    {
        $this->assertEquals(66, DB::table('guru')->count());
        $this->assertEquals(25, DB::table('kelas')->count());
        $this->assertEquals(736, DB::table('siswa')->count());
        $this->assertGreaterThan(0, DB::table('users')->count());
        $this->assertDatabaseHas('profil_sekolah', ['nama_sekolah' => 'SMA ABDUL WAHID HASYIM TEBUIRENG']);
    }

    public function test_02_authentication_and_password_change_flow()
    {
        // Login as Admin
        $resAdmin = $this->postJson('/api/v1/auth/login', [
            'username' => 'admin',
            'password' => 'admin123',
        ]);
        $resAdmin->assertStatus(200)->assertJsonPath('status', 'success');
        $token = $resAdmin->json('token');

        // Fetch /me
        $resMe = $this->withHeader('Authorization', "Bearer {$token}")->getJson('/api/v1/auth/me');
        $resMe->assertStatus(200)->assertJsonPath('user.username', 'admin');

        // Change password
        $resPwd = $this->withHeader('Authorization', "Bearer {$token}")->postJson('/api/v1/auth/change-password', [
            'old_password' => 'admin123',
            'new_password' => 'adminNewPass123',
            'new_password_confirmation' => 'adminNewPass123',
        ]);
        $resPwd->assertStatus(200)->assertJsonPath('status', 'success');

        // Login with new password
        $resLoginNew = $this->postJson('/api/v1/auth/login', [
            'username' => 'admin',
            'password' => 'adminNewPass123',
        ]);
        $resLoginNew->assertStatus(200)->assertJsonPath('status', 'success');
    }

    public function test_03_admin_dynamic_settings_and_wa_bot_configuration()
    {
        $admin = User::where('username', 'admin')->first();

        // Update settings: Radius 150m, Toleransi 25m
        $resUpdate = $this->actingAs($admin)->postJson('/api/v1/admin/pengaturan', [
            'latitude_sekolah' => -7.5878,
            'longitude_sekolah' => 112.2345,
            'radius_toleransi_meter' => 150,
            'toleransi_terlambat_menit' => 25,
            'wa_bot_enabled' => true,
            'wa_gateway_url' => 'http://localhost:3000',
            'wa_gateway_key' => 'secret_key_bot_tebuireng',
        ]);
        $resUpdate->assertStatus(200)->assertJsonPath('status', 'success');

        $this->assertDatabaseHas('pengaturan_sekolah', [
            'radius_toleransi_meter' => 150,
            'toleransi_terlambat_menit' => 25,
        ]);
    }

    public function test_04_geofencing_gps_checkin_and_inval_piket_flow()
    {
        $teacher = User::where('username', 'guru_1')->first();

        // 1. Valid Checkin inside school radius
        $resMasuk = $this->actingAs($teacher)->postJson('/api/v1/guru/presensi-masuk', [
            'jadwal_id' => 1,
            'latitude' => -7.5878,
            'longitude' => 112.2345,
            'status_kehadiran' => 'hadir',
        ]);
        $resMasuk->assertStatus(200)->assertJsonPath('status', 'success');

        // 2. Finish session
        $presensiId = $resMasuk->json('presensi_guru_id');
        $resSelesai = $this->actingAs($teacher)->postJson("/api/v1/guru/presensi-selesai/{$presensiId}");
        $resSelesai->assertStatus(200)->assertJsonPath('status', 'success');

        // 3. Absent teacher triggers inval for Guru Piket
        $teacher2 = User::where('username', 'guru_2')->first();
        $resIzin = $this->actingAs($teacher2)->postJson('/api/v1/guru/presensi-masuk', [
            'jadwal_id' => 2,
            'latitude' => -7.5878,
            'longitude' => 112.2345,
            'status_kehadiran' => 'sakit',
            'tugas_mandiri' => 'Kerjakan LKS Hal 45',
        ]);
        $resIzin->assertStatus(200)->assertJsonPath('status', 'success');

        // 4. Guru Piket checks empty classes
        $piket = User::where('username', 'piket')->first();
        $resKosong = $this->actingAs($piket)->getJson('/api/v1/piket/kelas-kosong');
        $resKosong->assertStatus(200)->assertJsonPath('total_kelas_kosong', 1);

        // 5. Guru Piket claims inval
        $presensiInvalId = $resIzin->json('presensi_guru_id');
        $resKlaim = $this->actingAs($piket)->postJson('/api/v1/piket/klaim-inval', [
            'presensi_guru_id' => $presensiInvalId,
        ]);
        $resKlaim->assertStatus(200)->assertJsonPath('status', 'success');
    }

    public function test_05_jurnal_mengajar_and_promes_auto_completion()
    {
        $teacher = User::where('username', 'guru_1')->first();

        // Check in first
        $resMasuk = $this->actingAs($teacher)->postJson('/api/v1/guru/presensi-masuk', [
            'jadwal_id' => 1,
            'latitude' => -7.5878,
            'longitude' => 112.2345,
            'status_kehadiran' => 'hadir',
        ]);
        $presensiId = $resMasuk->json('presensi_guru_id');

        // Submit Journal without FK requirement on dummy IDs
        $resJurnal = $this->actingAs($teacher)->postJson('/api/v1/guru/jurnal-mengajar', [
            'presensi_guru_id' => $presensiId,
            'bab_materi' => 'Bab 1: Keanekaragaman Hayati',
            'catatan_kelas' => 'Siswa sangat aktif berdiskusi.',
            'tugas_mandiri' => 'Resume Hal 12-15',
            'status_ketercapaian' => 'tercapai',
        ]);
        $resJurnal->assertStatus(200)->assertJsonPath('status', 'success');
    }

    public function test_06_fast_checklist_student_attendance_and_wa_trigger()
    {
        $teacher = User::where('username', 'guru_1')->first();

        // Check in first
        $resMasuk = $this->actingAs($teacher)->postJson('/api/v1/guru/presensi-masuk', [
            'jadwal_id' => 1,
            'latitude' => -7.5878,
            'longitude' => 112.2345,
            'status_kehadiran' => 'hadir',
        ]);
        $presensiId = $resMasuk->json('presensi_guru_id');

        $kelas = DB::table('kelas')->first();
        $siswaList = DB::table('anggota_kelas')->where('kelas_id', $kelas->id)->limit(3)->pluck('siswa_id');

        $resAbsen = $this->actingAs($teacher)->postJson('/api/v1/guru/presensi-murid', [
            'presensi_guru_id' => $presensiId,
            'absensi' => [
                ['siswa_id' => $siswaList[0], 'status' => 'Hadir'],
                ['siswa_id' => $siswaList[1], 'status' => 'Terlambat', 'keterangan' => 'Ban bocor'],
                ['siswa_id' => $siswaList[2], 'status' => 'Alpa', 'keterangan' => 'Tanpa keterangan'],
            ]
        ]);
        $resAbsen->assertStatus(200)->assertJsonPath('status', 'success');

        // Verify WA Notification Log
        $this->assertDatabaseHas('log_notifikasi_wa', [
            'penerima_type' => 'ortu',
        ]);
    }

    public function test_07_dual_calendar_rme_calculation_and_year_rollover()
    {
        $admin = User::where('username', 'admin')->first();

        // 1. Add Kemenag & Pondok Events
        $this->actingAs($admin)->postJson('/api/v1/admin/kalender-akademik', [
            'tahun_ajaran_id' => 1,
            'sumber_kalender' => 'sekolah_pondok',
            'jenis_hari' => 'kegiatan_pondok',
            'tanggal' => '2026-10-22',
            'keterangan' => 'Hari Santri Nasional & Libur Pesantren Tebuireng',
            'is_libur' => true,
            'is_acara_pondok' => true,
        ]);

        // 2. Fetch RME
        $resRme = $this->actingAs($admin)->getJson('/api/v1/admin/kalender-akademik?tahun_ajaran_id=1');
        $resRme->assertStatus(200)->assertJsonPath('status', 'success');

        // 3. 1-Click Year Rollover
        $resRollover = $this->actingAs($admin)->postJson('/api/v1/admin/tahun-ajaran-rollover', [
            'tahun_ajaran' => '2028/2029',
            'tanggal_mulai' => '2028-07-15',
            'tanggal_selesai' => '2029-06-20',
        ]);
        $resRollover->assertStatus(200)->assertJsonPath('status', 'success');
        $this->assertDatabaseHas('tahun_ajaran', ['nama' => '2028/2029', 'is_active' => true]);
    }
}
