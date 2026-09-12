<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class HumasApprovalRoleAccessTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    private function createPendingKonten(string $judul = 'Pengajuan Berita Staf Humas'): int
    {
        return DB::table('humas_konten')->insertGetId([
            'judul' => $judul,
            'slug' => \Illuminate\Support\Str::slug($judul) . '-' . rand(100, 999),
            'kategori' => 'Berita',
            'ringkasan' => "Ringkasan $judul",
            'isi' => "Isi lengkap $judul",
            'platform_target' => 'Website',
            'status' => 'Pending Approval',
            'is_public' => 1,
            'is_pinned' => 0,
            'author' => 'Staf Branding & Humas',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function test_guru_staf_cannot_approve_or_reject_content(): void
    {
        // Cari user guru / staf
        $guru = User::where('role', 'guru')->first();
        if (!$guru) {
            $guru = User::factory()->create(['role' => 'guru']);
        }

        $kontenId = $this->createPendingKonten();

        $response = $this->actingAs($guru, 'sanctum')->postJson("/api/v1/humas/konten/{$kontenId}/approval", [
            'action' => 'approve',
        ]);

        $response->assertStatus(403);
        $this->assertStringContainsString('Hanya Kepala Sekolah dan Administrator', $response->json('message'));

        // Pastikan status di database tetap Pending Approval
        $konten = DB::table('humas_konten')->where('id', $kontenId)->first();
        $this->assertEquals('Pending Approval', $konten->status);
    }

    public function test_admin_and_kepala_sekolah_can_approve_content(): void
    {
        // 1. Admin approve
        $admin = User::where('role', 'admin')->first();
        $kontenId1 = $this->createPendingKonten('Berita Disetujui Admin');

        $responseAdmin = $this->actingAs($admin, 'sanctum')->postJson("/api/v1/humas/konten/{$kontenId1}/approval", [
            'action' => 'approve',
        ]);
        $responseAdmin->assertStatus(200);

        $konten1 = DB::table('humas_konten')->where('id', $kontenId1)->first();
        $this->assertEquals('Published', $konten1->status);
        $this->assertNotNull($konten1->published_at);

        // 2. Kepala Sekolah approve
        $kepsek = User::where('role', 'kepala_sekolah')->first();
        if (!$kepsek) {
            $kepsek = User::factory()->create(['role' => 'kepala_sekolah']);
        }

        $kontenId2 = $this->createPendingKonten('Berita Disetujui Kepsek');
        $responseKepsek = $this->actingAs($kepsek, 'sanctum')->postJson("/api/v1/humas/konten/{$kontenId2}/approval", [
            'action' => 'approve',
        ]);
        $responseKepsek->assertStatus(200);

        $konten2 = DB::table('humas_konten')->where('id', $kontenId2)->first();
        $this->assertEquals('Published', $konten2->status);
    }

    public function test_guru_staf_submitting_published_status_is_forced_to_pending_approval(): void
    {
        $guru = User::where('role', 'guru')->first();
        if (!$guru) {
            $guru = User::factory()->create(['role' => 'guru']);
        }

        // Guru mencoba membuat konten baru langsung Published
        $storeResponse = $this->actingAs($guru, 'sanctum')->postJson('/api/v1/humas/konten', [
            'judul' => 'Berita Baru oleh Guru',
            'kategori' => 'Berita',
            'isi' => 'Konten teks berita yang dibuat guru.',
            'status' => 'Published',
        ]);

        $storeResponse->assertStatus(201);
        $createdId = $storeResponse->json('data.id');
        $kontenCreated = DB::table('humas_konten')->where('id', $createdId)->first();
        $this->assertEquals('Pending Approval', $kontenCreated->status);

        // Guru mencoba update status menjadi Published
        $updateResponse = $this->actingAs($guru, 'sanctum')->putJson("/api/v1/humas/konten/{$createdId}", [
            'judul' => 'Berita Baru oleh Guru (Update)',
            'kategori' => 'Berita',
            'isi' => 'Konten teks berita update.',
            'status' => 'Published',
        ]);

        $updateResponse->assertStatus(200);
        $kontenUpdated = DB::table('humas_konten')->where('id', $createdId)->first();
        $this->assertEquals('Pending Approval', $kontenUpdated->status);
    }
}
