<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class HumasKontenPinLimitTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    /**
     * Helper untuk membuat artikel berita publik
     */
    private function createBerita(string $judul, bool $isPinned = false, ?string $pinnedAt = null): int
    {
        return DB::table('humas_konten')->insertGetId([
            'judul' => $judul,
            'slug' => \Illuminate\Support\Str::slug($judul) . '-' . rand(100, 999),
            'kategori' => 'Berita',
            'ringkasan' => "Ringkasan $judul",
            'isi' => "Isi lengkap $judul",
            'platform_target' => 'Website',
            'status' => 'Published',
            'is_public' => 1,
            'is_pinned' => $isPinned ? 1 : 0,
            'pinned_at' => $pinnedAt,
            'published_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Test bahwa jika sudah ada 3 konten disematkan, menyematkan konten ke-4
     * akan otomatis melepas sematan dari konten yang terlama disematkan.
     */
    public function test_pinning_fourth_item_automatically_unpins_the_oldest_pinned_item(): void
    {
        $admin = \App\Models\User::where('role', 'admin')->first();

        // Pastikan tidak ada pin lama
        DB::table('humas_konten')->update(['is_pinned' => 0, 'pinned_at' => null]);

        // Buat 3 berita yang disematkan dengan waktu pinned_at berbeda
        $id1 = $this->createBerita('Berita Pertama (Terlama)', true, '2026-09-01 10:00:00');
        $id2 = $this->createBerita('Berita Kedua (Menengah)', true, '2026-09-01 11:00:00');
        $id3 = $this->createBerita('Berita Ketiga (Terbaru)', true, '2026-09-01 12:00:00');

        // Buat berita ke-4 yang belum disematkan
        $id4 = $this->createBerita('Berita Keempat (Akan Disematkan)', false, null);

        // Verifikasi awal: tepat 3 disematkan
        $this->assertEquals(3, DB::table('humas_konten')->where('is_pinned', 1)->count());

        // Toggle pin pada berita ke-4
        $res = $this->actingAs($admin)->postJson("/api/v1/humas/konten/{$id4}/toggle-pin");

        $res->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'is_pinned' => true,
                'unpinned_id' => $id1, // Item 1 (terlama) harus dilepas
                'total_pinned' => 3,
            ]);

        // Verifikasi database: total tetap tepat 3
        $pinnedInDb = DB::table('humas_konten')->where('is_pinned', 1)->pluck('id')->all();
        $this->assertCount(3, $pinnedInDb);

        // Berita 1 harus sudah unpinned
        $this->assertNotContains($id1, $pinnedInDb);
        $this->assertEquals(0, DB::table('humas_konten')->where('id', $id1)->value('is_pinned'));
        $this->assertNull(DB::table('humas_konten')->where('id', $id1)->value('pinned_at'));

        // Berita 2, 3, dan 4 harus berstatus disematkan
        $this->assertContains($id2, $pinnedInDb);
        $this->assertContains($id3, $pinnedInDb);
        $this->assertContains($id4, $pinnedInDb);
    }

    /**
     * Test bahwa melepas sematan (unpin) secara manual mengurangi jumlah disematkan menjadi 2.
     */
    public function test_unpinning_an_item_manually_reduces_pinned_count(): void
    {
        $admin = \App\Models\User::where('role', 'admin')->first();

        DB::table('humas_konten')->update(['is_pinned' => 0, 'pinned_at' => null]);

        $id1 = $this->createBerita('Berita 1', true, '2026-09-01 10:00:00');
        $id2 = $this->createBerita('Berita 2', true, '2026-09-01 11:00:00');
        $id3 = $this->createBerita('Berita 3', true, '2026-09-01 12:00:00');

        $res = $this->actingAs($admin)->postJson("/api/v1/humas/konten/{$id2}/toggle-pin");

        $res->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'is_pinned' => false,
                'total_pinned' => 2,
            ]);

        $this->assertEquals(2, DB::table('humas_konten')->where('is_pinned', 1)->count());
        $this->assertEquals(0, DB::table('humas_konten')->where('id', $id2)->value('is_pinned'));
    }

    /**
     * Test bahwa endpoint publik mengembalikan konten yang disematkan paling atas
     * dengan urutan pinned_at terbaru secara konsisten.
     */
    public function test_public_endpoint_returns_pinned_items_first_ordered_by_pinned_at(): void
    {
        DB::table('humas_konten')->update(['is_pinned' => 0, 'pinned_at' => null]);

        $id1 = $this->createBerita('Berita Pin 1', true, '2026-09-01 08:00:00');
        $id2 = $this->createBerita('Berita Pin 2', true, '2026-09-01 12:00:00');
        $id3 = $this->createBerita('Berita Pin 3 (Paling Baru Dipin)', true, '2026-09-01 16:00:00');
        $id4 = $this->createBerita('Berita Biasa Tanpa Pin', false, null);

        $res = $this->getJson('/api/v1/humas/konten-publik?limit=10');

        $res->assertStatus(200);
        $data = $res->json('data');

        // Tiga item pertama harus item yang berstatus is_pinned = true
        $this->assertTrue((bool)$data[0]['is_pinned']);
        $this->assertTrue((bool)$data[1]['is_pinned']);
        $this->assertTrue((bool)$data[2]['is_pinned']);

        // Item pertama harus yang paling baru disematkan (id3)
        $this->assertEquals($id3, $data[0]['id']);
        $this->assertEquals($id2, $data[1]['id']);
        $this->assertEquals($id1, $data[2]['id']);
    }

    /**
     * Test bahwa store atau update konten baru dengan is_pinned = 1 juga mematuhi batas maksimal 3.
     */
    public function test_store_or_update_with_is_pinned_enforces_maximum_three(): void
    {
        $admin = \App\Models\User::where('role', 'admin')->first();

        DB::table('humas_konten')->update(['is_pinned' => 0, 'pinned_at' => null]);

        $id1 = $this->createBerita('Pin Lama 1', true, '2026-09-01 08:00:00');
        $id2 = $this->createBerita('Pin Lama 2', true, '2026-09-01 09:00:00');
        $id3 = $this->createBerita('Pin Lama 3', true, '2026-09-01 10:00:00');

        // Simpan berita baru via store dengan is_pinned = 1
        $resStore = $this->actingAs($admin)->postJson('/api/v1/humas/konten', [
            'judul' => 'Berita Baru Langsung Pin',
            'kategori' => 'Berita',
            'ringkasan' => 'Ringkasan baru',
            'isi' => 'Konten lengkap berita baru',
            'status' => 'Published',
            'is_pinned' => 1,
            'is_public' => 1,
        ]);

        $resStore->assertStatus(201);
        $newId = $resStore->json('data.id');

        // Total tetap 3
        $this->assertEquals(3, DB::table('humas_konten')->where('is_pinned', 1)->count());

        // Id1 (tertua) harus sudah lepas
        $this->assertEquals(0, DB::table('humas_konten')->where('id', $id1)->value('is_pinned'));

        // newId harus disematkan
        $this->assertEquals(1, DB::table('humas_konten')->where('id', $newId)->value('is_pinned'));
    }
}
