<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class HumasSyncService
{
    /**
     * URL Endpoint WordPress REST API SMA AWH
     */
    protected string $wpApiUrl = 'https://smaawhtebuireng.sch.id/wp-json/wp/v2/posts';

    /**
     * Sinkronisasi data berita dan gambar dari website resmi ke database lokal.
     *
     * @param int $perPage
     * @return array
     */
    public function syncPosts(int $perPage = 25): array
    {
        $targetStorageDir = storage_path('app/public/humas');
        if (!file_exists($targetStorageDir)) {
            mkdir($targetStorageDir, 0777, true);
        }

        // Jalur frontend public jika tersedia
        $frontendPublicHumas = base_path('../frontend/public/humas');
        if (!file_exists($frontendPublicHumas)) {
            @mkdir($frontendPublicHumas, 0777, true);
        }

        $url = "{$this->wpApiUrl}?_embed&per_page={$perPage}";

        try {
            $response = Http::withOptions([
                'verify' => false,
                'timeout' => 45,
            ])->withHeaders([
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) SMA-AWH-Sync/1.0',
            ])->get($url);

            if (!$response->successful()) {
                Log::error("Gagal mengambil data dari WP API: {$response->status()} - {$response->body()}");
                return [
                    'success' => false,
                    'message' => "Gagal terhubung ke website sumber: HTTP {$response->status()}",
                    'synced_count' => 0,
                ];
            }

            $posts = $response->json();
            if (!is_array($posts)) {
                return [
                    'success' => false,
                    'message' => 'Format respon tidak valid dari website sumber.',
                    'synced_count' => 0,
                ];
            }

            $syncedCount = 0;
            $items = [];

            foreach ($posts as $post) {
                $externalId = (string)($post['id'] ?? '');
                $rawTitle = $post['title']['rendered'] ?? 'Tanpa Judul';
                $title = html_entity_decode(strip_tags($rawTitle), ENT_QUOTES | ENT_HTML5, 'UTF-8');
                $title = trim(preg_replace('/\s+/', ' ', $title));

                $slug = $post['slug'] ?? Str::slug($title);
                $rawContent = $post['content']['rendered'] ?? '';
                $rawExcerpt = $post['excerpt']['rendered'] ?? '';

                $ringkasan = html_entity_decode(strip_tags($rawExcerpt), ENT_QUOTES | ENT_HTML5, 'UTF-8');
                $ringkasan = trim(preg_replace('/\s+/', ' ', $ringkasan));
                if (empty($ringkasan)) {
                    $ringkasan = Str::limit(html_entity_decode(strip_tags($rawContent), ENT_QUOTES | ENT_HTML5, 'UTF-8'), 200);
                }

                // Ambil gambar utama (Featured Media)
                $originalImageUrl = null;
                if (!empty($post['_embedded']['wp:featuredmedia'][0]['source_url'])) {
                    $originalImageUrl = $post['_embedded']['wp:featuredmedia'][0]['source_url'];
                }

                $localImagePath = null;
                $publicUrl = null;

                if ($originalImageUrl) {
                    $downloaded = $this->downloadAndSaveImage($originalImageUrl, $targetStorageDir, $frontendPublicHumas);
                    if ($downloaded) {
                        $localImagePath = $downloaded['storage_path'];
                        $publicUrl = $downloaded['public_url'];
                    } else {
                        $publicUrl = $originalImageUrl;
                    }
                }

                // Tentukan Kategori otomatis berdasarkan kata kunci judul
                $kategori = $this->detectCategory($title);

                $postDate = !empty($post['date']) ? date('Y-m-d H:i:s', strtotime($post['date'])) : now();
                $sourceUrl = $post['link'] ?? "https://smaawhtebuireng.sch.id/{$slug}/";

                // Simpan atau update ke database (Upsert berdasarkan external_id atau slug)
                $existing = DB::table('humas_konten')
                    ->where('external_id', $externalId)
                    ->orWhere('slug', $slug)
                    ->first();

                $payload = [
                    'judul' => $title,
                    'slug' => $slug,
                    'kategori' => $kategori,
                    'ringkasan' => $ringkasan,
                    'isi' => $rawContent,
                    'platform_target' => 'Website',
                    'image_url' => $publicUrl ?? $originalImageUrl,
                    'local_image_path' => $localImagePath,
                    'source_url' => $sourceUrl,
                    'external_id' => $externalId,
                    'author' => 'Humas SMA AWH',
                    'status' => 'Published',
                    'published_at' => $postDate,
                    'updated_at' => now(),
                ];

                if ($existing) {
                    DB::table('humas_konten')->where('id', $existing->id)->update($payload);
                } else {
                    $payload['created_at'] = $postDate;
                    DB::table('humas_konten')->insert($payload);
                }

                $syncedCount++;
                $items[] = [
                    'id' => $externalId,
                    'judul' => $title,
                    'kategori' => $kategori,
                    'image' => $publicUrl,
                ];
            }

            return [
                'success' => true,
                'message' => "Berhasil menyinkronkan {$syncedCount} artikel dan mengunduh berkas gambar ke penyimpanan lokal.",
                'synced_count' => $syncedCount,
                'items' => $items,
            ];
        } catch (\Exception $e) {
            Log::error("Error syncing humas content: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage(),
                'synced_count' => 0,
            ];
        }
    }

    /**
     * Download dan simpan gambar ke penyimpanan lokal & frontend public.
     */
    protected function downloadAndSaveImage(string $url, string $storageDir, string $frontendDir): ?array
    {
        try {
            $parsedUrl = parse_url($url);
            $filename = basename($parsedUrl['path'] ?? 'image.jpg');
            // Bersihkan nama file
            $filename = preg_replace('/[^a-zA-Z0-9_\.-]/', '_', $filename);
            if (!preg_match('/\.(jpg|jpeg|png|webp|gif)$/i', $filename)) {
                $filename .= '.jpg';
            }

            $storageFile = $storageDir . '/' . $filename;
            $frontendFile = $frontendDir . '/' . $filename;

            // Jika file belum ada, unduh dari URL
            if (!file_exists($storageFile) || filesize($storageFile) < 100) {
                $imgResponse = Http::withOptions([
                    'verify' => false,
                    'timeout' => 30,
                ])->get($url);

                if ($imgResponse->successful()) {
                    file_put_contents($storageFile, $imgResponse->body());
                    if (is_dir($frontendDir)) {
                        @file_put_contents($frontendFile, $imgResponse->body());
                    }
                } else {
                    return null;
                }
            } else {
                // Pastikan juga tersalin ke frontend/public jika belum ada
                if (is_dir($frontendDir) && !file_exists($frontendFile)) {
                    @copy($storageFile, $frontendFile);
                }
            }

            return [
                'storage_path' => '/storage/humas/' . $filename,
                'public_url' => '/storage/humas/' . $filename,
                'filename' => $filename,
            ];
        } catch (\Exception $e) {
            Log::warning("Gagal mengunduh gambar {$url}: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Klasifikasi kategori berita berdasarkan judul.
     */
    protected function detectCategory(string $title): string
    {
        $titleLower = strtolower($title);

        if (
            str_contains($titleLower, 'olimpiade') ||
            str_contains($titleLower, 'sains') ||
            str_contains($titleLower, 'kompetisi') ||
            str_contains($titleLower, 'lomba') ||
            str_contains($titleLower, 'juara') ||
            str_contains($titleLower, 'prestasi') ||
            str_contains($titleLower, 'terbaik') ||
            str_contains($titleLower, 'fls2n') ||
            str_contains($titleLower, 'hardiknas')
        ) {
            return 'Prestasi';
        }

        if (
            str_contains($titleLower, 'mpk') ||
            str_contains($titleLower, 'osis') ||
            str_contains($titleLower, 'mpls') ||
            str_contains($titleLower, 'jalan sehat') ||
            str_contains($titleLower, 'diklat') ||
            str_contains($titleLower, 'game') ||
            str_contains($titleLower, 'basket') ||
            str_contains($titleLower, 'aspectum') ||
            str_contains($titleLower, 'kbm') ||
            str_contains($titleLower, 'cek kesehatan') ||
            str_contains($titleLower, 'ckg')
        ) {
            return 'Kegiatan';
        }

        if (
            str_contains($titleLower, 'sosialisasi') ||
            str_contains($titleLower, 'perundungan') ||
            str_contains($titleLower, 'narkoba') ||
            str_contains($titleLower, 'pengumuman') ||
            str_contains($titleLower, 'pembayaran')
        ) {
            return 'Pengumuman';
        }

        return 'Berita';
    }
}
