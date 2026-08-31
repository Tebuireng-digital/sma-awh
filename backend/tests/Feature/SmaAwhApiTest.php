<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Services\GeofenceService;
use App\Services\SmartPromesSuggestionService;
use App\Services\RencanaMingguEfektifService;
use Illuminate\Support\Facades\DB;

class SmaAwhApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_admin_and_teacher_can_login_successfully()
    {
        // 1. Admin login
        $responseAdmin = $this->postJson('/api/v1/auth/login', [
            'username' => 'admin',
            'password' => 'admin123',
        ]);

        $responseAdmin->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('user.role', 'admin');

        // 2. Teacher login
        $responseGuru = $this->postJson('/api/v1/auth/login', [
            'username' => 'guru_1',
            'password' => 'guru123',
        ]);

        $responseGuru->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('user.role', 'guru')
            ->assertJsonPath('user.id_guru', 1);
    }

    public function test_geofence_validates_distance_correctly()
    {
        // Exact school location (-7.5878, 112.2345)
        $validLocation = GeofenceService::validateLocation(-7.5878, 112.2345);
        $this->assertTrue($validLocation['is_valid']);
        $this->assertLessThanOrEqual(5, $validLocation['distance_meter']);

        // Far away location (-7.2575, 112.7521 - Surabaya)
        $invalidLocation = GeofenceService::validateLocation(-7.2575, 112.7521);
        $this->assertFalse($invalidLocation['is_valid']);
        $this->assertGreaterThan(1000, $invalidLocation['distance_meter']);
    }

    public function test_presensi_masuk_fails_when_outside_geofence()
    {
        $teacher = User::where('username', 'guru_1')->first();

        // Far location
        $response = $this->actingAs($teacher)->postJson('/api/v1/guru/presensi-masuk', [
            'jadwal_id' => 1,
            'latitude' => -7.2575,
            'longitude' => 112.7521,
            'status_kehadiran' => 'hadir',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('status', 'error');
    }

    public function test_student_list_for_class_returns_all_assigned_students()
    {
        $admin = User::where('username', 'admin')->first();
        $kelas = DB::table('kelas')->where('nama_kelas', 'X.1')->first();

        $response = $this->actingAs($admin)->getJson("/api/v1/guru/siswa-kelas/{$kelas->id}");

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('total_siswa', 25);
    }

    public function test_kurikulum_dashboard_stats_returns_correct_totals()
    {
        $kurikulum = User::where('username', 'kurikulum')->first();

        $response = $this->actingAs($kurikulum)->getJson('/api/v1/kurikulum/dashboard-stats');

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('ringkasan.total_guru', 66)
            ->assertJsonPath('ringkasan.total_kelas', 25)
            ->assertJsonPath('ringkasan.total_siswa', 736);
    }

    public function test_can_create_cp_tp_via_web_form()
    {
        $kurikulum = User::where('username', 'kurikulum')->first();

        $response = $this->actingAs($kurikulum)->postJson('/api/v1/kurikulum/perangkat-ajar/cp-tp', [
            'mapel_id' => 1,
            'tingkat' => 'X',
            'elemen' => 'Pemahaman Konsep Agama',
            'deskripsi_cp' => 'Memahami nilai-nilai keislaman dan akhlakul karimah.',
            'tujuan_pembelajaran' => [
                [
                    'kode_tp' => 'TP-PAI-10.1',
                    'deskripsi_tp' => 'Menganalisis konsep al-Kulliyat al-Khamsah.',
                    'alokasi_jp' => 3,
                ]
            ]
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success');

        $this->assertDatabaseHas('tujuan_pembelajaran', [
            'kode_tp' => 'TP-PAI-10.1',
        ]);
    }

    public function test_dual_calendar_kemenag_and_sekolah_pondok_registration()
    {
        $admin = User::where('username', 'admin')->first();

        // Register Kemenag holiday
        $responseKemenag = $this->actingAs($admin)->postJson('/api/v1/admin/kalender-akademik', [
            'tahun_ajaran_id' => 1,
            'sumber_kalender' => 'kemenag_dinas',
            'jenis_hari' => 'libur_nasional',
            'tanggal' => '2026-08-17',
            'keterangan' => 'HUT Kemerdekaan RI',
            'is_libur' => true,
            'is_acara_pondok' => false,
        ]);
        $responseKemenag->assertStatus(200)->assertJsonPath('status', 'success');

        // Register Pondok Tebuireng event
        $responsePondok = $this->actingAs($admin)->postJson('/api/v1/admin/kalender-akademik', [
            'tahun_ajaran_id' => 1,
            'sumber_kalender' => 'sekolah_pondok',
            'jenis_hari' => 'kegiatan_pondok',
            'tanggal' => '2026-09-15',
            'keterangan' => 'Haul KH. M. Hasyim Asy\'ari & Libur Santri',
            'is_libur' => true,
            'is_acara_pondok' => true,
        ]);
        $responsePondok->assertStatus(200)->assertJsonPath('status', 'success');

        // Fetch calendar & verify RME stats
        $responseIndex = $this->actingAs($admin)->getJson('/api/v1/admin/kalender-akademik?tahun_ajaran_id=1');
        $responseIndex->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('total_agenda', 2);
    }

    public function test_academic_year_rollover()
    {
        $admin = User::where('username', 'admin')->first();

        $response = $this->actingAs($admin)->postJson('/api/v1/admin/tahun-ajaran-rollover', [
            'tahun_ajaran' => '2027/2028',
            'tanggal_mulai' => '2027-07-15',
            'tanggal_selesai' => '2028-06-20',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success');

        $this->assertDatabaseHas('tahun_ajaran', [
            'nama' => '2027/2028',
            'is_active' => true,
        ]);
    }
}
