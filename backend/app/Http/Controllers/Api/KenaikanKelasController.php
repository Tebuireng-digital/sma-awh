<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Kelas;
use App\Models\RaporArsipSnapshot;
use App\Models\Siswa;
use App\Models\SiswaAlumni;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class KenaikanKelasController extends Controller
{
    /**
     * Memastikan hanya role admin yang memiliki akses.
     */
    private function ensureAdmin(Request $request): void
    {
        $user = $request->user();
        $roles = $user ? (method_exists($user, 'getAllRolesAttribute') ? $user->all_roles : [$user->role]) : [];
        if (!in_array('admin', $roles)) {
            abort(403, 'Akses ditolak. Fitur ini hanya dapat dieksekusi oleh Administrator.');
        }
    }

    /**
     * Ringkasan status data siswa per tingkat dan alumni.
     */
    public function getStatus(Request $request)
    {
        $this->ensureAdmin($request);

        $kelasX = DB::table('kelas as k')
            ->leftJoin('anggota_kelas as ak', 'k.id', '=', 'ak.kelas_id')
            ->where('k.tingkat', 'X')
            ->select('k.id', 'k.nama_kelas', 'k.tingkat', DB::raw('COUNT(ak.id) as jumlah_siswa'))
            ->groupBy('k.id', 'k.nama_kelas', 'k.tingkat')
            ->orderBy('k.nama_kelas')
            ->get();

        $kelasXi = DB::table('kelas as k')
            ->leftJoin('anggota_kelas as ak', 'k.id', '=', 'ak.kelas_id')
            ->where('k.tingkat', 'XI')
            ->select('k.id', 'k.nama_kelas', 'k.tingkat', DB::raw('COUNT(ak.id) as jumlah_siswa'))
            ->groupBy('k.id', 'k.nama_kelas', 'k.tingkat')
            ->orderBy('k.nama_kelas')
            ->get();

        $kelasXii = DB::table('kelas as k')
            ->leftJoin('anggota_kelas as ak', 'k.id', '=', 'ak.kelas_id')
            ->where('k.tingkat', 'XII')
            ->select('k.id', 'k.nama_kelas', 'k.tingkat', DB::raw('COUNT(ak.id) as jumlah_siswa'))
            ->groupBy('k.id', 'k.nama_kelas', 'k.tingkat')
            ->orderBy('k.nama_kelas')
            ->get();

        $totalSiswaX = $kelasX->sum('jumlah_siswa');
        $totalSiswaXi = $kelasXi->sum('jumlah_siswa');
        $totalSiswaXii = $kelasXii->sum('jumlah_siswa');

        $totalAlumni = DB::table('siswa_alumni')->count();
        $totalLulus = DB::table('siswa_alumni')->where('kategori_keluar', 'LULUS')->count();
        $totalKeluar = DB::table('siswa_alumni')->where('kategori_keluar', 'KELUAR / PINDAH')->count();

        $tahunAjaranAktif = DB::table('tahun_ajaran')->where('is_active', true)->first() 
            ?? DB::table('tahun_ajaran')->latest('id')->first();

        return response()->json([
            'status' => 'success',
            'data' => [
                'tahun_ajaran_aktif' => $tahunAjaranAktif ? $tahunAjaranAktif->nama : date('Y') . '/' . (date('Y') + 1),
                'ringkasan' => [
                    'kelas_x_total' => $totalSiswaX,
                    'kelas_xi_total' => $totalSiswaXi,
                    'kelas_xii_total' => $totalSiswaXii,
                    'alumni_total' => $totalAlumni,
                    'alumni_lulus' => $totalLulus,
                    'alumni_keluar' => $totalKeluar,
                ],
                'kelas_x' => $kelasX,
                'kelas_xi' => $kelasXi,
                'kelas_xii' => $kelasXii,
            ],
        ]);
    }

    /**
     * Ambil seluruh siswa aktif di kelas XII untuk persiapan kelulusan/pengarsipan.
     */
    public function getSiswaKelasXii(Request $request)
    {
        $this->ensureAdmin($request);

        $siswaXii = DB::table('siswa as s')
            ->join('anggota_kelas as ak', 's.id', '=', 'ak.siswa_id')
            ->join('kelas as k', 'ak.kelas_id', '=', 'k.id')
            ->where('k.tingkat', 'XII')
            ->where('s.status_aktif', true)
            ->select(
                's.id',
                's.nis',
                's.nisn',
                's.nama',
                's.jenis_kelamin',
                's.no_hp_ortu',
                'k.id as kelas_id',
                'k.nama_kelas',
                'ak.no_urut'
            )
            ->orderBy('k.nama_kelas')
            ->orderBy('s.nama')
            ->get();

        return response()->json([
            'status' => 'success',
            'total' => count($siswaXii),
            'data' => $siswaXii,
        ]);
    }

    /**
     * Ambil siswa berdasarkan tingkat ('XI' atau 'X') untuk persiapan kenaikan kelas.
     */
    public function getSiswaByTingkat(Request $request, $tingkat)
    {
        $this->ensureAdmin($request);

        $tingkat = strtoupper($tingkat);
        if (!in_array($tingkat, ['X', 'XI'])) {
            return response()->json(['status' => 'error', 'message' => 'Tingkat tidak valid.'], 400);
        }

        $siswa = DB::table('siswa as s')
            ->join('anggota_kelas as ak', 's.id', '=', 'ak.siswa_id')
            ->join('kelas as k', 'ak.kelas_id', '=', 'k.id')
            ->where('k.tingkat', $tingkat)
            ->where('s.status_aktif', true)
            ->select(
                's.id',
                's.nis',
                's.nisn',
                's.nama',
                's.jenis_kelamin',
                'k.id as kelas_id',
                'k.nama_kelas',
                'ak.no_urut'
            )
            ->orderBy('k.nama_kelas')
            ->orderBy('s.nama')
            ->get();

        return response()->json([
            'status' => 'success',
            'tingkat' => $tingkat,
            'total' => count($siswa),
            'data' => $siswa,
        ]);
    }

    /**
     * TAHAP 1: Luluskan Siswa Kelas XII -> Arsipkan ke siswa_alumni (Kategori: LULUS).
     */
    public function luluskanKeluarkankelasXii(Request $request)
    {
        $this->ensureAdmin($request);

        $request->validate([
            'tahun_keluar' => 'required|string|max:10',
            'angkatan' => 'nullable|string|max:50',
            'siswa_list' => 'required|array|min:1',
            'siswa_list.*.id' => 'required|integer',
            'siswa_list.*.no_ijazah' => 'nullable|string|max:100',
        ]);

        $tahunKeluar = $request->tahun_keluar;
        $angkatan = $request->angkatan ?: ('Angkatan ' . $tahunKeluar);
        $siswaListInput = $request->siswa_list;

        $processedCount = 0;

        DB::beginTransaction();
        try {
            foreach ($siswaListInput as $item) {
                $siswaId = $item['id'];
                $noIjazah = $item['no_ijazah'] ?? null;

                // Ambil data siswa & kelas terakhir
                $siswa = DB::table('siswa as s')
                    ->leftJoin('anggota_kelas as ak', 's.id', '=', 'ak.siswa_id')
                    ->leftJoin('kelas as k', 'ak.kelas_id', '=', 'k.id')
                    ->where('s.id', $siswaId)
                    ->select('s.*', 'k.nama_kelas as kelas_terakhir', 'k.id as kelas_id')
                    ->first();

                if (!$siswa) {
                    continue;
                }

                // Ambil snapshot seluruh nilai rapor siswa
                $raporHistory = DB::table('rapor_sts')
                    ->where('siswa_id', $siswaId)
                    ->get();

                $snapshotData = [
                    'biodata_snapshot' => [
                        'nis' => $siswa->nis,
                        'nisn' => $siswa->nisn ?? null,
                        'nama' => $siswa->nama,
                        'jenis_kelamin' => $siswa->jenis_kelamin,
                        'tanggal_lahir' => $siswa->tanggal_lahir ?? null,
                        'no_hp_ortu' => $siswa->no_hp_ortu,
                    ],
                    'kelas_terakhir' => $siswa->kelas_terakhir ?? 'XII',
                    'rapor_records' => $raporHistory,
                    'diarsipkan_pada' => now()->toIso8601String(),
                ];

                // Simpan ke siswa_alumni dengan kategori LULUS
                $alumniId = DB::table('siswa_alumni')->insertGetId([
                    'nisn' => $siswa->nisn ?? null,
                    'nis' => $siswa->nis,
                    'nama' => $siswa->nama,
                    'jenis_kelamin' => $siswa->jenis_kelamin,
                    'kategori_keluar' => 'LULUS',
                    'tahun_masuk' => (string)((int)$tahunKeluar - 3),
                    'tahun_keluar' => (string)$tahunKeluar,
                    'angkatan' => $angkatan,
                    'kelas_terakhir' => $siswa->kelas_terakhir ?? 'XII',
                    'no_ijazah' => $noIjazah,
                    'alasan_keluar' => null,
                    'sekolah_tujuan' => null,
                    'no_hp' => $siswa->no_hp_ortu ?? null,
                    'no_hp_ortu' => $siswa->no_hp_ortu ?? null,
                    'catatan' => 'Lulus resmi SMA A. Wahid Hasyim ' . $tahunKeluar,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // Simpan snapshot rapor
                DB::table('rapor_arsip_snapshot')->insert([
                    'siswa_alumni_id' => $alumniId,
                    'data_nilai_json' => json_encode($snapshotData),
                    'catatan_akademik' => 'Snapshot kelulusan resmi ' . $tahunKeluar,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // Hapus relasi dari anggota_kelas
                DB::table('anggota_kelas')->where('siswa_id', $siswaId)->delete();

                // Hapus siswa dari tabel aktif siswa agar tabel operasional bersih
                DB::table('siswa')->where('id', $siswaId)->delete();

                $processedCount++;
            }

            // Sinkronkan ulang jumlah_siswa di seluruh tabel kelas
            $allKelas = DB::table('kelas')->get();
            foreach ($allKelas as $k) {
                $actual = DB::table('anggota_kelas')->where('kelas_id', $k->id)->count();
                DB::table('kelas')->where('id', $k->id)->update(['jumlah_siswa' => $actual]);
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => "Berhasil memproses kelulusan dan pengarsipan {$processedCount} siswa kelas XII ke Buku Induk Alumni.",
                'processed_count' => $processedCount,
                'lulus_count' => $processedCount,
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memproses kelulusan/pengarsipan: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Keluarkan / Mutasi Siswa dari Master Data Siswa Aktif -> Pindahkan ke Buku Induk Alumni (Kategori: KELUAR / PINDAH).
     */
    public function keluarkanMutasiSiswa(Request $request, $id)
    {
        $this->ensureAdmin($request);

        $request->validate([
            'alasan_keluar' => 'required|string',
            'sekolah_tujuan' => 'nullable|string|max:255',
            'tahun_keluar' => 'nullable|string|max:10',
            'catatan' => 'nullable|string',
        ]);

        $siswa = DB::table('siswa as s')
            ->leftJoin('anggota_kelas as ak', 's.id', '=', 'ak.siswa_id')
            ->leftJoin('kelas as k', 'ak.kelas_id', '=', 'k.id')
            ->where('s.id', $id)
            ->select('s.*', 'k.nama_kelas as kelas_terakhir', 'k.id as kelas_id', 'k.tingkat')
            ->first();

        if (!$siswa) {
            return response()->json(['status' => 'error', 'message' => 'Data siswa tidak ditemukan.'], 404);
        }

        $tahunKeluar = $request->tahun_keluar ?: date('Y');
        $alasanKeluar = $request->alasan_keluar;
        $sekolahTujuan = $request->sekolah_tujuan;
        $catatan = $request->catatan ?: ($sekolahTujuan ? "Pindah sekolah ke {$sekolahTujuan}" : "Keluar / Mutasi: {$alasanKeluar}");

        DB::beginTransaction();
        try {
            $raporHistory = DB::table('rapor_sts')
                ->where('siswa_id', $id)
                ->get();

            $snapshotData = [
                'biodata_snapshot' => [
                    'nis' => $siswa->nis,
                    'nisn' => $siswa->nisn ?? null,
                    'nama' => $siswa->nama,
                    'jenis_kelamin' => $siswa->jenis_kelamin,
                    'tanggal_lahir' => $siswa->tanggal_lahir ?? null,
                    'no_hp_ortu' => $siswa->no_hp_ortu,
                ],
                'kelas_terakhir' => $siswa->kelas_terakhir ?? '-',
                'rapor_records' => $raporHistory,
                'diarsipkan_pada' => now()->toIso8601String(),
            ];

            $alumniId = DB::table('siswa_alumni')->insertGetId([
                'nisn' => $siswa->nisn ?? null,
                'nis' => $siswa->nis,
                'nama' => $siswa->nama,
                'jenis_kelamin' => $siswa->jenis_kelamin,
                'kategori_keluar' => 'KELUAR / PINDAH',
                'tahun_masuk' => (string)((int)$tahunKeluar - 1),
                'tahun_keluar' => (string)$tahunKeluar,
                'angkatan' => 'Mutasi / Keluar ' . $tahunKeluar,
                'kelas_terakhir' => $siswa->kelas_terakhir ?? '-',
                'no_ijazah' => null,
                'alasan_keluar' => $alasanKeluar,
                'sekolah_tujuan' => $sekolahTujuan,
                'no_hp' => $siswa->no_hp_ortu ?? null,
                'no_hp_ortu' => $siswa->no_hp_ortu ?? null,
                'catatan' => $catatan,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('rapor_arsip_snapshot')->insert([
                'siswa_alumni_id' => $alumniId,
                'data_nilai_json' => json_encode($snapshotData),
                'catatan_akademik' => "Pengarsipan mutasi/keluar pada " . date('d-m-Y'),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $kelasId = $siswa->kelas_id;
            DB::table('anggota_kelas')->where('siswa_id', $id)->delete();
            DB::table('siswa')->where('id', $id)->delete();

            if ($kelasId) {
                $actual = DB::table('anggota_kelas')->where('kelas_id', $kelasId)->count();
                DB::table('kelas')->where('id', $kelasId)->update(['jumlah_siswa' => $actual]);
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => "Siswa {$siswa->nama} (NIS {$siswa->nis}) berhasil dimutasi / dikeluarkan dan diarsipkan ke Buku Induk Alumni.",
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memproses mutasi siswa: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * TAHAP 2 & 3: Kenaikan Kelas Berantai (XI -> XII atau X -> XI).
     */
    public function promosikanKelas(Request $request)
    {
        $this->ensureAdmin($request);

        $request->validate([
            'tingkat_asal' => 'required|in:XI,X',
            'pemetaan_kelas' => 'nullable|array', // e.g. [ { 'kelas_asal_id': 1, 'kelas_tujuan_id': 5 } ]
            'pemetaan_siswa' => 'nullable|array', // e.g. [ { 'siswa_id': 10, 'kelas_tujuan_id': 5 } ]
        ]);

        $tingkatAsal = $request->tingkat_asal;
        $tingkatTujuan = $tingkatAsal === 'XI' ? 'XII' : 'XI';

        DB::beginTransaction();
        try {
            $totalPromoted = 0;

            // Mode 1: Pemetaan per siswa spesifik
            if ($request->has('pemetaan_siswa') && is_array($request->pemetaan_siswa) && count($request->pemetaan_siswa) > 0) {
                foreach ($request->pemetaan_siswa as $map) {
                    $siswaId = $map['siswa_id'];
                    $kelasTujuanId = $map['kelas_tujuan_id'];

                    if ($siswaId && $kelasTujuanId) {
                        DB::table('anggota_kelas')
                            ->where('siswa_id', $siswaId)
                            ->update([
                                'kelas_id' => $kelasTujuanId,
                                'updated_at' => now(),
                            ]);
                        $totalPromoted++;
                    }
                }
            } 
            // Mode 2: Pemetaan per rombel/kelas (misal: XI MIPA 1 -> XII MIPA 1)
            elseif ($request->has('pemetaan_kelas') && is_array($request->pemetaan_kelas) && count($request->pemetaan_kelas) > 0) {
                foreach ($request->pemetaan_kelas as $map) {
                    $kelasAsalId = $map['kelas_asal_id'];
                    $kelasTujuanId = $map['kelas_tujuan_id'];

                    if ($kelasAsalId && $kelasTujuanId) {
                        $count = DB::table('anggota_kelas')
                            ->where('kelas_id', $kelasAsalId)
                            ->update([
                                'kelas_id' => $kelasTujuanId,
                                'updated_at' => now(),
                            ]);
                        $totalPromoted += $count;
                    }
                }
            } else {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Pilih pemetaan kelas atau pemetaan siswa untuk dipromosikan.',
                ], 422);
            }

            // Sinkronkan ulang jumlah_siswa di seluruh tabel kelas
            $allKelas = DB::table('kelas')->get();
            foreach ($allKelas as $k) {
                $actual = DB::table('anggota_kelas')->where('kelas_id', $k->id)->count();
                DB::table('kelas')->where('id', $k->id)->update(['jumlah_siswa' => $actual]);
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => "Berhasil mempromosikan {$totalPromoted} siswa dari Kelas {$tingkatAsal} ke Kelas {$tingkatTujuan}.",
                'promoted_count' => $totalPromoted,
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mempromosikan kenaikan kelas: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Penelusuran Buku Induk Alumni.
     */
    public function getAlumniList(Request $request)
    {
        $this->ensureAdmin($request);

        $query = DB::table('siswa_alumni as a');

        if ($request->has('tahun_keluar') && !empty($request->tahun_keluar)) {
            $query->where('a.tahun_keluar', $request->tahun_keluar);
        }

        if ($request->has('kategori_keluar') && !empty($request->kategori_keluar)) {
            $query->where('a.kategori_keluar', $request->kategori_keluar);
        }

        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('a.nama', 'like', "%{$search}%")
                  ->orWhere('a.nis', 'like', "%{$search}%")
                  ->orWhere('a.nisn', 'like', "%{$search}%")
                  ->orWhere('a.no_ijazah', 'like', "%{$search}%");
            });
        }

        $limit = $request->query('limit', 15);
        $alumni = $query->orderBy('a.tahun_keluar', 'desc')
            ->orderBy('a.nama', 'asc')
            ->paginate($limit);

        // Ambil daftar tahun keluar unik untuk filter
        $availableYears = DB::table('siswa_alumni')
            ->select('tahun_keluar')
            ->distinct()
            ->orderBy('tahun_keluar', 'desc')
            ->pluck('tahun_keluar');

        return response()->json([
            'status' => 'success',
            'data' => $alumni->items(),
            'meta' => [
                'current_page' => $alumni->currentPage(),
                'last_page' => $alumni->lastPage(),
                'total' => $alumni->total(),
            ],
            'available_years' => $availableYears,
        ]);
    }

    /**
     * Ambil detail snapshot nilai rapor alumni.
     */
    public function getAlumniDetail(Request $request, $id)
    {
        $this->ensureAdmin($request);

        $alumni = DB::table('siswa_alumni')->where('id', $id)->first();
        if (!$alumni) {
            return response()->json(['status' => 'error', 'message' => 'Data alumni tidak ditemukan.'], 404);
        }

        $snapshot = DB::table('rapor_arsip_snapshot')->where('siswa_alumni_id', $id)->first();

        $snapshotData = null;
        if ($snapshot && !empty($snapshot->data_nilai_json)) {
            $snapshotData = json_decode($snapshot->data_nilai_json, true);
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'alumni' => $alumni,
                'snapshot' => $snapshotData,
            ],
        ]);
    }
}
