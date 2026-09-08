<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\HumasSyncService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class HumasController extends Controller
{
    protected HumasSyncService $syncService;

    public function __construct(HumasSyncService $syncService)
    {
        $this->syncService = $syncService;
    }

    /**
     * Endpoint Publik: Daftar Konten / Berita yang sudah terbit (Published).
     * Tidak memerlukan login / token.
     */
    public function getKontenPublik(Request $request)
    {
        $kategori = $request->query('kategori');
        $search = $request->query('search');
        $limit = $request->query('limit', 12);

        $query = DB::table('humas_konten')
            ->where('status', 'Published')
            ->orderBy('is_pinned', 'desc')
            ->orderBy('published_at', 'desc')
            ->orderBy('id', 'desc');

        if ($kategori && $kategori !== 'Semua') {
            $query->where('kategori', $kategori);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('judul', 'like', "%{$search}%")
                  ->orWhere('ringkasan', 'like', "%{$search}%")
                  ->orWhere('isi', 'like', "%{$search}%");
            });
        }

        $items = $query->paginate($limit);

        $itemList = $items->items();
        foreach ($itemList as $item) {
            $item->is_pinned = (bool)($item->is_pinned ?? false);
            if (!empty($item->galeri_images) && is_string($item->galeri_images)) {
                $item->galeri_images = json_decode($item->galeri_images, true) ?: [];
            } else {
                $item->galeri_images = is_array($item->galeri_images ?? null) ? $item->galeri_images : [];
            }
        }

        // Kategori count stats (4 Kategori Resmi: Berita, Pengumuman, Prestasi Akademik, Prestasi Non Akademik)
        $stats = [
            'total' => DB::table('humas_konten')->where('status', 'Published')->where('kategori', '!=', 'Aset Web')->count(),
            'berita' => DB::table('humas_konten')->where('status', 'Published')->where('kategori', 'Berita')->count(),
            'pengumuman' => DB::table('humas_konten')->where('status', 'Published')->where('kategori', 'Pengumuman')->count(),
            'prestasi_akademik' => DB::table('humas_konten')->where('status', 'Published')->where('kategori', 'Prestasi Akademik')->count(),
            'prestasi_non_akademik' => DB::table('humas_konten')->where('status', 'Published')->where('kategori', 'Prestasi Non Akademik')->count(),
            'pinned' => DB::table('humas_konten')->where('status', 'Published')->where('is_pinned', 1)->count(),
        ];

        return response()->json([
            'status' => 'success',
            'data' => $itemList,
            'meta' => [
                'current_page' => $items->currentPage(),
                'last_page' => $items->lastPage(),
                'total' => $items->total(),
            ],
            'stats' => $stats,
        ]);
    }

    /**
     * Endpoint Publik: Detail satu artikel berita berdasarkan ID atau Slug.
     */
    public function detailKontenPublik($idOrSlug)
    {
        $konten = DB::table('humas_konten')
            ->where('status', 'Published')
            ->where(function ($q) use ($idOrSlug) {
                $q->where('id', $idOrSlug)->orWhere('slug', $idOrSlug);
            })
            ->first();

        if (!$konten) {
            return response()->json([
                'status' => 'error',
                'message' => 'Artikel tidak ditemukan atau belum dipublikasikan.',
            ], 404);
        }

        if (!empty($konten->galeri_images) && is_string($konten->galeri_images)) {
            $konten->galeri_images = json_decode($konten->galeri_images, true) ?: [];
        } else {
            $konten->galeri_images = is_array($konten->galeri_images ?? null) ? $konten->galeri_images : [];
        }

        // Ambil 3 artikel terkait
        $related = DB::table('humas_konten')
            ->where('status', 'Published')
            ->where('id', '!=', $konten->id)
            ->where('kategori', $konten->kategori)
            ->orderBy('published_at', 'desc')
            ->limit(3)
            ->get();

        foreach ($related as $rel) {
            if (!empty($rel->galeri_images) && is_string($rel->galeri_images)) {
                $rel->galeri_images = json_decode($rel->galeri_images, true) ?: [];
            } else {
                $rel->galeri_images = [];
            }
        }

        return response()->json([
            'status' => 'success',
            'data' => $konten,
            'related' => $related,
        ]);
    }

    /**
     * Endpoint Admin CMS: Daftar Semua Konten (Draft, Pending Approval, Published, Rejected).
     */
    public function index(Request $request)
    {
        $status = $request->query('status');
        $kategori = $request->query('kategori');
        $search = $request->query('search');

        $query = DB::table('humas_konten')->orderBy('id', 'desc');

        if ($status && $status !== 'Semua') {
            $query->where('status', $status);
        }

        if ($kategori && $kategori !== 'Semua') {
            $query->where('kategori', $kategori);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('judul', 'like', "%{$search}%")
                  ->orWhere('ringkasan', 'like', "%{$search}%");
            });
        }

        $data = $query->get();

        foreach ($data as $item) {
            $item->is_pinned = (bool)($item->is_pinned ?? false);
            if (!empty($item->galeri_images) && is_string($item->galeri_images)) {
                $item->galeri_images = json_decode($item->galeri_images, true) ?: [];
            } else {
                $item->galeri_images = is_array($item->galeri_images ?? null) ? $item->galeri_images : [];
            }
        }

        // Rekapitulasi status & pin
        $statusSummary = [
            'total' => DB::table('humas_konten')->count(),
            'published' => DB::table('humas_konten')->where('status', 'Published')->count(),
            'pending' => DB::table('humas_konten')->where('status', 'Pending Approval')->count(),
            'draft' => DB::table('humas_konten')->where('status', 'Draft')->count(),
            'rejected' => DB::table('humas_konten')->where('status', 'Rejected')->count(),
            'pinned' => DB::table('humas_konten')->where('is_pinned', 1)->count(),
        ];

        return response()->json([
            'status' => 'success',
            'data' => $data,
            'summary' => $statusSummary,
        ]);
    }

    /**
     * Simpan Konten Baru (Oleh Staf Humas / Admin)
     */
    public function store(Request $request)
    {
        $request->validate([
            'judul' => 'required|string|max:255',
            'kategori' => 'required|string',
            'isi' => 'required|string',
            'ringkasan' => 'nullable|string',
            'platform_target' => 'nullable|string',
        ]);

        $slug = Str::slug($request->judul);
        $count = DB::table('humas_konten')->where('slug', 'like', "{$slug}%")->count();
        if ($count > 0) {
            $slug .= '-' . ($count + 1);
        }

        $imageUrl = $request->image_url;
        $localImagePath = null;

        // Jika upload berkas foto langsung
        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $filename = time() . '_' . Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)) . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('humas', $filename, 'public');
            $localImagePath = '/storage/' . $path;
            $imageUrl = $localImagePath;

            // Salin ke frontend/public jika ada
            $frontendDir = base_path('../frontend/public/humas');
            if (is_dir($frontendDir)) {
                @copy(storage_path('app/public/' . $path), $frontendDir . '/' . $filename);
            }
        }

        // Simpan Berkas Gambar Pelengkap / Galeri Tambahan
        $galeriImages = [];
        if ($request->hasFile('galeri')) {
            $files = $request->file('galeri');
            if (!is_array($files)) {
                $files = [$files];
            }
            $frontendDir = base_path('../frontend/public/humas');
            foreach ($files as $idx => $file) {
                if ($file && $file->isValid()) {
                    $filename = time() . '_' . ($idx + 1) . '_' . Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)) . '.' . $file->getClientOriginalExtension();
                    $path = $file->storeAs('humas', $filename, 'public');
                    $gUrl = '/storage/' . $path;
                    $galeriImages[] = $gUrl;
                    if (is_dir($frontendDir)) {
                        @copy(storage_path('app/public/' . $path), $frontendDir . '/' . $filename);
                    }
                }
            }
        }

        $status = $request->input('status', 'Pending Approval');
        $publishedAt = ($status === 'Published') ? now() : null;

        $id = DB::table('humas_konten')->insertGetId([
            'judul' => $request->judul,
            'slug' => $slug,
            'kategori' => $request->kategori,
            'ringkasan' => $request->ringkasan ?? Str::limit(strip_tags($request->isi), 180),
            'isi' => $request->isi,
            'platform_target' => $request->platform_target ?? 'Website',
            'image_url' => $imageUrl,
            'local_image_path' => $localImagePath,
            'galeri_images' => count($galeriImages) > 0 ? json_encode(array_values($galeriImages)) : null,
            'status' => $status,
            'is_pinned' => $request->boolean('is_pinned') ? 1 : 0,
            'author' => auth()->user()?->name ?? 'Staf Humas SMA AWH',
            'published_at' => $publishedAt,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $created = DB::table('humas_konten')->where('id', $id)->first();

        return response()->json([
            'status' => 'success',
            'message' => 'Konten berhasil disimpan.',
            'data' => $created,
        ], 201);
    }

    /**
     * Update Konten (Edit)
     */
    public function update(Request $request, $id)
    {
        $existing = DB::table('humas_konten')->where('id', $id)->first();
        if (!$existing) {
            return response()->json(['status' => 'error', 'message' => 'Konten tidak ditemukan.'], 404);
        }

        $request->validate([
            'judul' => 'required|string|max:255',
            'kategori' => 'required|string',
            'isi' => 'required|string',
        ]);

        $imageUrl = $request->image_url ?? $existing->image_url;
        $localImagePath = $existing->local_image_path;

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $filename = time() . '_' . Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)) . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('humas', $filename, 'public');
            $localImagePath = '/storage/' . $path;
            $imageUrl = $localImagePath;

            $frontendDir = base_path('../frontend/public/humas');
            if (is_dir($frontendDir)) {
                @copy(storage_path('app/public/' . $path), $frontendDir . '/' . $filename);
            }
        }

        $status = $request->input('status', $existing->status);
        $publishedAt = $existing->published_at;
        if ($status === 'Published' && !$publishedAt) {
            $publishedAt = now();
        }

        // Kelola Gambar Pelengkap / Galeri Tambahan
        $galeriImages = [];
        if ($request->has('existing_galeri')) {
            $existingInput = $request->input('existing_galeri');
            if (is_string($existingInput)) {
                $decoded = json_decode($existingInput, true);
                if (is_array($decoded)) {
                    $galeriImages = $decoded;
                }
            } elseif (is_array($existingInput)) {
                $galeriImages = $existingInput;
            }
        } else {
            if (!empty($existing->galeri_images)) {
                $decoded = json_decode($existing->galeri_images, true);
                if (is_array($decoded)) {
                    $galeriImages = $decoded;
                }
            }
        }

        if ($request->hasFile('galeri')) {
            $files = $request->file('galeri');
            if (!is_array($files)) {
                $files = [$files];
            }
            $frontendDir = base_path('../frontend/public/humas');
            foreach ($files as $idx => $file) {
                if ($file && $file->isValid()) {
                    $filename = time() . '_' . ($idx + 1) . '_' . Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)) . '.' . $file->getClientOriginalExtension();
                    $path = $file->storeAs('humas', $filename, 'public');
                    $gUrl = '/storage/' . $path;
                    $galeriImages[] = $gUrl;
                    if (is_dir($frontendDir)) {
                        @copy(storage_path('app/public/' . $path), $frontendDir . '/' . $filename);
                    }
                }
            }
        }

        $updateData = [
            'judul' => $request->judul,
            'kategori' => $request->kategori,
            'ringkasan' => $request->ringkasan ?? Str::limit(strip_tags($request->isi), 180),
            'isi' => $request->isi,
            'platform_target' => $request->platform_target ?? $existing->platform_target,
            'image_url' => $imageUrl,
            'local_image_path' => $localImagePath,
            'galeri_images' => count($galeriImages) > 0 ? json_encode(array_values($galeriImages)) : null,
            'status' => $status,
            'catatan_revisi' => $request->catatan_revisi ?? $existing->catatan_revisi,
            'published_at' => $publishedAt,
            'updated_at' => now(),
        ];

        if ($request->has('is_pinned')) {
            $updateData['is_pinned'] = $request->boolean('is_pinned') ? 1 : 0;
        }

        DB::table('humas_konten')->where('id', $id)->update($updateData);

        $updated = DB::table('humas_konten')->where('id', $id)->first();

        return response()->json([
            'status' => 'success',
            'message' => 'Konten berhasil diperbarui.',
            'data' => $updated,
        ]);
    }

    /**
     * Hapus Konten
     */
    public function destroy($id)
    {
        $existing = DB::table('humas_konten')->where('id', $id)->first();
        if (!$existing) {
            return response()->json(['status' => 'error', 'message' => 'Konten tidak ditemukan.'], 404);
        }

        DB::table('humas_konten')->where('id', $id)->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Konten berhasil dihapus.',
        ]);
    }

    /**
     * Alur Approval Kepala Sekolah / Waka Humas
     */
    public function approve(Request $request, $id)
    {
        $request->validate([
            'action' => 'required|in:approve,reject',
            'catatan' => 'nullable|string',
        ]);

        $konten = DB::table('humas_konten')->where('id', $id)->first();
        if (!$konten) {
            return response()->json(['status' => 'error', 'message' => 'Konten tidak ditemukan.'], 404);
        }

        $newStatus = ($request->action === 'approve') ? 'Published' : 'Rejected';
        $publishedAt = ($request->action === 'approve') ? ($konten->published_at ?? now()) : null;

        DB::table('humas_konten')->where('id', $id)->update([
            'status' => $newStatus,
            'catatan_revisi' => $request->catatan,
            'published_at' => $publishedAt,
            'updated_at' => now(),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => ($newStatus === 'Published')
                ? 'Konten berhasil disetujui dan telah tayang di Website Sekolah!'
                : 'Konten ditolak dan dikembalikan ke Humas dengan catatan revisi.',
            'status_terbaru' => $newStatus,
        ]);
    }

    /**
     * Trigger One-Click Sinkronisasi dari smaawhtebuireng.sch.id
     */
    public function syncWebsite(Request $request)
    {
        $limit = $request->input('limit', 20);
        $result = $this->syncService->syncPosts($limit);

        return response()->json($result);
    }

    /**
     * One-Click Toggle PIN untuk Menampilkan Berita di 3 Sorotan Beranda
     */
    public function togglePin($id)
    {
        $konten = DB::table('humas_konten')->where('id', $id)->first();
        if (!$konten) {
            return response()->json(['status' => 'error', 'message' => 'Konten tidak ditemukan.'], 404);
        }

        $newPinned = empty($konten->is_pinned) ? 1 : 0;
        DB::table('humas_konten')->where('id', $id)->update([
            'is_pinned' => $newPinned,
            'updated_at' => now(),
        ]);

        $totalPinned = DB::table('humas_konten')->where('is_pinned', 1)->count();

        return response()->json([
            'status' => 'success',
            'message' => $newPinned
                ? "Berita \"{$konten->judul}\" berhasil disematkan (PIN) di Beranda!"
                : "Sematkan (PIN) pada berita dilepas.",
            'is_pinned' => (bool)$newPinned,
            'total_pinned' => $totalPinned,
        ]);
    }
}
