<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RaporController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('rapor_sts')
            ->join('siswa', 'rapor_sts.siswa_id', '=', 'siswa.id')
            ->leftJoin('anggota_kelas', 'siswa.id', '=', 'anggota_kelas.siswa_id')
            ->leftJoin('kelas', 'anggota_kelas.kelas_id', '=', 'kelas.id')
            ->select(
                'rapor_sts.*',
                'siswa.nama as nama_siswa',
                'siswa.nis as no_induk',
                'kelas.nama_kelas as kelas'
            );

        if ($request->has('siswa_id')) {
            $query->where('rapor_sts.siswa_id', $request->siswa_id);
        }

        if ($request->has('kelas_id')) {
            $query->where('kelas.id', $request->kelas_id);
        }

        $rapor = $query->get();

        return response()->json([
            'status' => 'success',
            'data' => $rapor,
        ]);
    }

    public static function mapelNameToKeys($name)
    {
        $keys = [];
        $n = strtolower($name);
        if (str_contains($n, 'pai')) $keys[] = 'nilai_pai';
        if (str_contains($n, 'kewarganegaraan') || str_contains($n, 'ppkn')) $keys[] = 'nilai_ppkn';
        if (str_contains($n, 'bahasa indonesia')) $keys[] = 'nilai_indo';
        if (str_contains($n, 'matematika')) $keys[] = 'nilai_mtk';
        if (str_contains($n, 'inggris')) $keys[] = 'nilai_inggris';
        if (str_contains($n, 'seni')) $keys[] = 'nilai_seni';
        if (str_contains($n, 'penjas')) $keys[] = 'nilai_penjas';
        if (str_contains($n, 'informatika')) $keys[] = 'nilai_informa';
        if (str_contains($n, 'sejarah')) $keys[] = 'nilai_sejarah';
        if (str_contains($n, 'biologi')) $keys[] = 'nilai_biologi';
        if (str_contains($n, 'fisika')) $keys[] = 'nilai_fisika';
        if (str_contains($n, 'kimia')) $keys[] = 'nilai_kimia';
        if (str_contains($n, 'geografi')) $keys[] = 'nilai_geografi';
        if (str_contains($n, 'sosiologi')) $keys[] = 'nilai_sosiologi';
        if (str_contains($n, 'ekonomi')) $keys[] = 'nilai_ekonomi';
        if (str_contains($n, 'pkwu')) $keys[] = 'nilai_pkwu';
        if (str_contains($n, 'quran')) $keys[] = 'nilai_alquran';
        if (str_contains($n, 'akhlaq')) $keys[] = 'nilai_akhlaq';
        if (str_contains($n, 'fiqih')) $keys[] = 'nilai_fiqih';
        if (str_contains($n, 'nahwu')) $keys[] = 'nilai_nahwu';
        if (str_contains($n, 'aswaja')) $keys[] = 'nilai_aswaja';
        return array_values(array_unique($keys));
    }

    public function myAccess(Request $request)
    {
        $user = $request->user();
        $isFullAccess = in_array($user->role, ['admin', 'kurikulum', 'kepala_sekolah', 'waka']);

        $allMapelKeys = [
            'nilai_pai', 'nilai_ppkn', 'nilai_indo', 'nilai_mtk', 'nilai_inggris',
            'nilai_seni', 'nilai_penjas', 'nilai_informa', 'nilai_sejarah', 'nilai_biologi',
            'nilai_fisika', 'nilai_kimia', 'nilai_geografi', 'nilai_sosiologi', 'nilai_ekonomi',
            'nilai_pkwu', 'nilai_alquran', 'nilai_akhlaq', 'nilai_fiqih', 'nilai_nahwu', 'nilai_aswaja'
        ];

        $standardLabels = [
            'nilai_pai' => 'Pendidikan Agama Islam (PAI)',
            'nilai_ppkn' => 'PPKN',
            'nilai_indo' => 'Bahasa Indonesia',
            'nilai_mtk' => 'Matematika',
            'nilai_inggris' => 'Bahasa Inggris',
            'nilai_seni' => 'Seni Budaya',
            'nilai_penjas' => 'Penjaskes',
            'nilai_informa' => 'Informatika',
            'nilai_sejarah' => 'Sejarah',
            'nilai_biologi' => 'IPA Biologi',
            'nilai_fisika' => 'Fisika',
            'nilai_kimia' => 'Kimia',
            'nilai_geografi' => 'IPS Geografi',
            'nilai_sosiologi' => 'Sosiologi',
            'nilai_ekonomi' => 'Ekonomi',
            'nilai_pkwu' => 'PKWU',
            'nilai_alquran' => 'Al-Quran',
            'nilai_akhlaq' => 'Akhlaq',
            'nilai_fiqih' => 'Fiqih',
            'nilai_nahwu' => 'Nahwu Shorof',
            'nilai_aswaja' => 'Aswaja'
        ];

        $allMapelRows = DB::table('mata_pelajaran')->get();
        $allMapelInfoList = [];
        foreach ($allMapelKeys as $k) {
            $allMapelInfoList[] = ['key' => $k, 'label' => $standardLabels[$k], 'is_extra' => false];
        }
        foreach ($allMapelRows as $m) {
            $matched = self::mapelNameToKeys($m->nama_mapel);
            if (empty($matched)) {
                $extKey = 'mapel_' . $m->id;
                $allMapelKeys[] = $extKey;
                $allMapelInfoList[] = [
                    'key' => $extKey,
                    'label' => $m->nama_mapel,
                    'mapel_id' => $m->id,
                    'is_extra' => true
                ];
            }
        }

        if ($isFullAccess) {
            $allKelas = DB::table('kelas')->select('id', 'nama_kelas', 'tingkat')->orderBy('nama_kelas')->get();
            return response()->json([
                'status' => 'success',
                'is_full_access' => true,
                'is_wali_kelas' => true,
                'wali_classes' => $allKelas,
                'all_mapel_info' => $allMapelInfoList,
                'allowed_classes' => $allKelas->map(function ($k) use ($allMapelKeys) {
                    return [
                        'kelas_id' => $k->id,
                        'nama_kelas' => $k->nama_kelas,
                        'tingkat' => $k->tingkat,
                        'is_wali' => true,
                        'allowed_mapel_keys' => $allMapelKeys,
                        'mapel_names' => ['Semua Mata Pelajaran'],
                    ];
                }),
                'all_allowed_mapels' => $allMapelKeys,
            ]);
        }

        // For Guru:
        $idGuru = $user->id_guru;
        if (!$idGuru) {
            $guruRow = DB::table('guru')->where('nama_lengkap', 'LIKE', '%' . $user->name . '%')->first();
            if ($guruRow) {
                $idGuru = $guruRow->id_guru;
            }
        }

        if (!$idGuru) {
            return response()->json([
                'status' => 'success',
                'is_full_access' => false,
                'allowed_classes' => [],
                'all_allowed_mapels' => [],
                'all_mapel_info' => $allMapelInfoList,
                'message' => 'Akun Anda belum terhubung dengan ID Guru.'
            ]);
        }

        // Get schedules
        $schedules = DB::table('jadwal_pelajaran')
            ->join('kelas', 'jadwal_pelajaran.kelas_id', '=', 'kelas.id')
            ->join('mata_pelajaran', 'jadwal_pelajaran.mapel_id', '=', 'mata_pelajaran.id')
            ->where('jadwal_pelajaran.id_guru', $idGuru)
            ->select(
                'kelas.id as kelas_id',
                'kelas.nama_kelas',
                'kelas.tingkat',
                'mata_pelajaran.id as mapel_id',
                'mata_pelajaran.nama_mapel'
            )
            ->get();

        // Get homeroom class (wali kelas)
        $waliKelas = DB::table('kelas')
            ->where('id_guru_wali', $idGuru)
            ->select('id as kelas_id', 'nama_kelas', 'tingkat')
            ->get();

        $classesMap = [];

        foreach ($schedules as $s) {
            if (!isset($classesMap[$s->kelas_id])) {
                $classesMap[$s->kelas_id] = [
                    'kelas_id' => $s->kelas_id,
                    'nama_kelas' => $s->nama_kelas,
                    'tingkat' => $s->tingkat,
                    'is_wali' => false,
                    'allowed_mapel_keys' => [],
                    'mapel_names' => [],
                ];
            }
            $mappedKeys = self::mapelNameToKeys($s->nama_mapel);
            if (empty($mappedKeys)) {
                $mappedKeys = ['mapel_' . $s->mapel_id];
            }
            foreach ($mappedKeys as $k) {
                if (!in_array($k, $classesMap[$s->kelas_id]['allowed_mapel_keys'])) {
                    $classesMap[$s->kelas_id]['allowed_mapel_keys'][] = $k;
                }
            }
            if (!in_array($s->nama_mapel, $classesMap[$s->kelas_id]['mapel_names'])) {
                $classesMap[$s->kelas_id]['mapel_names'][] = $s->nama_mapel;
            }
        }

        foreach ($waliKelas as $w) {
            if (!isset($classesMap[$w->kelas_id])) {
                $classesMap[$w->kelas_id] = [
                    'kelas_id' => $w->kelas_id,
                    'nama_kelas' => $w->nama_kelas,
                    'tingkat' => $w->tingkat,
                    'is_wali' => true,
                    'allowed_mapel_keys' => [],
                    'mapel_names' => ['Wali Kelas'],
                ];
            } else {
                $classesMap[$w->kelas_id]['is_wali'] = true;
            }
        }

        $allAllowedMapels = [];
        foreach ($classesMap as $c) {
            foreach ($c['allowed_mapel_keys'] as $mk) {
                if (!in_array($mk, $allAllowedMapels)) {
                    $allAllowedMapels[] = $mk;
                }
            }
        }

        $classesList = array_values($classesMap);
        usort($classesList, fn($a, $b) => strcmp($a['nama_kelas'], $b['nama_kelas']));
        $waliList = array_values(array_filter($classesList, fn($c) => !empty($c['is_wali'])));

        return response()->json([
            'status' => 'success',
            'is_full_access' => false,
            'is_wali_kelas' => count($waliList) > 0,
            'wali_classes' => $waliList,
            'allowed_classes' => $classesList,
            'all_allowed_mapels' => $allAllowedMapels,
            'all_mapel_info' => $allMapelInfoList,
        ]);
    }

    public function show(Request $request, $siswa_id)
    {
        $user = $request->user();
        $isFullAccess = $user ? in_array($user->role, ['admin', 'kurikulum', 'kepala_sekolah', 'waka']) : true;

        $allKeys = [
            'nilai_pai', 'nilai_ppkn', 'nilai_indo', 'nilai_mtk', 'nilai_inggris',
            'nilai_seni', 'nilai_penjas', 'nilai_informa', 'nilai_sejarah', 'nilai_biologi',
            'nilai_fisika', 'nilai_kimia', 'nilai_geografi', 'nilai_sosiologi', 'nilai_ekonomi',
            'nilai_pkwu', 'nilai_alquran', 'nilai_akhlaq', 'nilai_fiqih', 'nilai_nahwu', 'nilai_aswaja'
        ];

        $allowedMapelKeys = [];
        $isWaliKelas = false;

        $siswaMeta = DB::table('siswa')
            ->leftJoin('anggota_kelas', 'siswa.id', '=', 'anggota_kelas.siswa_id')
            ->leftJoin('kelas', 'anggota_kelas.kelas_id', '=', 'kelas.id')
            ->select('siswa.id as siswa_id', 'siswa.nama as nama_siswa', 'siswa.nis as no_induk', 'kelas.id as kelas_id', 'kelas.nama_kelas as kelas', 'kelas.id_guru_wali')
            ->where('siswa.id', $siswa_id)
            ->first();

        if (!$siswaMeta) {
            return response()->json(['status' => 'error', 'message' => 'Siswa tidak ditemukan.'], 404);
        }

        if ($isFullAccess) {
            $allowedMapelKeys = $allKeys;
            $isWaliKelas = true;
        } elseif ($user) {
            $idGuru = $user->id_guru;
            if (!$idGuru) {
                $guruRow = DB::table('guru')->where('nama_lengkap', 'LIKE', '%' . $user->name . '%')->first();
                if ($guruRow) $idGuru = $guruRow->id_guru;
            }

            if ($siswaMeta->kelas_id && $idGuru) {
                if ($siswaMeta->id_guru_wali && $siswaMeta->id_guru_wali == $idGuru) {
                    $isWaliKelas = true;
                }

                $taught = DB::table('jadwal_pelajaran')
                    ->join('mata_pelajaran', 'jadwal_pelajaran.mapel_id', '=', 'mata_pelajaran.id')
                    ->where('jadwal_pelajaran.id_guru', $idGuru)
                    ->where('jadwal_pelajaran.kelas_id', $siswaMeta->kelas_id)
                    ->pluck('mata_pelajaran.nama_mapel');

                foreach ($taught as $tm) {
                    $mks = self::mapelNameToKeys($tm);
                    foreach ($mks as $mk) {
                        if (!in_array($mk, $allowedMapelKeys)) {
                            $allowedMapelKeys[] = $mk;
                        }
                    }
                }
            }
        }

        $rapor = DB::table('rapor_sts')
            ->join('siswa', 'rapor_sts.siswa_id', '=', 'siswa.id')
            ->leftJoin('anggota_kelas', 'siswa.id', '=', 'anggota_kelas.siswa_id')
            ->leftJoin('kelas', 'anggota_kelas.kelas_id', '=', 'kelas.id')
            ->select(
                'rapor_sts.*',
                'siswa.nama as nama_siswa',
                'siswa.nis as no_induk',
                'kelas.nama_kelas as kelas'
            )
            ->where('rapor_sts.siswa_id', $siswa_id)
            ->first();

        if (!$rapor) {
            return response()->json([
                'status' => 'success',
                'data' => [
                    'siswa_id' => $siswaMeta->siswa_id,
                    'nama_siswa' => $siswaMeta->nama_siswa,
                    'no_induk' => $siswaMeta->no_induk,
                    'kelas' => $siswaMeta->kelas ?? 'X.1',
                    'tahun_ajaran' => '2026/2027',
                    'semester' => 'Ganjil',
                    'nilai_pai' => 0, 'nilai_ppkn' => 0, 'nilai_indo' => 0, 'nilai_mtk' => 0,
                    'nilai_inggris' => 0, 'nilai_seni' => 0, 'nilai_penjas' => 0, 'nilai_informa' => 0,
                    'nilai_sejarah' => 0, 'nilai_biologi' => 0, 'nilai_fisika' => 0, 'nilai_kimia' => 0,
                    'nilai_geografi' => 0, 'nilai_sosiologi' => 0, 'nilai_ekonomi' => 0, 'nilai_pkwu' => 0,
                    'nilai_alquran' => 0, 'nilai_akhlaq' => 0, 'nilai_fiqih' => 0, 'nilai_nahwu' => 0,
                    'nilai_aswaja' => 0,
                    'jumlah' => 0,
                    'rata_rata' => 0,
                    'kktp' => 75,
                    'catatan_wali_kelas' => '',
                    'status_validasi' => 'draft',
                    'ttd_walikelas' => null,
                    'ttd_kepsek' => null,
                    'allowed_mapel_keys' => $allowedMapelKeys,
                    'is_full_access' => $isFullAccess,
                    'is_wali_kelas' => $isWaliKelas,
                ]
            ]);
        }

        $resData = (array)$rapor;
        $resData['allowed_mapel_keys'] = $allowedMapelKeys;
        $resData['is_full_access'] = $isFullAccess;
        $resData['is_wali_kelas'] = $isWaliKelas;

        return response()->json([
            'status' => 'success',
            'data' => $resData,
        ]);
    }

    public function storeOrUpdate(Request $request)
    {
        $request->validate([
            'siswa_id' => 'required|exists:siswa,id',
        ]);

        $user = $request->user();
        $isFullAccess = in_array($user->role, ['admin', 'kurikulum', 'kepala_sekolah', 'waka']);

        $allKeys = [
            'nilai_pai', 'nilai_ppkn', 'nilai_indo', 'nilai_mtk', 'nilai_inggris',
            'nilai_seni', 'nilai_penjas', 'nilai_informa', 'nilai_sejarah', 'nilai_biologi',
            'nilai_fisika', 'nilai_kimia', 'nilai_geografi', 'nilai_sosiologi', 'nilai_ekonomi',
            'nilai_pkwu', 'nilai_alquran', 'nilai_akhlaq', 'nilai_fiqih', 'nilai_nahwu', 'nilai_aswaja'
        ];

        $siswa = DB::table('siswa')
            ->leftJoin('anggota_kelas', 'siswa.id', '=', 'anggota_kelas.siswa_id')
            ->leftJoin('kelas', 'anggota_kelas.kelas_id', '=', 'kelas.id')
            ->select('siswa.id as siswa_id', 'kelas.id as kelas_id', 'kelas.nama_kelas', 'kelas.id_guru_wali')
            ->where('siswa.id', $request->siswa_id)
            ->first();

        if (!$siswa || !$siswa->kelas_id) {
            return response()->json(['status' => 'error', 'message' => 'Siswa belum terdaftar di kelas manapun.'], 400);
        }

        $allowedKeys = [];
        $isWaliKelas = false;

        if ($isFullAccess) {
            $allowedKeys = $allKeys;
            $isWaliKelas = true;
        } else {
            $idGuru = $user->id_guru;
            if (!$idGuru) {
                $guruRow = DB::table('guru')->where('nama_lengkap', 'LIKE', '%' . $user->name . '%')->first();
                if ($guruRow) $idGuru = $guruRow->id_guru;
            }

            if ($siswa->id_guru_wali && $siswa->id_guru_wali == $idGuru) {
                $isWaliKelas = true;
            }

            $taughtMapels = DB::table('jadwal_pelajaran')
                ->join('mata_pelajaran', 'jadwal_pelajaran.mapel_id', '=', 'mata_pelajaran.id')
                ->where('jadwal_pelajaran.id_guru', $idGuru)
                ->where('jadwal_pelajaran.kelas_id', $siswa->kelas_id)
                ->pluck('mata_pelajaran.nama_mapel');

            foreach ($taughtMapels as $mName) {
                $mapped = self::mapelNameToKeys($mName);
                foreach ($mapped as $k) {
                    if (!in_array($k, $allowedKeys)) {
                        $allowedKeys[] = $k;
                    }
                }
            }

            if (empty($allowedKeys) && !$isWaliKelas) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Anda tidak memiliki jadwal mengajar di kelas siswa ini (' . $siswa->nama_kelas . ').'
                ], 403);
            }
        }

        $existing = DB::table('rapor_sts')->where('siswa_id', $request->siswa_id)->first();

        if ($existing && !$isFullAccess && in_array($existing->status_validasi, ['submitted_by_guru', 'approved_by_walikelas', 'approved_by_kepsek'])) {
            return response()->json(['status' => 'error', 'message' => 'Rapor sudah disubmit/divalidasi, tidak dapat diubah lagi oleh Guru.'], 403);
        }

        $dataToSave = [
            'siswa_id' => $request->siswa_id,
            'tahun_ajaran' => $request->tahun_ajaran ?? ($existing->tahun_ajaran ?? '2026/2027'),
            'semester' => $request->semester ?? ($existing->semester ?? 'Ganjil'),
            'kktp' => $request->kktp ?? ($existing->kktp ?? 75),
            'updated_at' => now(),
        ];

        if ($isWaliKelas && $request->has('catatan_wali_kelas')) {
            $dataToSave['catatan_wali_kelas'] = $request->catatan_wali_kelas;
        } elseif ($existing) {
            $dataToSave['catatan_wali_kelas'] = $existing->catatan_wali_kelas;
        } else {
            $dataToSave['catatan_wali_kelas'] = '';
        }

        $jumlah = 0;
        foreach ($allKeys as $k) {
            if (in_array($k, $allowedKeys)) {
                // If user is allowed to edit this key, take from request if provided
                $val = intval($request->input($k, ($existing ? $existing->$k : 0)));
                $dataToSave[$k] = $val;
            } else {
                // Preserve existing grade from other teachers!
                $dataToSave[$k] = $existing ? intval($existing->$k) : 0;
            }
            $jumlah += $dataToSave[$k];
        }

        $dataToSave['jumlah'] = $jumlah;
        $dataToSave['rata_rata'] = round($jumlah / count($allKeys), 2);

        if ($existing) {
            DB::table('rapor_sts')->where('id', $existing->id)->update($dataToSave);
        } else {
            $dataToSave['created_at'] = now();
            $dataToSave['status_validasi'] = 'draft';
            DB::table('rapor_sts')->insert($dataToSave);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Nilai Rapor STS berhasil disimpan.',
        ]);
    }

    public function submitToWaliKelas(Request $request, $siswa_id)
    {
        $user = $request->user();
        $isFullAccess = in_array($user->role, ['admin', 'kurikulum', 'kepala_sekolah', 'waka']);

        $rapor = DB::table('rapor_sts')->where('siswa_id', $siswa_id)->first();
        if (!$rapor) {
            return response()->json(['status' => 'error', 'message' => 'Simpan rapor (draft) terlebih dahulu sebelum dikirim.'], 400);
        }

        if (!$isFullAccess) {
            $idGuru = $user->id_guru;
            if (!$idGuru) {
                $guruRow = DB::table('guru')->where('nama_lengkap', 'LIKE', '%' . $user->name . '%')->first();
                if ($guruRow) $idGuru = $guruRow->id_guru;
            }

            $siswa = DB::table('siswa')
                ->leftJoin('anggota_kelas', 'siswa.id', '=', 'anggota_kelas.siswa_id')
                ->where('siswa.id', $siswa_id)
                ->select('anggota_kelas.kelas_id')
                ->first();

            $hasSchedule = DB::table('jadwal_pelajaran')
                ->where('id_guru', $idGuru)
                ->where('kelas_id', $siswa->kelas_id ?? 0)
                ->exists();

            $isWali = DB::table('kelas')
                ->where('id_guru_wali', $idGuru)
                ->where('id', $siswa->kelas_id ?? 0)
                ->exists();

            if (!$hasSchedule && !$isWali) {
                return response()->json(['status' => 'error', 'message' => 'Anda tidak memiliki hak untuk mengajukan rapor siswa ini.'], 403);
            }
        }

        DB::table('rapor_sts')->where('id', $rapor->id)->update([
            'status_validasi' => 'submitted_by_guru',
            'updated_at' => now()
        ]);

        return response()->json(['status' => 'success', 'message' => 'Rapor berhasil dikirim ke Wali Kelas.']);
    }

    public function approveWaliKelas(Request $request, $siswa_id)
    {
        $user = $request->user();
        $isFullAccess = in_array($user->role, ['admin', 'kurikulum', 'kepala_sekolah', 'waka']);

        $rapor = DB::table('rapor_sts')->where('siswa_id', $siswa_id)->first();
        if (!$rapor) {
            return response()->json(['status' => 'error', 'message' => 'Rapor tidak ditemukan.'], 404);
        }

        if (!$isFullAccess) {
            $idGuru = $user->id_guru;
            if (!$idGuru) {
                $guruRow = DB::table('guru')->where('nama_lengkap', 'LIKE', '%' . $user->name . '%')->first();
                if ($guruRow) $idGuru = $guruRow->id_guru;
            }

            $siswa = DB::table('siswa')
                ->leftJoin('anggota_kelas', 'siswa.id', '=', 'anggota_kelas.siswa_id')
                ->leftJoin('kelas', 'anggota_kelas.kelas_id', '=', 'kelas.id')
                ->where('siswa.id', $siswa_id)
                ->select('kelas.id_guru_wali', 'kelas.nama_kelas')
                ->first();

            if (!$siswa || $siswa->id_guru_wali != $idGuru) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Hanya Wali Kelas yang bersangkutan yang berhak memvalidasi rapor kelas ini.'
                ], 403);
            }
        }

        DB::table('rapor_sts')->where('id', $rapor->id)->update([
            'status_validasi' => 'approved_by_walikelas',
            'catatan_wali_kelas' => $request->catatan_wali_kelas ?? $rapor->catatan_wali_kelas,
            'ttd_walikelas' => now(),
            'updated_at' => now()
        ]);

        return response()->json(['status' => 'success', 'message' => 'Rapor berhasil divalidasi oleh Wali Kelas.']);
    }

    public function approveKepsek(Request $request, $siswa_id)
    {
        $user = $request->user();
        if (!in_array($user->role, ['admin', 'kepala_sekolah', 'waka'])) {
            return response()->json(['status' => 'error', 'message' => 'Hanya Kepala Sekolah yang berhak menyetujui final.'], 403);
        }

        $rapor = DB::table('rapor_sts')->where('siswa_id', $siswa_id)->first();
        if (!$rapor) {
            return response()->json(['status' => 'error', 'message' => 'Rapor tidak ditemukan.'], 404);
        }

        DB::table('rapor_sts')->where('id', $rapor->id)->update([
            'status_validasi' => 'approved_by_kepsek',
            'ttd_kepsek' => now(),
            'updated_at' => now()
        ]);

        return response()->json(['status' => 'success', 'message' => 'Rapor berhasil di-approve oleh Kepala Sekolah.']);
    }

    public function resetToDraft(Request $request, $siswa_id)
    {
        $user = $request->user();
        if (!in_array($user->role, ['admin', 'kurikulum', 'kepala_sekolah', 'waka'])) {
            return response()->json(['status' => 'error', 'message' => 'Hanya Admin/Kurikulum/Kepsek yang dapat mereset status.'], 403);
        }

        $rapor = DB::table('rapor_sts')->where('siswa_id', $siswa_id)->first();
        if (!$rapor) {
            return response()->json(['status' => 'error', 'message' => 'Rapor tidak ditemukan.'], 404);
        }

        DB::table('rapor_sts')->where('id', $rapor->id)->update([
            'status_validasi' => 'draft',
            'ttd_walikelas' => null,
            'ttd_kepsek' => null,
            'updated_at' => now()
        ]);

        return response()->json(['status' => 'success', 'message' => 'Rapor berhasil dikembalikan ke status Draft.']);
    }

    private function terbilang($nilai) {
        $huruf = [
            "", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"
        ];
        if ($nilai < 12) return $huruf[$nilai];
        elseif ($nilai < 20) return $huruf[$nilai - 10] . " Belas";
        elseif ($nilai < 100) return $huruf[floor($nilai / 10)] . " Puluh " . $huruf[$nilai % 10];
        elseif ($nilai == 100) return "Seratus";
        return "";
    }

    public function exportExcel($siswa_id)
    {
        $rapor = DB::table('rapor_sts')
            ->join('siswa', 'rapor_sts.siswa_id', '=', 'siswa.id')
            ->leftJoin('anggota_kelas', 'siswa.id', '=', 'anggota_kelas.siswa_id')
            ->leftJoin('kelas', 'anggota_kelas.kelas_id', '=', 'kelas.id')
            ->select(
                'rapor_sts.*',
                'siswa.nama as nama_siswa',
                'siswa.nis as no_induk',
                'kelas.nama_kelas as kelas'
            )
            ->where('rapor_sts.siswa_id', $siswa_id)
            ->first();

        if (!$rapor) {
            return response()->json(['status' => 'error', 'message' => 'Data rapor belum ada.'], 404);
        }

        $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // Header Title
        $sheet->mergeCells('A1:E1');
        $sheet->setCellValue('A1', 'YAYASAN HASYIM ASY\'ARI');
        $sheet->mergeCells('A2:E2');
        $sheet->setCellValue('A2', 'SMA KH. A. WAHID HASYIM TEBUIRENG');
        $sheet->mergeCells('A3:E3');
        $sheet->setCellValue('A3', 'LAPORAN HASIL BELAJAR SUMATIF TENGAH SEMESTER (STS)');

        $styleTitle = [
            'font' => ['bold' => true, 'size' => 14],
            'alignment' => ['horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER]
        ];
        $sheet->getStyle('A1:E3')->applyFromArray($styleTitle);

        // Student Info
        $sheet->setCellValue('A5', 'Nama Peserta Didik');
        $sheet->setCellValue('B5', ': ' . $rapor->nama_siswa);
        $sheet->setCellValue('A6', 'Nomor Induk');
        $sheet->setCellValue('B6', ': ' . $rapor->no_induk);
        $sheet->setCellValue('D5', 'Kelas');
        $sheet->setCellValue('E5', ': ' . $rapor->kelas);
        $sheet->setCellValue('D6', 'Semester');
        $sheet->setCellValue('E6', ': ' . $rapor->semester);
        $sheet->setCellValue('D7', 'Tahun Pelajaran');
        $sheet->setCellValue('E7', ': ' . $rapor->tahun_ajaran);

        // Table Header
        $row = 9;
        $sheet->setCellValue('A' . $row, 'NO');
        $sheet->setCellValue('B' . $row, 'MATA PELAJARAN');
        $sheet->setCellValue('C' . $row, 'KKTP');
        $sheet->setCellValue('D' . $row, 'NILAI ANGKA');
        $sheet->setCellValue('E' . $row, 'HURUF / TERBILANG');

        $styleTableHeader = [
            'font' => ['bold' => true],
            'alignment' => ['horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER],
            'borders' => ['allBorders' => ['borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN]]
        ];
        $sheet->getStyle('A' . $row . ':E' . $row)->applyFromArray($styleTableHeader);
        $sheet->getStyle('A' . $row . ':E' . $row)->getFill()->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)->getStartColor()->setARGB('FFEFEFEF');

        // Column Widths
        $sheet->getColumnDimension('A')->setWidth(5);
        $sheet->getColumnDimension('B')->setWidth(35);
        $sheet->getColumnDimension('C')->setWidth(10);
        $sheet->getColumnDimension('D')->setWidth(15);
        $sheet->getColumnDimension('E')->setWidth(30);

        // Subjects Map
        $mapels = [
            'nilai_pai' => 'Pendidikan Agama Islam (PAI)', 'nilai_ppkn' => 'PPKN', 'nilai_indo' => 'Bahasa Indonesia',
            'nilai_mtk' => 'Matematika', 'nilai_inggris' => 'Bhs. Inggris', 'nilai_seni' => 'Seni Budaya',
            'nilai_penjas' => 'Penjaskes', 'nilai_informa' => 'Informatika', 'nilai_sejarah' => 'Sejarah',
            'nilai_biologi' => 'IPA Biologi', 'nilai_fisika' => 'Fisika', 'nilai_kimia' => 'Kimia',
            'nilai_geografi' => 'IPS Geografi', 'nilai_sosiologi' => 'Sosiologi', 'nilai_ekonomi' => 'Ekonomi',
            'nilai_pkwu' => 'PKWU', 'nilai_alquran' => 'Al-Quran', 'nilai_akhlaq' => 'Akhlaq',
            'nilai_fiqih' => 'Fiqih', 'nilai_nahwu' => 'Nahwu Shorof', 'nilai_aswaja' => 'Ke-Aswaja-an'
        ];

        $row++;
        $no = 1;
        $startRow = $row;
        foreach ($mapels as $key => $name) {
            $nilai = $rapor->{$key};
            $sheet->setCellValue('A' . $row, $no);
            $sheet->setCellValue('B' . $row, $name);
            $sheet->setCellValue('C' . $row, $rapor->kktp);
            $sheet->setCellValue('D' . $row, $nilai);
            $sheet->setCellValue('E' . $row, $this->terbilang($nilai));
            
            $sheet->getStyle('A' . $row)->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle('C' . $row)->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle('D' . $row)->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle('E' . $row)->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
            
            $row++;
            $no++;
        }

        // Extra Subjects (Nilai Tambahan)
        $extraScores = json_decode($rapor->nilai_tambahan ?? '{}', true) ?: [];
        foreach ($extraScores as $ext) {
            $nilai = $ext['nilai'] ?? 0;
            $sheet->setCellValue('A' . $row, $no);
            $sheet->setCellValue('B' . $row, $ext['nama_mapel'] ?? "Mapel {$no}");
            $sheet->setCellValue('C' . $row, $ext['kktp'] ?? $rapor->kktp);
            $sheet->setCellValue('D' . $row, $nilai);
            $sheet->setCellValue('E' . $row, $this->terbilang($nilai));
            
            $sheet->getStyle('A' . $row)->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle('C' . $row)->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle('D' . $row)->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle('E' . $row)->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
            
            $row++;
            $no++;
        }

        // Summary
        $sheet->setCellValue('A' . $row, 'JUMLAH');
        $sheet->mergeCells('A' . $row . ':C' . $row);
        $sheet->setCellValue('D' . $row, $rapor->jumlah);
        $sheet->mergeCells('E' . $row . ':E' . $row);
        
        $sheet->getStyle('A' . $row . ':E' . $row)->getFont()->setBold(true);
        $sheet->getStyle('D' . $row)->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
        $row++;

        $sheet->setCellValue('A' . $row, 'RATA-RATA');
        $sheet->mergeCells('A' . $row . ':C' . $row);
        $sheet->setCellValue('D' . $row, $rapor->rata_rata);
        $sheet->mergeCells('E' . $row . ':E' . $row);
        
        $sheet->getStyle('A' . $row . ':E' . $row)->getFont()->setBold(true);
        $sheet->getStyle('D' . $row)->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
        
        $endRow = $row;
        
        $styleTableBody = [
            'borders' => ['allBorders' => ['borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN]]
        ];
        $sheet->getStyle('A9:E' . $endRow)->applyFromArray($styleTableBody);

        // Footer / Signatures
        $row += 3;
        $sheet->setCellValue('D' . $row, 'Jombang, ' . date('d F Y'));
        $row++;
        $sheet->setCellValue('A' . $row, 'Mengetahui,');
        $row++;
        $sheet->setCellValue('A' . $row, 'Orang Tua / Wali');
        $sheet->setCellValue('D' . $row, 'Wali Kelas');
        
        $row += 4;
        $sheet->setCellValue('A' . $row, '(........................................)');
        $sheet->setCellValue('D' . $row, '(........................................)');
        
        $row += 2;
        $sheet->setCellValue('B' . $row, 'Mengetahui,');
        $sheet->setCellValue('B' . ($row + 1), 'Kepala SMA A. Wahid Hasyim');
        $sheet->setCellValue('B' . ($row + 5), '(........................................)');
        $sheet->getStyle('B' . $row . ':B' . ($row + 5))->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);

        $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);
        
        $fileName = 'Rapor_STS_' . str_replace(' ', '_', $rapor->nama_siswa) . '.xlsx';
        
        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header('Content-Disposition: attachment; filename="'. urlencode($fileName).'"');
        $writer->save('php://output');
        exit;
    }

    public function getNilaiMapelKelas(Request $request)
    {
        $request->validate([
            'kelas_id' => 'required|exists:kelas,id',
            'mapel_key' => 'required|string',
        ]);

        $kelasId = $request->kelas_id;
        $mapelKey = $request->mapel_key;

        $kelas = DB::table('kelas')
            ->leftJoin('guru', 'kelas.id_guru_wali', '=', 'guru.id_guru')
            ->select('kelas.id', 'kelas.nama_kelas', 'kelas.tingkat', 'kelas.jumlah_siswa', 'guru.nama_lengkap as nama_wali')
            ->where('kelas.id', $kelasId)
            ->first();

        $siswaList = DB::table('siswa as s')
            ->join('anggota_kelas as ak', 's.id', '=', 'ak.siswa_id')
            ->where('ak.kelas_id', $kelasId)
            ->select('s.id as siswa_id', 's.nama', 's.nis', 's.nisn', 's.jenis_kelamin')
            ->orderBy('s.nama', 'asc')
            ->get();

        $raporRows = DB::table('rapor_sts')
            ->whereIn('siswa_id', $siswaList->pluck('siswa_id'))
            ->get()
            ->keyBy('siswa_id');

        $totalSiswa = count($siswaList);
        $totalTerisi = 0;
        $totalTuntas = 0;
        $totalBelumTuntas = 0;
        $sumNilai = 0;
        $maxNilai = 0;
        $minNilai = 100;

        $isExtra = str_starts_with($mapelKey, 'mapel_');
        $extraMapelId = $isExtra ? (int)str_replace('mapel_', '', $mapelKey) : null;

        $items = [];
        foreach ($siswaList as $idx => $s) {
            $rapor = $raporRows[$s->siswa_id] ?? null;
            if ($isExtra) {
                $extraScores = json_decode($rapor ? ($rapor->nilai_tambahan ?? '{}') : '{}', true) ?: [];
                $nilai = isset($extraScores[$extraMapelId]) ? (int)$extraScores[$extraMapelId]['nilai'] : 0;
            } else {
                $nilai = $rapor ? (int)($rapor->{$mapelKey} ?? 0) : 0;
            }
            $isFilled = $nilai > 0;
            $statusTuntas = $nilai >= 75 ? 'Tuntas' : ($nilai > 0 ? 'Belum Tuntas' : 'Belum Diisi');

            if ($isFilled) {
                $totalTerisi++;
                $sumNilai += $nilai;
                if ($nilai > $maxNilai) $maxNilai = $nilai;
                if ($nilai < $minNilai) $minNilai = $nilai;
                if ($nilai >= 75) $totalTuntas++;
                else $totalBelumTuntas++;
            }

            $items[] = [
                'no' => $idx + 1,
                'siswa_id' => $s->siswa_id,
                'nama' => $s->nama,
                'nis' => $s->nis,
                'nisn' => $s->nisn,
                'jenis_kelamin' => $s->jenis_kelamin,
                'nilai' => $nilai,
                'is_filled' => $isFilled,
                'kktp' => 75,
                'status_tuntas' => $statusTuntas,
                'status_validasi' => $rapor->status_validasi ?? 'draft',
            ];
        }

        $rataRata = $totalTerisi > 0 ? round($sumNilai / $totalTerisi, 1) : 0;
        if ($totalTerisi === 0) {
            $minNilai = 0;
        }

        return response()->json([
            'status' => 'success',
            'kelas' => $kelas,
            'mapel_key' => $mapelKey,
            'statistik' => [
                'total_siswa' => $totalSiswa,
                'total_terisi' => $totalTerisi,
                'rata_rata' => $rataRata,
                'tertinggi' => $maxNilai,
                'terendah' => $minNilai,
                'total_tuntas' => $totalTuntas,
                'total_belum_tuntas' => $totalBelumTuntas,
            ],
            'siswa' => $items,
        ]);
    }

    public function storeNilaiMapelKelas(Request $request)
    {
        $request->validate([
            'kelas_id' => 'required|exists:kelas,id',
            'mapel_key' => 'required|string',
            'grades' => 'required|array',
            'grades.*.siswa_id' => 'required|exists:siswa,id',
            'grades.*.nilai' => 'required|numeric|min:0|max:100',
        ]);

        $allKeys = [
            'nilai_pai', 'nilai_ppkn', 'nilai_indo', 'nilai_mtk', 'nilai_inggris',
            'nilai_seni', 'nilai_penjas', 'nilai_informa', 'nilai_sejarah', 'nilai_biologi',
            'nilai_fisika', 'nilai_kimia', 'nilai_geografi', 'nilai_sosiologi', 'nilai_ekonomi',
            'nilai_pkwu', 'nilai_alquran', 'nilai_akhlaq', 'nilai_fiqih', 'nilai_nahwu', 'nilai_aswaja'
        ];

        $mapelKey = $request->mapel_key;
        $isExtra = str_starts_with($mapelKey, 'mapel_');
        $extraMapelId = $isExtra ? (int)str_replace('mapel_', '', $mapelKey) : null;
        $extraMapelObj = null;

        if ($isExtra) {
            $extraMapelObj = DB::table('mata_pelajaran')->where('id', $extraMapelId)->first();
            if (!$extraMapelObj) {
                return response()->json(['status' => 'error', 'message' => 'Mata pelajaran tambahan tidak valid.'], 400);
            }
        } else if (!in_array($mapelKey, $allKeys)) {
            return response()->json(['status' => 'error', 'message' => 'Kolom mata pelajaran tidak valid.'], 400);
        }

        $user = $request->user();
        $isFullAccess = in_array($user->role, ['admin', 'kurikulum', 'kepala_sekolah', 'waka']);

        if (!$isFullAccess) {
            $idGuru = $user->id_guru;
            if (!$idGuru) {
                $guruRow = DB::table('guru')->where('nama_lengkap', 'LIKE', '%' . $user->name . '%')->first();
                if ($guruRow) $idGuru = $guruRow->id_guru;
            }

            $isWali = DB::table('kelas')->where('id', $request->kelas_id)->where('id_guru_wali', $idGuru)->exists();
            $hasSchedule = DB::table('jadwal_pelajaran')
                ->where('kelas_id', $request->kelas_id)
                ->where('id_guru', $idGuru)
                ->exists();

            if (!$isWali && !$hasSchedule) {
                return response()->json(['status' => 'error', 'message' => 'Anda tidak memiliki jadwal mengajar di kelas ini.'], 403);
            }
        }

        $activeSemRow = DB::table('semester')->where('is_active', true)->first();
        $currentSemester = $activeSemRow ? $activeSemRow->nama : 'Ganjil';

        DB::beginTransaction();
        try {
            $count = 0;
            foreach ($request->grades as $item) {
                $siswaId = $item['siswa_id'];
                $nilaiBaru = intval($item['nilai']);

                $existing = DB::table('rapor_sts')->where('siswa_id', $siswaId)->first();

                if ($existing) {
                    $dataToSave = [
                        'updated_at' => now(),
                    ];

                    if ($isExtra) {
                        $extra = json_decode($existing->nilai_tambahan ?? '{}', true) ?: [];
                        $extra[$extraMapelId] = [
                            'mapel_id' => $extraMapelId,
                            'nama_mapel' => $extraMapelObj->nama_mapel,
                            'nilai' => $nilaiBaru,
                            'kktp' => 75,
                        ];
                        $dataToSave['nilai_tambahan'] = json_encode($extra);
                    } else {
                        $dataToSave[$mapelKey] = $nilaiBaru;
                    }

                    $jumlah = 0;
                    foreach ($allKeys as $k) {
                        $jumlah += (!$isExtra && $k === $mapelKey ? $nilaiBaru : intval($existing->$k));
                    }

                    $extraList = $isExtra 
                        ? json_decode($dataToSave['nilai_tambahan'], true) 
                        : (json_decode($existing->nilai_tambahan ?? '{}', true) ?: []);
                    foreach ($extraList as $extItem) {
                        $jumlah += intval($extItem['nilai'] ?? 0);
                    }

                    $totalSubjectCount = count($allKeys) + count($extraList);
                    $dataToSave['jumlah'] = $jumlah;
                    $dataToSave['rata_rata'] = round($jumlah / max(1, $totalSubjectCount), 2);

                    DB::table('rapor_sts')->where('id', $existing->id)->update($dataToSave);
                } else {
                    $dataToSave = [
                        'siswa_id' => $siswaId,
                        'tahun_ajaran' => '2026/2027',
                        'semester' => $currentSemester,
                        'kktp' => 75,
                        'catatan_wali_kelas' => '',
                        'status_validasi' => 'draft',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];

                    $jumlah = 0;
                    foreach ($allKeys as $k) {
                        $val = (!$isExtra && $k === $mapelKey ? $nilaiBaru : 0);
                        $dataToSave[$k] = $val;
                        $jumlah += $val;
                    }

                    $extraList = [];
                    if ($isExtra) {
                        $extraList[$extraMapelId] = [
                            'mapel_id' => $extraMapelId,
                            'nama_mapel' => $extraMapelObj->nama_mapel,
                            'nilai' => $nilaiBaru,
                            'kktp' => 75,
                        ];
                        $jumlah += $nilaiBaru;
                    }
                    $dataToSave['nilai_tambahan'] = json_encode($extraList);

                    $totalSubjectCount = count($allKeys) + count($extraList);
                    $dataToSave['jumlah'] = $jumlah;
                    $dataToSave['rata_rata'] = round($jumlah / max(1, $totalSubjectCount), 2);

                    DB::table('rapor_sts')->insert($dataToSave);
                }
                $count++;
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => "Berhasil menyimpan nilai untuk {$count} siswa.",
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal menyimpan nilai: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function getWaliKelasRapor(Request $request)
    {
        $user = $request->user();
        $isFullAccess = $user ? in_array($user->role, ['admin', 'kurikulum', 'kepala_sekolah', 'waka']) : true;

        $idGuru = $user ? $user->id_guru : null;
        if (!$idGuru && $user && $user->role === 'guru') {
            $guruRow = DB::table('guru')->where('nama_lengkap', 'LIKE', '%' . $user->name . '%')->first();
            if ($guruRow) $idGuru = $guruRow->id_guru;
        }

        // Kelas yang dibina oleh wali kelas ini
        $myWaliClasses = collect();
        if ($idGuru) {
            $myWaliClasses = DB::table('kelas')
                ->where('id_guru_wali', $idGuru)
                ->select('id', 'nama_kelas', 'tingkat', 'jumlah_siswa')
                ->orderBy('nama_kelas')
                ->get();
        }

        if (!$isFullAccess) {
            if ($myWaliClasses->isEmpty()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Akun Anda belum ditugaskan sebagai Wali Kelas pada rombel manapun oleh Administrator.',
                ], 403);
            }

            $allowedWaliIds = $myWaliClasses->pluck('id')->toArray();
            $requestedKelasId = $request->get('kelas_id');
            if ($requestedKelasId && in_array((int)$requestedKelasId, $allowedWaliIds)) {
                $kelasId = (int)$requestedKelasId;
            } else {
                $kelasId = $allowedWaliIds[0];
            }
            $allKelasList = $myWaliClasses;
        } else {
            $kelasId = $request->get('kelas_id');
            if (!$kelasId) {
                $firstK = DB::table('kelas')->first();
                $kelasId = $firstK ? $firstK->id : 1;
            }
            $allKelasList = DB::table('kelas')->select('id', 'nama_kelas', 'tingkat', 'jumlah_siswa')->orderBy('nama_kelas')->get();
        }

        $kelas = DB::table('kelas')
            ->leftJoin('guru', 'kelas.id_guru_wali', '=', 'guru.id_guru')
            ->select('kelas.id', 'kelas.nama_kelas', 'kelas.tingkat', 'kelas.jumlah_siswa', 'guru.nama_lengkap as nama_wali', 'kelas.id_guru_wali')
            ->where('kelas.id', $kelasId)
            ->first();

        if (!$kelas) {
            return response()->json(['status' => 'error', 'message' => 'Kelas tidak ditemukan.'], 404);
        }

        $isWaliOfThisClass = ($idGuru && $kelas->id_guru_wali == $idGuru) || $isFullAccess;

        $siswaList = DB::table('siswa as s')
            ->join('anggota_kelas as ak', 's.id', '=', 'ak.siswa_id')
            ->where('ak.kelas_id', $kelasId)
            ->select('s.id as siswa_id', 's.nama', 's.nis', 's.nisn', 's.jenis_kelamin')
            ->orderBy('s.nama', 'asc')
            ->get();

        $allKeys = [
            'nilai_pai', 'nilai_ppkn', 'nilai_indo', 'nilai_mtk', 'nilai_inggris',
            'nilai_seni', 'nilai_penjas', 'nilai_informa', 'nilai_sejarah', 'nilai_biologi',
            'nilai_fisika', 'nilai_kimia', 'nilai_geografi', 'nilai_sosiologi', 'nilai_ekonomi',
            'nilai_pkwu', 'nilai_alquran', 'nilai_akhlaq', 'nilai_fiqih', 'nilai_nahwu', 'nilai_aswaja'
        ];

        $raporRows = DB::table('rapor_sts')
            ->whereIn('siswa_id', $siswaList->pluck('siswa_id'))
            ->get()
            ->keyBy('siswa_id');

        $activeSemRow = DB::table('semester')->where('is_active', true)->first();
        $currentSemester = $activeSemRow ? $activeSemRow->nama : 'Ganjil';

        $activeTaRow = DB::table('tahun_ajaran')->where('is_active', true)->first();
        $currentTahunAjaran = $activeTaRow ? $activeTaRow->nama : '2026/2027';

        $totalSiswa = count($siswaList);
        $totalDivalidasi = 0;
        $totalDraft = 0;
        $sumRataRata = 0;

        $students = [];
        foreach ($siswaList as $idx => $s) {
            $r = $raporRows[$s->siswa_id] ?? null;
            $extraScores = json_decode($r ? ($r->nilai_tambahan ?? '{}') : '{}', true) ?: [];

            $filledMapelCount = 0;
            if ($r) {
                foreach ($allKeys as $k) {
                    if ((int)$r->$k > 0) $filledMapelCount++;
                }
                foreach ($extraScores as $ext) {
                    if ((int)($ext['nilai'] ?? 0) > 0) $filledMapelCount++;
                }
            }

            $statusVal = $r->status_validasi ?? 'draft';
            if (in_array($statusVal, ['approved_by_walikelas', 'approved_by_kepsek'])) {
                $totalDivalidasi++;
            } else {
                $totalDraft++;
            }

            $rataRata = $r ? (float)$r->rata_rata : 0;
            $sumRataRata += $rataRata;

            $students[] = [
                'index' => $idx + 1,
                'siswa_id' => $s->siswa_id,
                'nama' => $s->nama,
                'nis' => $s->nis,
                'nisn' => $s->nisn,
                'jenis_kelamin' => $s->jenis_kelamin,
                'status_validasi' => $statusVal,
                'catatan_wali_kelas' => $r->catatan_wali_kelas ?? '',
                'jumlah' => $r ? (int)$r->jumlah : 0,
                'rata_rata' => $rataRata,
                'kktp' => $r ? (int)$r->kktp : 75,
                'filled_mapel_count' => $filledMapelCount,
                'total_mapel' => count($allKeys) + count($extraScores),
                'ttd_walikelas' => $r->ttd_walikelas ?? null,
                'ttd_kepsek' => $r->ttd_kepsek ?? null,
                'semester' => $r->semester ?? $currentSemester,
                'tahun_ajaran' => $r->tahun_ajaran ?? $currentTahunAjaran,
                'extra_scores' => $extraScores,
                'scores' => $r ? [
                    'nilai_pai' => (int)$r->nilai_pai,
                    'nilai_ppkn' => (int)$r->nilai_ppkn,
                    'nilai_indo' => (int)$r->nilai_indo,
                    'nilai_mtk' => (int)$r->nilai_mtk,
                    'nilai_inggris' => (int)$r->nilai_inggris,
                    'nilai_seni' => (int)$r->nilai_seni,
                    'nilai_penjas' => (int)$r->nilai_penjas,
                    'nilai_informa' => (int)$r->nilai_informa,
                    'nilai_sejarah' => (int)$r->nilai_sejarah,
                    'nilai_biologi' => (int)$r->nilai_biologi,
                    'nilai_fisika' => (int)$r->nilai_fisika,
                    'nilai_kimia' => (int)$r->nilai_kimia,
                    'nilai_geografi' => (int)$r->nilai_geografi,
                    'nilai_sosiologi' => (int)$r->nilai_sosiologi,
                    'nilai_ekonomi' => (int)$r->nilai_ekonomi,
                    'nilai_pkwu' => (int)$r->nilai_pkwu,
                    'nilai_alquran' => (int)$r->nilai_alquran,
                    'nilai_akhlaq' => (int)$r->nilai_akhlaq,
                    'nilai_fiqih' => (int)$r->nilai_fiqih,
                    'nilai_nahwu' => (int)$r->nilai_nahwu,
                    'nilai_aswaja' => (int)$r->nilai_aswaja,
                ] : array_fill_keys($allKeys, 0),
            ];
        }

        // Kumpulkan daftar mata pelajaran tambahan di kelas ini
        $extraMapelsInClass = [];
        $scheduledMapels = DB::table('jadwal_pelajaran')
            ->join('mata_pelajaran', 'jadwal_pelajaran.mapel_id', '=', 'mata_pelajaran.id')
            ->where('jadwal_pelajaran.kelas_id', $kelasId)
            ->select('mata_pelajaran.id', 'mata_pelajaran.nama_mapel')
            ->distinct()
            ->get();
        foreach ($scheduledMapels as $sm) {
            if (empty(self::mapelNameToKeys($sm->nama_mapel))) {
                $extraMapelsInClass[$sm->id] = [
                    'mapel_id' => $sm->id,
                    'nama_mapel' => $sm->nama_mapel,
                    'key' => 'mapel_' . $sm->id,
                ];
            }
        }
        foreach ($students as $st) {
            foreach ($st['extra_scores'] as $mid => $info) {
                if (!isset($extraMapelsInClass[$mid])) {
                    $extraMapelsInClass[$mid] = [
                        'mapel_id' => (int)$mid,
                        'nama_mapel' => $info['nama_mapel'] ?? "Mapel {$mid}",
                        'key' => 'mapel_' . $mid,
                    ];
                }
            }
        }

        return response()->json([
            'status' => 'success',
            'kelas' => $kelas,
            'semester' => $currentSemester,
            'tahun_ajaran' => $currentTahunAjaran,
            'is_wali_of_this_class' => $isWaliOfThisClass,
            'daftar_kelas' => $allKelasList,
            'daftar_extra_mapel' => array_values($extraMapelsInClass),
            'summary' => [
                'total_siswa' => $totalSiswa,
                'total_divalidasi' => $totalDivalidasi,
                'total_draft' => $totalDraft,
                'rata_rata_kelas' => $totalSiswa > 0 ? round($sumRataRata / $totalSiswa, 1) : 0,
            ],
            'students' => $students,
        ]);
    }

    public function saveCatatanWaliKelas(Request $request, $siswa_id)
    {
        $request->validate([
            'catatan_wali_kelas' => 'nullable|string',
            'validate_now' => 'nullable|boolean',
        ]);

        $user = $request->user();
        $isFullAccess = $user ? in_array($user->role, ['admin', 'kurikulum', 'kepala_sekolah', 'waka']) : true;

        if (!$isFullAccess) {
            $idGuru = $user ? $user->id_guru : null;
            if (!$idGuru && $user && $user->role === 'guru') {
                $guruRow = DB::table('guru')->where('nama_lengkap', 'LIKE', '%' . $user->name . '%')->first();
                if ($guruRow) $idGuru = $guruRow->id_guru;
            }

            $isMyStudent = DB::table('anggota_kelas as ak')
                ->join('kelas as k', 'ak.kelas_id', '=', 'k.id')
                ->where('ak.siswa_id', $siswa_id)
                ->where('k.id_guru_wali', $idGuru)
                ->exists();

            if (!$isMyStudent) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Anda tidak memiliki wewenang untuk memberi catatan pada santri di luar kelas binaan Anda.'
                ], 403);
            }
        }

        $rapor = DB::table('rapor_sts')->where('siswa_id', $siswa_id)->first();
        if (!$rapor) {
            DB::table('rapor_sts')->insert([
                'siswa_id' => $siswa_id,
                'tahun_ajaran' => '2026/2027',
                'semester' => 'Ganjil',
                'kktp' => 75,
                'catatan_wali_kelas' => $request->catatan_wali_kelas ?? '',
                'status_validasi' => $request->validate_now ? 'approved_by_walikelas' : 'draft',
                'ttd_walikelas' => $request->validate_now ? now() : null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } else {
            $update = [
                'catatan_wali_kelas' => $request->catatan_wali_kelas ?? '',
                'updated_at' => now(),
            ];
            if ($request->validate_now) {
                $update['status_validasi'] = 'approved_by_walikelas';
                $update['ttd_walikelas'] = now();
            }
            DB::table('rapor_sts')->where('id', $rapor->id)->update($update);
        }

        return response()->json([
            'status' => 'success',
            'message' => $request->validate_now ? 'Catatan dan Validasi Wali Kelas berhasil disimpan.' : 'Catatan Wali Kelas berhasil disimpan.',
        ]);
    }

    public function bulkApproveWaliKelas(Request $request)
    {
        $request->validate([
            'kelas_id' => 'required|exists:kelas,id',
        ]);

        $user = $request->user();
        $isFullAccess = $user ? in_array($user->role, ['admin', 'kurikulum', 'kepala_sekolah', 'waka']) : true;

        if (!$isFullAccess) {
            $idGuru = $user ? $user->id_guru : null;
            if (!$idGuru && $user && $user->role === 'guru') {
                $guruRow = DB::table('guru')->where('nama_lengkap', 'LIKE', '%' . $user->name . '%')->first();
                if ($guruRow) $idGuru = $guruRow->id_guru;
            }

            $isMyClass = DB::table('kelas')
                ->where('id', $request->kelas_id)
                ->where('id_guru_wali', $idGuru)
                ->exists();

            if (!$isMyClass) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Anda tidak memiliki wewenang untuk memvalidasi rapor kelas ini.'
                ], 403);
            }
        }

        $siswaIds = DB::table('anggota_kelas')->where('kelas_id', $request->kelas_id)->pluck('siswa_id');

        $updated = DB::table('rapor_sts')
            ->whereIn('siswa_id', $siswaIds)
            ->update([
                'status_validasi' => 'approved_by_walikelas',
                'ttd_walikelas' => now(),
                'updated_at' => now(),
            ]);

        return response()->json([
            'status' => 'success',
            'message' => "Berhasil memvalidasi seluruh rapor siswa kelas ({$updated} rapor divalidasi).",
        ]);
    }

    public function cancelValidasiWaliKelas(Request $request, $siswa_id)
    {
        $user = $request->user();
        $isFullAccess = $user ? in_array($user->role, ['admin', 'kurikulum', 'kepala_sekolah', 'waka']) : true;

        if (!$isFullAccess) {
            $idGuru = $user ? $user->id_guru : null;
            if (!$idGuru && $user && $user->role === 'guru') {
                $guruRow = DB::table('guru')->where('nama_lengkap', 'LIKE', '%' . $user->name . '%')->first();
                if ($guruRow) $idGuru = $guruRow->id_guru;
            }

            $isMyStudent = DB::table('anggota_kelas as ak')
                ->join('kelas as k', 'ak.kelas_id', '=', 'k.id')
                ->where('ak.siswa_id', $siswa_id)
                ->where('k.id_guru_wali', $idGuru)
                ->exists();

            if (!$isMyStudent) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Anda tidak memiliki wewenang untuk membatalkan validasi santri ini.'
                ], 403);
            }
        }

        DB::table('rapor_sts')
            ->where('siswa_id', $siswa_id)
            ->update([
                'status_validasi' => 'draft',
                'ttd_walikelas' => null,
                'updated_at' => now(),
            ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Validasi rapor berhasil dibatalkan. Status rapor kembali menjadi Draft.',
        ]);
    }

    public function bulkCancelValidasiWaliKelas(Request $request)
    {
        $request->validate([
            'kelas_id' => 'required|exists:kelas,id',
        ]);

        $user = $request->user();
        $isFullAccess = $user ? in_array($user->role, ['admin', 'kurikulum', 'kepala_sekolah', 'waka']) : true;

        if (!$isFullAccess) {
            $idGuru = $user ? $user->id_guru : null;
            if (!$idGuru && $user && $user->role === 'guru') {
                $guruRow = DB::table('guru')->where('nama_lengkap', 'LIKE', '%' . $user->name . '%')->first();
                if ($guruRow) $idGuru = $guruRow->id_guru;
            }

            $isMyClass = DB::table('kelas')
                ->where('id', $request->kelas_id)
                ->where('id_guru_wali', $idGuru)
                ->exists();

            if (!$isMyClass) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Anda tidak memiliki wewenang untuk membatalkan validasi kelas ini.'
                ], 403);
            }
        }

        $siswaIds = DB::table('anggota_kelas')->where('kelas_id', $request->kelas_id)->pluck('siswa_id');

        $updated = DB::table('rapor_sts')
            ->whereIn('siswa_id', $siswaIds)
            ->update([
                'status_validasi' => 'draft',
                'ttd_walikelas' => null,
                'updated_at' => now(),
            ]);

        return response()->json([
            'status' => 'success',
            'message' => "Berhasil membatalkan validasi seluruh rapor siswa kelas ({$updated} rapor dikembalikan ke Draft).",
        ]);
    }
}
