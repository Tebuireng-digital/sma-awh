<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class HumasKontenPublicVisibilityTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();

        // Seed sample humas content for test
        DB::table('humas_konten')->insert([
            [
                'judul' => 'Berita Kegiatan Santri',
                'slug' => 'berita-kegiatan-santri',
                'kategori' => 'Berita',
                'isi' => 'Konten berita lengkap kegiatan santri.',
                'ringkasan' => 'Ringkasan berita santri.',
                'status' => 'Published',
                'is_pinned' => 1,
                'is_public' => 1,
                'platform_target' => 'Website',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'judul' => 'Pengumuman Libur Nasional',
                'slug' => 'pengumuman-libur-nasional',
                'kategori' => 'Pengumuman',
                'isi' => 'Isi pengumuman libur.',
                'ringkasan' => 'Ringkasan libur.',
                'status' => 'Published',
                'is_pinned' => 0,
                'is_public' => 1,
                'platform_target' => 'Website',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'judul' => 'Foto Aset Galeri Kesiswaan',
                'slug' => 'aset-kesiswaan-osis-1',
                'kategori' => 'Aset Web',
                'isi' => 'Foto galeri internal osis.',
                'ringkasan' => 'Aset foto osis.',
                'status' => 'Published',
                'is_pinned' => 0,
                'is_public' => 0,
                'platform_target' => 'Website',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'judul' => 'Draft Berita Rahasia',
                'slug' => 'draft-berita-rahasia',
                'kategori' => 'Berita',
                'isi' => 'Berita belum dipublish.',
                'ringkasan' => 'Draft berita.',
                'status' => 'Draft',
                'is_pinned' => 0,
                'is_public' => 1,
                'platform_target' => 'Website',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    /**
     * Test getKontenPublik only returns published items where is_public is true.
     */
    public function test_get_konten_publik_only_returns_public_published_items_by_default(): void
    {
        $response = $this->getJson('/api/v1/humas/konten-publik');

        $response->assertStatus(200)
            ->assertJson(['status' => 'success']);

        $data = $response->json('data');
        $titles = array_column($data, 'judul');
        $this->assertContains('Berita Kegiatan Santri', $titles);
        $this->assertContains('Pengumuman Libur Nasional', $titles);
        $this->assertNotContains('Foto Aset Galeri Kesiswaan', $titles);
        $this->assertNotContains('Draft Berita Rahasia', $titles);

        foreach ($data as $item) {
            $this->assertTrue((bool)$item['is_public']);
        }
    }

    /**
     * Test that explicit kategori=Aset Web allows fetching internal asset items.
     */
    public function test_get_konten_publik_allows_loading_aset_web_when_explicitly_requested(): void
    {
        $response = $this->getJson('/api/v1/humas/konten-publik?kategori=Aset%20Web');

        $response->assertStatus(200)
            ->assertJson(['status' => 'success']);

        $data = $response->json('data');
        $this->assertCount(1, $data);
        $this->assertEquals('Foto Aset Galeri Kesiswaan', $data[0]['judul']);
        $this->assertFalse($data[0]['is_public']);
    }

    /**
     * Test toggle-public endpoint toggles visibility state back and forth.
     */
    public function test_toggle_public_endpoint_toggles_visibility(): void
    {
        $target = DB::table('humas_konten')->where('slug', 'aset-kesiswaan-osis-1')->first();
        $this->assertNotNull($target);
        $this->assertEquals(0, $target->is_public);

        $user = \App\Models\User::where('role', 'admin')->first();

        // Toggle from 0 to 1
        $res1 = $this->actingAs($user)->postJson("/api/v1/humas/konten/{$target->id}/toggle-public");
        $res1->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'is_public' => true,
            ]);

        $this->assertEquals(1, DB::table('humas_konten')->where('id', $target->id)->value('is_public'));

        // Toggle back from 1 to 0
        $res2 = $this->actingAs($user)->postJson("/api/v1/humas/konten/{$target->id}/toggle-public");
        $res2->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'is_public' => false,
            ]);

        $this->assertEquals(0, DB::table('humas_konten')->where('id', $target->id)->value('is_public'));
    }
}
