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
        $sheet->setCellValue('A3', 'LAPORAN HASIL BELAJAR');

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

    /**
     * Generate lembar resmi PDF rapor STS siswa
     */
    public function generateRaporPdfBinary($siswa, $kelas, $rapor, $semester, $tahunAjaran, $namaKepsek)
    {
        $mapels = [
            'nilai_pai' => 'Pendidikan Agama Islam (PAI)',
            'nilai_ppkn' => 'Pendidikan Pancasila & Kewarganegaraan (PPKN)',
            'nilai_indo' => 'Bahasa Indonesia',
            'nilai_mtk' => 'Matematika',
            'nilai_inggris' => 'Bahasa Inggris',
            'nilai_seni' => 'Seni Budaya',
            'nilai_penjas' => 'Pendidikan Jasmani, Olahraga & Kesehatan',
            'nilai_informa' => 'Informatika',
            'nilai_sejarah' => 'Sejarah',
            'nilai_biologi' => 'IPA Biologi',
            'nilai_fisika' => 'Fisika',
            'nilai_kimia' => 'Kimia',
            'nilai_geografi' => 'IPS Geografi',
            'nilai_sosiologi' => 'Sosiologi',
            'nilai_ekonomi' => 'Ekonomi',
            'nilai_pkwu' => 'Prakarya & Kewirausahaan (PKWU)',
            'nilai_alquran' => 'Al-Qur\'an',
            'nilai_akhlaq' => 'Akhlaq',
            'nilai_fiqih' => 'Fiqih',
            'nilai_nahwu' => 'Nahwu Shorof',
            'nilai_aswaja' => 'Ke-Aswaja-an'
        ];

        $kktp = $rapor ? (int)$rapor->kktp : 75;
        $jumlah = $rapor ? (int)$rapor->jumlah : 0;
        $rataRata = $rapor ? number_format((float)$rapor->rata_rata, 2) : '0.00';
        $catatan = $rapor && !empty($rapor->catatan_wali_kelas) ? htmlspecialchars($rapor->catatan_wali_kelas) : 'Pertahankan prestasi belajar dan tingkatkan kedisiplinan beribadah.';
        $statusValidasi = $rapor ? ($rapor->status_validasi ?? 'draft') : 'draft';
        $isApproved = in_array($statusValidasi, ['approved_by_walikelas', 'approved_by_kepsek']);

        $rowsHtml = '';
        $no = 1;
        foreach ($mapels as $key => $name) {
            $nilai = $rapor ? (int)($rapor->{$key} ?? 0) : 0;
            $terbilang = $this->terbilang($nilai);
            $rowsHtml .= "<tr>
                <td style=\"text-align: center;\">{$no}</td>
                <td>" . htmlspecialchars($name) . "</td>
                <td style=\"text-align: center;\">{$kktp}</td>
                <td style=\"text-align: center; font-weight: bold;\">{$nilai}</td>
                <td style=\"text-align: center;\">{$terbilang}</td>
            </tr>";
            $no++;
        }

        // Extra mapels if any
        $extraScores = json_decode($rapor ? ($rapor->nilai_tambahan ?? '{}') : '{}', true) ?: [];
        foreach ($extraScores as $ext) {
            $nilai = (int)($ext['nilai'] ?? 0);
            $namaMapel = htmlspecialchars($ext['nama_mapel'] ?? "Mata Pelajaran {$no}");
            $terbilang = $this->terbilang($nilai);
            $rowsHtml .= "<tr>
                <td style=\"text-align: center;\">{$no}</td>
                <td>{$namaMapel}</td>
                <td style=\"text-align: center;\">{$kktp}</td>
                <td style=\"text-align: center; font-weight: bold;\">{$nilai}</td>
                <td style=\"text-align: center;\">{$terbilang}</td>
            </tr>";
            $no++;
        }

        $namaSiswa = htmlspecialchars($siswa->nama);
        $nis = htmlspecialchars($siswa->nis);
        $nisn = htmlspecialchars($siswa->nisn ?: '-');
        $namaKelas = htmlspecialchars($kelas->nama_kelas ?? '-');
        $namaWali = htmlspecialchars($kelas->nama_wali ?? 'Wali Kelas');
        $tanggalCetak = date('d F Y');

        // Logo sekolah di atas kop surat
        $logoPath = public_path('logo.png');
        if (!file_exists($logoPath) && file_exists(base_path('../frontend/public/logo.png'))) {
            $logoPath = base_path('../frontend/public/logo.png');
        }
        $logoHtml = '';
        if (file_exists($logoPath)) {
            $logoData = base64_encode(file_get_contents($logoPath));
            $logoHtml = '<div style="margin-bottom: 3px;"><img src="data:image/png;base64,' . $logoData . '" style="width: 48px; height: auto;" alt="Logo SMA AWH"></div>';
        }

        $html = <<<HTML
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Hasil Belajar - {$namaSiswa}</title>
    <style>
        @page {
            margin: 0.9cm 1.5cm 0.9cm 1.5cm;
        }
        body {
            font-family: Helvetica, Arial, sans-serif;
            font-size: 8.5pt;
            color: #111827;
            line-height: 1.25;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 5px;
            margin-bottom: 8px;
        }
        .header h3 {
            margin: 0;
            font-size: 10.5pt;
            font-weight: bold;
            color: #15803d;
            letter-spacing: 0.5px;
        }
        .header h2 {
            margin: 2px 0;
            font-size: 13pt;
            font-weight: 800;
            color: #0f172a;
            letter-spacing: 0.5px;
        }
        .header p {
            margin: 1px 0;
            font-size: 8pt;
            color: #475569;
        }
        .title-doc {
            text-align: center;
            margin: 7px 0;
        }
        .title-doc h4 {
            margin: 0;
            font-size: 10pt;
            text-decoration: underline;
            font-weight: bold;
            text-transform: uppercase;
        }
        .info-table {
            width: 100%;
            margin-bottom: 8px;
            font-size: 8.5pt;
        }
        .info-table td {
            padding: 1.5px 0;
            vertical-align: top;
        }
        .grade-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 8px;
            font-size: 8pt;
        }
        .grade-table th, .grade-table td {
            border: 0.75px solid #334155;
            padding: 3.5px 5px;
        }
        .grade-table th {
            background-color: #f1f5f9;
            font-weight: bold;
            text-align: center;
            font-size: 8pt;
        }
        .summary-row td {
            font-weight: bold;
            background-color: #f8fafc;
        }
        .catatan-box {
            border: 0.75px solid #334155;
            padding: 5px 8px;
            margin-bottom: 10px;
            font-size: 8pt;
            background-color: #fafafa;
        }
        .signatures {
            width: 100%;
            margin-top: 6px;
            font-size: 8.5pt;
        }
        .signatures td {
            text-align: center;
            vertical-align: top;
            padding: 2px;
        }
    </style>
</head>
<body>
    <div class="header">
        {$logoHtml}
        <h3>YAYASAN HASYIM ASY'ARI</h3>
        <h2>SMA KH. A. WAHID HASYIM TEBUIRENG</h2>
        <p>NSS: 20540007 • NPSN: 20540007 • Terakreditasi "A" (Unggul)</p>
        <p>Jl. Irian Jaya, Cukir, Kec. Diwek, Kabupaten Jombang, Jawa Timur 61471</p>
    </div>

    <div class="title-doc">
        <h4>LAPORAN HASIL BELAJAR</h4>
    </div>

    <table class="info-table">
        <tr>
            <td style="width: 18%;">Nama Peserta Didik</td>
            <td style="width: 2%;">:</td>
            <td style="width: 40%; font-weight: bold;">{$namaSiswa}</td>
            <td style="width: 15%;">Kelas</td>
            <td style="width: 2%;">:</td>
            <td style="width: 23%; font-weight: bold;">{$namaKelas}</td>
        </tr>
        <tr>
            <td>Nomor Induk / NISN</td>
            <td>:</td>
            <td>{$nis} / {$nisn}</td>
            <td>Semester</td>
            <td>:</td>
            <td>{$semester}</td>
        </tr>
        <tr>
            <td>Sekolah</td>
            <td>:</td>
            <td>SMA KH. A. Wahid Hasyim</td>
            <td>Tahun Pelajaran</td>
            <td>:</td>
            <td>{$tahunAjaran}</td>
        </tr>
    </table>

    <table class="grade-table">
        <thead>
            <tr>
                <th style="width: 5%;">NO</th>
                <th style="width: 45%;">MATA PELAJARAN</th>
                <th style="width: 10%;">KKTP</th>
                <th style="width: 14%;">NILAI ANGKA</th>
                <th style="width: 26%;">HURUF / TERBILANG</th>
            </tr>
        </thead>
        <tbody>
            {$rowsHtml}
            <tr class="summary-row">
                <td colspan="3" style="text-align: center;">JUMLAH</td>
                <td style="text-align: center;">{$jumlah}</td>
                <td></td>
            </tr>
            <tr class="summary-row">
                <td colspan="3" style="text-align: center;">RATA-RATA</td>
                <td style="text-align: center;">{$rataRata}</td>
                <td></td>
            </tr>
        </tbody>
    </table>

    <div class="catatan-box">
        <strong>Catatan Wali Kelas:</strong><br>
        <span style="font-style: italic;">{$catatan}</span>
    </div>

    <table class="signatures">
        <tr>
            <td style="width: 50%;">
                Mengetahui,<br>
                Orang Tua / Wali Santri<br><br><br><br>
                <strong>( ............................................ )</strong>
            </td>
            <td style="width: 50%;">
                Jombang, {$tanggalCetak}<br>
                Wali Kelas {$namaKelas}<br><br><br><br>
                <strong><u>{$namaWali}</u></strong>
            </td>
        </tr>
        <tr>
            <td colspan="2" style="padding-top: 15px;">
                Mengetahui,<br>
                Kepala SMA KH. A. Wahid Hasyim Tebuireng<br><br><br><br>
                <strong><u>{$namaKepsek}</u></strong>
            </td>
        </tr>
    </table>
</body>
</html>
HTML;

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadHTML($html);
        $pdf->setPaper('a4', 'portrait');
        return $pdf->output();
    }

    /**
     * Download Rapor PDF Tunggal untuk Siswa
     */
    public function exportPdf(Request $request, $siswa_id)
    {
        $siswa = DB::table('siswa as s')
            ->leftJoin('anggota_kelas as ak', 's.id', '=', 'ak.siswa_id')
            ->leftJoin('kelas as k', 'ak.kelas_id', '=', 'k.id')
            ->leftJoin('guru as g', 'k.id_guru_wali', '=', 'g.id_guru')
            ->select('s.id as siswa_id', 's.nama', 's.nis', 's.nisn', 'k.nama_kelas', 'k.tingkat', 'g.nama_lengkap as nama_wali')
            ->where('s.id', $siswa_id)
            ->first();

        if (!$siswa) {
            return response()->json(['status' => 'error', 'message' => 'Siswa tidak ditemukan.'], 404);
        }

        $activeSemRow = DB::table('semester')->where('is_active', true)->first();
        $activeTaRow = DB::table('tahun_ajaran')->where('is_active', true)->first();
        $semester = $request->get('semester', $activeSemRow ? $activeSemRow->nama : 'Ganjil');
        $tahunAjaran = $request->get('tahun_ajaran', $activeTaRow ? $activeTaRow->nama : '2026/2027');
        $altTa = str_contains($tahunAjaran, '/') ? str_replace('/', '-', $tahunAjaran) : str_replace('-', '/', $tahunAjaran);

        $rapor = DB::table('rapor_sts')
            ->where('siswa_id', $siswa_id)
            ->whereIn('tahun_ajaran', [$tahunAjaran, $altTa])
            ->where('semester', $semester)
            ->first();

        // Validasi Akses: Santri / Wali Santri hanya dapat mengakses jika rapor telah divalidasi oleh Wali Kelas!
        $user = $request->user();
        if ($user) {
            $userRoles = method_exists($user, 'getAllRolesAttribute') ? $user->all_roles : [$user->role];
            $isStudentOrParent = in_array('siswa', $userRoles) || in_array('wali_santri', $userRoles);
            if ($isStudentOrParent) {
                if ($user->id_siswa && (int)$user->id_siswa !== (int)$siswa_id) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Anda tidak memiliki hak akses untuk rapor santri lain.'
                    ], 403);
                }
                if (!$rapor || !in_array($rapor->status_validasi, ['approved_by_walikelas', 'approved_by_kepsek'])) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Rapor STS belum divalidasi oleh Wali Kelas. Rapor resmi hanya dapat diakses setelah divalidasi.'
                    ], 403);
                }
            }
        }

        $profilSekolah = DB::table('profil_sekolah')->first();
        $namaKepsek = $profilSekolah ? $profilSekolah->kepala_sekolah : 'NIKMATURROHMAH, M.Pd.';

        $fakeKelas = (object)[
            'nama_kelas' => $siswa->nama_kelas ?? '-',
            'nama_wali' => $siswa->nama_wali ?? '-',
        ];

        $pdfBinary = $this->generateRaporPdfBinary($siswa, $fakeKelas, $rapor, $semester, $tahunAjaran, $namaKepsek);

        $safeNama = preg_replace('/[^A-Za-z0-9_]/', '_', $siswa->nama);
        $pdfName = "Rapor_STS_{$siswa->nis}_{$safeNama}.pdf";

        return response($pdfBinary, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="' . $pdfName . '"',
        ]);
    }

    /**
     * Download Berkas ZIP berisi PDF Rapor Seluruh Siswa dalam 1 Kelas
     */
    public function exportZipKelas(Request $request)
    {
        $user = $request->user();
        $kelasId = $request->get('kelas_id');

        $isFullAccess = in_array($user->role, ['admin', 'kurikulum', 'kepala_sekolah', 'waka']);
        if (!$kelasId && !$isFullAccess && $user->id_guru) {
            $myKelas = DB::table('kelas')->where('id_guru_wali', $user->id_guru)->first();
            $kelasId = $myKelas ? $myKelas->id : null;
        }

        if (!$kelasId) {
            return response()->json(['status' => 'error', 'message' => 'Parameter kelas_id wajib diisi.'], 400);
        }

        $kelas = DB::table('kelas as k')
            ->leftJoin('guru as g', 'k.id_guru_wali', '=', 'g.id_guru')
            ->select('k.id', 'k.nama_kelas', 'k.tingkat', 'g.nama_lengkap as nama_wali')
            ->where('k.id', $kelasId)
            ->first();

        if (!$kelas) {
            return response()->json(['status' => 'error', 'message' => 'Kelas tidak ditemukan.'], 404);
        }

        $activeSemRow = DB::table('semester')->where('is_active', true)->first();
        $activeTaRow = DB::table('tahun_ajaran')->where('is_active', true)->first();
        $semester = $request->get('semester', $activeSemRow ? $activeSemRow->nama : 'Ganjil');
        $tahunAjaran = $request->get('tahun_ajaran', $activeTaRow ? $activeTaRow->nama : '2026/2027');
        $altTa = str_contains($tahunAjaran, '/') ? str_replace('/', '-', $tahunAjaran) : str_replace('-', '/', $tahunAjaran);

        $siswaList = DB::table('siswa as s')
            ->join('anggota_kelas as ak', 's.id', '=', 'ak.siswa_id')
            ->where('ak.kelas_id', $kelasId)
            ->select('s.id as siswa_id', 's.nama', 's.nis', 's.nisn', 's.jenis_kelamin')
            ->orderBy('s.nama', 'asc')
            ->get();

        if ($siswaList->isEmpty()) {
            return response()->json(['status' => 'error', 'message' => 'Tidak ada siswa di kelas ini.'], 404);
        }

        $raporRows = DB::table('rapor_sts')
            ->whereIn('siswa_id', $siswaList->pluck('siswa_id'))
            ->whereIn('tahun_ajaran', [$tahunAjaran, $altTa])
            ->where('semester', $semester)
            ->get()
            ->keyBy('siswa_id');

        $profilSekolah = DB::table('profil_sekolah')->first();
        $namaKepsek = $profilSekolah ? $profilSekolah->kepala_sekolah : 'NIKMATURROHMAH, M.Pd.';

        $zip = new \ZipArchive();
        $tmpFile = tempnam(sys_get_temp_dir(), 'rapor_zip_');

        if ($zip->open($tmpFile, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) !== true) {
            return response()->json(['status' => 'error', 'message' => 'Gagal membuat arsip ZIP di server.'], 500);
        }

        foreach ($siswaList as $idx => $s) {
            $r = $raporRows[$s->siswa_id] ?? null;
            $pdfContent = $this->generateRaporPdfBinary($s, $kelas, $r, $semester, $tahunAjaran, $namaKepsek);

            $safeNama = preg_replace('/[^A-Za-z0-9_]/', '_', $s->nama);
            $fileName = sprintf("%02d_%s_%s_Rapor_STS.pdf", $idx + 1, $s->nis, $safeNama);
            $zip->addFromString($fileName, $pdfContent);
        }

        $zip->close();

        $cleanKelasName = str_replace(['/', ' '], '_', $kelas->nama_kelas);
        $cleanTa = str_replace(['/', ' '], '-', $tahunAjaran);
        $zipDownloadName = "Rapor_STS_Kelas_{$cleanKelasName}_{$semester}_{$cleanTa}.zip";

        return response()->download($tmpFile, $zipDownloadName, [
            'Content-Type' => 'application/zip',
        ])->deleteFileAfterSend(true);
    }

    /**
     * Download Berkas ZIP Seluruh Kelas di Sekolah (Arsip Massal PDF)
     */
    public function exportZipAll(Request $request)
    {
        $user = $request->user();
        if (!in_array($user->role, ['admin', 'kurikulum', 'kepala_sekolah', 'waka'])) {
            return response()->json(['status' => 'error', 'message' => 'Hanya pimpinan dan Administrator yang dapat mengunduh seluruh rapor sekolah.'], 403);
        }

        $activeSemRow = DB::table('semester')->where('is_active', true)->first();
        $activeTaRow = DB::table('tahun_ajaran')->where('is_active', true)->first();
        $semester = $request->get('semester', $activeSemRow ? $activeSemRow->nama : 'Ganjil');
        $tahunAjaran = $request->get('tahun_ajaran', $activeTaRow ? $activeTaRow->nama : '2026/2027');
        $altTa = str_contains($tahunAjaran, '/') ? str_replace('/', '-', $tahunAjaran) : str_replace('-', '/', $tahunAjaran);

        $allKelas = DB::table('kelas as k')
            ->leftJoin('guru as g', 'k.id_guru_wali', '=', 'g.id_guru')
            ->select('k.id', 'k.nama_kelas', 'k.tingkat', 'g.nama_lengkap as nama_wali')
            ->orderBy('k.nama_kelas')
            ->get();

        $profilSekolah = DB::table('profil_sekolah')->first();
        $namaKepsek = $profilSekolah ? $profilSekolah->kepala_sekolah : 'NIKMATURROHMAH, M.Pd.';

        $zip = new \ZipArchive();
        $tmpFile = tempnam(sys_get_temp_dir(), 'rapor_all_zip_');

        if ($zip->open($tmpFile, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) !== true) {
            return response()->json(['status' => 'error', 'message' => 'Gagal membuat file ZIP di server.'], 500);
        }

        foreach ($allKelas as $kelas) {
            $siswaList = DB::table('siswa as s')
                ->join('anggota_kelas as ak', 's.id', '=', 'ak.siswa_id')
                ->where('ak.kelas_id', $kelas->id)
                ->select('s.id as siswa_id', 's.nama', 's.nis', 's.nisn', 's.jenis_kelamin')
                ->orderBy('s.nama', 'asc')
                ->get();

            if ($siswaList->isEmpty()) continue;

            $raporRows = DB::table('rapor_sts')
                ->whereIn('siswa_id', $siswaList->pluck('siswa_id'))
                ->whereIn('tahun_ajaran', [$tahunAjaran, $altTa])
                ->where('semester', $semester)
                ->get()
                ->keyBy('siswa_id');

            $cleanKelas = str_replace(['/', ' '], '_', $kelas->nama_kelas);

            foreach ($siswaList as $idx => $s) {
                $r = $raporRows[$s->siswa_id] ?? null;
                $pdfContent = $this->generateRaporPdfBinary($s, $kelas, $r, $semester, $tahunAjaran, $namaKepsek);

                $safeNama = preg_replace('/[^A-Za-z0-9_]/', '_', $s->nama);
                $fileName = sprintf("Kelas_%s/%02d_%s_%s_Rapor_STS.pdf", $cleanKelas, $idx + 1, $s->nis, $safeNama);
                $zip->addFromString($fileName, $pdfContent);
            }
        }

        $zip->close();

        $cleanTa = str_replace(['/', ' '], '-', $tahunAjaran);
        $zipDownloadName = "Rapor_STS_Semua_Kelas_{$semester}_{$cleanTa}.zip";

        return response()->download($tmpFile, $zipDownloadName, [
            'Content-Type' => 'application/zip',
        ])->deleteFileAfterSend(true);
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

        $activeSemRow = DB::table('semester')->where('is_active', true)->first();
        $activeTaRow = DB::table('tahun_ajaran')->where('is_active', true)->first();
        $targetSemester = $request->get('semester', $activeSemRow ? $activeSemRow->nama : 'Ganjil');
        $targetTa = $request->get('tahun_ajaran', $activeTaRow ? $activeTaRow->nama : '2026/2027');
        $altTa = str_contains($targetTa, '/') ? str_replace('/', '-', $targetTa) : str_replace('-', '/', $targetTa);

        $raporRows = DB::table('rapor_sts')
            ->whereIn('siswa_id', $siswaList->pluck('siswa_id'))
            ->whereIn('tahun_ajaran', [$targetTa, $altTa])
            ->where('semester', $targetSemester)
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
                'index' => $idx + 1,
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
                'is_extra' => $isExtra,
            ];
        }

        $rataRata = $totalTerisi > 0 ? round($sumNilai / $totalTerisi, 1) : 0;
        if ($totalTerisi === 0) {
            $minNilai = 0;
        }

        $statsData = [
            'total_siswa' => $totalSiswa,
            'total_terisi' => $totalTerisi,
            'total_belum_terisi' => $totalSiswa - $totalTerisi,
            'rata_rata' => $rataRata,
            'tertinggi' => $maxNilai,
            'terendah' => $minNilai,
            'total_tuntas' => $totalTuntas,
            'total_belum_tuntas' => $totalBelumTuntas,
        ];

        return response()->json([
            'status' => 'success',
            'kelas' => $kelas,
            'mapel_key' => $mapelKey,
            'semester' => $targetSemester,
            'tahun_ajaran' => $targetTa,
            'stats' => $statsData,
            'statistik' => $statsData,
            'grades' => $items,
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

        $kelasId = $request->kelas_id;
        $mapelKey = $request->mapel_key;

        $allKeys = [
            'nilai_pai', 'nilai_ppkn', 'nilai_indo', 'nilai_mtk', 'nilai_inggris',
            'nilai_seni', 'nilai_penjas', 'nilai_informa', 'nilai_sejarah', 'nilai_biologi',
            'nilai_fisika', 'nilai_kimia', 'nilai_geografi', 'nilai_sosiologi', 'nilai_ekonomi',
            'nilai_pkwu', 'nilai_alquran', 'nilai_akhlaq', 'nilai_fiqih', 'nilai_nahwu', 'nilai_aswaja'
        ];

        $isExtra = str_starts_with($mapelKey, 'mapel_');
        $extraMapelId = $isExtra ? (int)str_replace('mapel_', '', $mapelKey) : null;
        $extraMapelObj = null;

        if ($isExtra) {
            $extraMapelObj = DB::table('mata_pelajaran')->where('id', $extraMapelId)->first();
            if (!$extraMapelObj) {
                return response()->json(['status' => 'error', 'message' => 'Mata pelajaran tambahan tidak valid.'], 404);
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
        $activeTaRow = DB::table('tahun_ajaran')->where('is_active', true)->first();
        $targetSemester = $request->get('semester', $activeSemRow ? $activeSemRow->nama : 'Ganjil');
        $targetTa = $request->get('tahun_ajaran', $activeTaRow ? $activeTaRow->nama : '2026/2027');
        $altTa = str_contains($targetTa, '/') ? str_replace('/', '-', $targetTa) : str_replace('-', '/', $targetTa);

        DB::beginTransaction();
        try {
            $count = 0;
            foreach ($request->grades as $item) {
                $siswaId = $item['siswa_id'];
                $nilaiBaru = intval($item['nilai']);

                $existing = DB::table('rapor_sts')
                    ->where('siswa_id', $siswaId)
                    ->whereIn('tahun_ajaran', [$targetTa, $altTa])
                    ->where('semester', $targetSemester)
                    ->first();

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
                        'tahun_ajaran' => $targetTa,
                        'semester' => $targetSemester,
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

        $activeSemRow = DB::table('semester')->where('is_active', true)->first();
        $currentSemester = $request->get('semester', $activeSemRow ? $activeSemRow->nama : 'Ganjil');

        $activeTaRow = DB::table('tahun_ajaran')->where('is_active', true)->first();
        $currentTahunAjaran = $request->get('tahun_ajaran', $activeTaRow ? $activeTaRow->nama : '2026/2027');
        $altTa = str_contains($currentTahunAjaran, '/') ? str_replace('/', '-', $currentTahunAjaran) : str_replace('-', '/', $currentTahunAjaran);

        $raporRows = DB::table('rapor_sts')
            ->whereIn('siswa_id', $siswaList->pluck('siswa_id'))
            ->whereIn('tahun_ajaran', [$currentTahunAjaran, $altTa])
            ->where('semester', $currentSemester)
            ->get()
            ->keyBy('siswa_id');

        $totalSiswa = count($siswaList);
        $totalDivalidasi = 0;
        $totalDraft = 0;
        $sumRataRata = 0;

        // Cek permohonan pembatalan validasi yang berstatus pending untuk kelas ini
        $pendingRequests = DB::table('rapor_pembatalan_validasi')
            ->where('kelas_id', $kelasId)
            ->whereIn('tahun_ajaran', [$currentTahunAjaran, $altTa])
            ->where('semester', $currentSemester)
            ->where('status', 'pending')
            ->get();

        $hasClassPending = $pendingRequests->contains(function ($item) {
            return is_null($item->siswa_id);
        });
        $classPendingReason = $hasClassPending ? $pendingRequests->firstWhere('siswa_id', null)->alasan : null;
        $studentPendingMap = $pendingRequests->whereNotNull('siswa_id')->keyBy('siswa_id');

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

            $isPendingUnvalidation = $hasClassPending || isset($studentPendingMap[$s->siswa_id]);
            $pendingReason = $hasClassPending 
                ? $classPendingReason 
                : ($studentPendingMap[$s->siswa_id]->alasan ?? null);

            $students[] = [
                'index' => $idx + 1,
                'siswa_id' => $s->siswa_id,
                'nama' => $s->nama,
                'nis' => $s->nis,
                'nisn' => $s->nisn,
                'jenis_kelamin' => $s->jenis_kelamin,
                'status_validasi' => $statusVal,
                'has_pending_unvalidation' => $isPendingUnvalidation,
                'pending_unvalidation_alasan' => $pendingReason,
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
                ] : null,
            ];
        }

        $avgClass = $totalSiswa > 0 ? round($sumRataRata / $totalSiswa, 2) : 0;

        // Ambil daftar kelas untuk dropdown
        $daftarKelas = DB::table('kelas as k')
            ->leftJoin('guru as g', 'k.id_guru_wali', '=', 'g.id_guru')
            ->select('k.id', 'k.nama_kelas', 'k.tingkat', 'k.jumlah_siswa', 'g.nama_lengkap as nama_wali')
            ->orderBy('k.nama_kelas')
            ->get();

        return response()->json([
            'status' => 'success',
            'is_wali_of_this_class' => $isWaliOfThisClass,
            'is_full_access' => $isFullAccess,
            'kelas' => $kelas,
            'semester' => $currentSemester,
            'tahun_ajaran' => $currentTahunAjaran,
            'daftar_kelas' => $daftarKelas,
            'summary' => [
                'total_siswa' => $totalSiswa,
                'total_divalidasi' => $totalDivalidasi,
                'total_draft' => $totalDraft,
                'rata_rata_kelas' => $avgClass,
                'persentase_validasi' => $totalSiswa > 0 ? round(($totalDivalidasi / $totalSiswa) * 100, 1) : 0,
                'has_class_pending_unvalidation' => $hasClassPending,
                'class_pending_unvalidation_alasan' => $classPendingReason,
                'total_pending_unvalidation' => $pendingRequests->count(),
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

        $activeSemRow = DB::table('semester')->where('is_active', true)->first();
        $currentSemester = $request->get('semester', $activeSemRow ? $activeSemRow->nama : 'Ganjil');
        $activeTaRow = DB::table('tahun_ajaran')->where('is_active', true)->first();
        $currentTahunAjaran = $request->get('tahun_ajaran', $activeTaRow ? $activeTaRow->nama : '2026/2027');
        $altTa = str_contains($currentTahunAjaran, '/') ? str_replace('/', '-', $currentTahunAjaran) : str_replace('-', '/', $currentTahunAjaran);

        $rapor = DB::table('rapor_sts')
            ->where('siswa_id', $siswa_id)
            ->whereIn('tahun_ajaran', [$currentTahunAjaran, $altTa])
            ->where('semester', $currentSemester)
            ->first();

        if (!$rapor) {
            DB::table('rapor_sts')->insert([
                'siswa_id' => $siswa_id,
                'tahun_ajaran' => $currentTahunAjaran,
                'semester' => $currentSemester,
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

        $activeSemRow = DB::table('semester')->where('is_active', true)->first();
        $currentSemester = $request->get('semester', $activeSemRow ? $activeSemRow->nama : 'Ganjil');
        $activeTaRow = DB::table('tahun_ajaran')->where('is_active', true)->first();
        $currentTahunAjaran = $request->get('tahun_ajaran', $activeTaRow ? $activeTaRow->nama : '2026/2027');
        $altTa = str_contains($currentTahunAjaran, '/') ? str_replace('/', '-', $currentTahunAjaran) : str_replace('-', '/', $currentTahunAjaran);

        $siswaIds = DB::table('anggota_kelas')->where('kelas_id', $request->kelas_id)->pluck('siswa_id');

        $existingSiswaIds = DB::table('rapor_sts')
            ->whereIn('siswa_id', $siswaIds)
            ->whereIn('tahun_ajaran', [$currentTahunAjaran, $altTa])
            ->where('semester', $currentSemester)
            ->pluck('siswa_id')
            ->toArray();

        $updated = 0;
        if (!empty($existingSiswaIds)) {
            $updated += DB::table('rapor_sts')
                ->whereIn('siswa_id', $existingSiswaIds)
                ->whereIn('tahun_ajaran', [$currentTahunAjaran, $altTa])
                ->where('semester', $currentSemester)
                ->update([
                    'status_validasi' => 'approved_by_walikelas',
                    'ttd_walikelas' => now(),
                    'updated_at' => now(),
                ]);
        }

        $missingSiswaIds = array_diff($siswaIds->toArray(), $existingSiswaIds);
        foreach ($missingSiswaIds as $mId) {
            DB::table('rapor_sts')->insert([
                'siswa_id' => $mId,
                'tahun_ajaran' => $currentTahunAjaran,
                'semester' => $currentSemester,
                'kktp' => 75,
                'status_validasi' => 'approved_by_walikelas',
                'ttd_walikelas' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $updated++;
        }

        return response()->json([
            'status' => 'success',
            'message' => "Berhasil memvalidasi seluruh rapor siswa kelas ({$updated} rapor divalidasi).",
        ]);
    }

    /**
     * Pengajuan Pembatalan Validasi Rapor oleh Wali Kelas (Wajib disetujui Admin)
     */
    public function requestCancelValidasi(Request $request)
    {
        $request->validate([
            'kelas_id' => 'required|exists:kelas,id',
            'siswa_id' => 'nullable|exists:siswa,id',
            'alasan' => 'required|string|min:5|max:1000',
        ], [
            'alasan.required' => 'Alasan pembatalan validasi wajib diisi.',
            'alasan.min' => 'Alasan pembatalan minimal 5 karakter.',
        ]);

        $user = $request->user();
        $isFullAccess = $user ? in_array($user->role, ['admin', 'kurikulum', 'kepala_sekolah', 'waka']) : false;

        $idGuru = $user ? $user->id_guru : null;
        if (!$idGuru && $user && $user->role === 'guru') {
            $guruRow = DB::table('guru')->where('nama_lengkap', 'LIKE', '%' . $user->name . '%')->first();
            if ($guruRow) $idGuru = $guruRow->id_guru;
        }

        if (!$isFullAccess) {
            $isMyClass = DB::table('kelas')
                ->where('id', $request->kelas_id)
                ->where('id_guru_wali', $idGuru)
                ->exists();

            if (!$isMyClass) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Anda tidak memiliki wewenang untuk mengajukan pembatalan validasi pada kelas ini.'
                ], 403);
            }
        }

        $activeSemRow = DB::table('semester')->where('is_active', true)->first();
        $activeTaRow = DB::table('tahun_ajaran')->where('is_active', true)->first();
        $semester = $request->get('semester', $activeSemRow ? $activeSemRow->nama : 'Ganjil');
        $tahunAjaran = $request->get('tahun_ajaran', $activeTaRow ? $activeTaRow->nama : '2026/2027');

        // Cek apakah sudah ada permohonan pending yang sama
        $queryExist = DB::table('rapor_pembatalan_validasi')
            ->where('kelas_id', $request->kelas_id)
            ->where('tahun_ajaran', $tahunAjaran)
            ->where('semester', $semester)
            ->where('status', 'pending');

        if ($request->siswa_id) {
            $queryExist->where('siswa_id', $request->siswa_id);
        } else {
            $queryExist->whereNull('siswa_id');
        }

        $alreadyPending = $queryExist->first();
        if ($alreadyPending) {
            return response()->json([
                'status' => 'error',
                'message' => 'Permohonan pembatalan validasi untuk data ini sudah diajukan sebelumnya dan sedang menunggu persetujuan Administrator.'
            ], 422);
        }

        $requestId = DB::table('rapor_pembatalan_validasi')->insertGetId([
            'kelas_id' => $request->kelas_id,
            'siswa_id' => $request->siswa_id ?: null,
            'id_guru_pemohon' => $idGuru,
            'tahun_ajaran' => $tahunAjaran,
            'semester' => $semester,
            'alasan' => $request->alasan,
            'status' => 'pending',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Permohonan pembatalan validasi berhasil diajukan. Menunggu verifikasi dan persetujuan Administrator.',
            'request_id' => $requestId,
        ], 201);
    }

    /**
     * Mengambil daftar Permohonan Pembatalan Validasi Rapor (Admin & Wali Kelas)
     */
    public function getUnvalidationRequests(Request $request)
    {
        $user = $request->user();
        $userRoles = method_exists($user, 'getAllRolesAttribute') ? $user->all_roles : [$user->role];
        $isAdmin = count(array_intersect($userRoles, ['admin', 'kepala_sekolah', 'waka', 'kurikulum'])) > 0;

        $query = DB::table('rapor_pembatalan_validasi as rpv')
            ->join('kelas as k', 'rpv.kelas_id', '=', 'k.id')
            ->leftJoin('siswa as s', 'rpv.siswa_id', '=', 's.id')
            ->leftJoin('guru as g', 'rpv.id_guru_pemohon', '=', 'g.id_guru')
            ->leftJoin('users as u', 'rpv.disetujui_oleh', '=', 'u.id')
            ->select(
                'rpv.*',
                'k.nama_kelas',
                'k.tingkat',
                's.nama as nama_siswa',
                's.nis as nis_siswa',
                'g.nama_lengkap as nama_wali_pemohon',
                'u.name as nama_admin_penyetuju'
            )
            ->orderBy('rpv.created_at', 'desc');

        if (!$isAdmin) {
            $idGuru = $user->id_guru;
            if (!$idGuru && $user->role === 'guru') {
                $guruRow = DB::table('guru')->where('nama_lengkap', 'LIKE', '%' . $user->name . '%')->first();
                if ($guruRow) $idGuru = $guruRow->id_guru;
            }
            $query->where('rpv.id_guru_pemohon', $idGuru);
        }

        if ($request->has('status') && !empty($request->status)) {
            $query->where('rpv.status', $request->status);
        }

        $requests = $query->get();
        $pendingCount = DB::table('rapor_pembatalan_validasi')->where('status', 'pending')->count();

        return response()->json([
            'status' => 'success',
            'pending_count' => $pendingCount,
            'data' => $requests,
        ]);
    }

    /**
     * Admin Menyetujui Pembatalan Validasi (Rapor kembali ke Draft)
     */
    public function approveUnvalidationRequest(Request $request, $id)
    {
        $user = $request->user();
        $userRoles = method_exists($user, 'getAllRolesAttribute') ? $user->all_roles : [$user->role];
        if (!count(array_intersect($userRoles, ['admin', 'kepala_sekolah']))) {
            return response()->json([
                'status' => 'error',
                'message' => 'Hanya Administrator atau Kepala Sekolah yang berwenang menyetujui pembatalan validasi rapor.'
            ], 403);
        }

        $reqRow = DB::table('rapor_pembatalan_validasi')->where('id', $id)->first();
        if (!$reqRow) {
            return response()->json(['status' => 'error', 'message' => 'Permohonan tidak ditemukan.'], 404);
        }

        if ($reqRow->status !== 'pending') {
            return response()->json([
                'status' => 'error',
                'message' => "Permohonan ini telah diproses sebelumnya dengan status {$reqRow->status}."
            ], 422);
        }

        $altTa = str_contains($reqRow->tahun_ajaran, '/') ? str_replace('/', '-', $reqRow->tahun_ajaran) : str_replace('-', '/', $reqRow->tahun_ajaran);

        // Ubah status rapor ke 'draft'
        $queryRapor = DB::table('rapor_sts')
            ->whereIn('tahun_ajaran', [$reqRow->tahun_ajaran, $altTa])
            ->where('semester', $reqRow->semester);

        if ($reqRow->siswa_id) {
            $queryRapor->where('siswa_id', $reqRow->siswa_id);
        } else {
            $siswaIds = DB::table('anggota_kelas')->where('kelas_id', $reqRow->kelas_id)->pluck('siswa_id');
            $queryRapor->whereIn('siswa_id', $siswaIds);
        }

        $updatedCount = $queryRapor->update([
            'status_validasi' => 'draft',
            'ttd_walikelas' => null,
            'updated_at' => now(),
        ]);

        DB::table('rapor_pembatalan_validasi')->where('id', $id)->update([
            'status' => 'approved',
            'catatan_admin' => $request->catatan_admin ?: 'Disetujui Administrator',
            'disetujui_oleh' => $user->id,
            'disetujui_pada' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => "Pembatalan validasi berhasil disetujui. {$updatedCount} rapor dikembalikan ke status Draft.",
        ]);
    }

    /**
     * Admin Menolak Pembatalan Validasi (Rapor tetap Validated)
     */
    public function rejectUnvalidationRequest(Request $request, $id)
    {
        $user = $request->user();
        $userRoles = method_exists($user, 'getAllRolesAttribute') ? $user->all_roles : [$user->role];
        if (!count(array_intersect($userRoles, ['admin', 'kepala_sekolah']))) {
            return response()->json([
                'status' => 'error',
                'message' => 'Hanya Administrator atau Kepala Sekolah yang berwenang menolak pembatalan validasi rapor.'
            ], 403);
        }

        $reqRow = DB::table('rapor_pembatalan_validasi')->where('id', $id)->first();
        if (!$reqRow) {
            return response()->json(['status' => 'error', 'message' => 'Permohonan tidak ditemukan.'], 404);
        }

        if ($reqRow->status !== 'pending') {
            return response()->json([
                'status' => 'error',
                'message' => "Permohonan ini telah diproses sebelumnya dengan status {$reqRow->status}."
            ], 422);
        }

        DB::table('rapor_pembatalan_validasi')->where('id', $id)->update([
            'status' => 'rejected',
            'catatan_admin' => $request->catatan_admin ?: 'Permohonan ditolak oleh Administrator',
            'disetujui_oleh' => $user->id,
            'disetujui_pada' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Permohonan pembatalan validasi berhasil ditolak. Status rapor tetap tervalidasi.',
        ]);
    }

    /**
     * Eksekusi langsung pembatalan validasi (Khusus hak akses Administrator)
     */
    public function cancelValidasiWaliKelas(Request $request, $siswa_id)
    {
        $user = $request->user();
        $userRoles = $user ? (method_exists($user, 'getAllRolesAttribute') ? $user->all_roles : [$user->role]) : [];
        $isAdmin = in_array('admin', $userRoles) || in_array('kepala_sekolah', $userRoles);

        if (!$isAdmin) {
            return response()->json([
                'status' => 'error',
                'requires_admin_approval' => true,
                'message' => 'Pembatalan validasi rapor oleh Wali Kelas harus diajukan dan disetujui oleh Administrator terlebih dahulu. Silakan gunakan tombol Ajukan Pembatalan Validasi.',
            ], 403);
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
            'message' => 'Validasi rapor berhasil dibatalkan oleh Administrator. Status rapor kembali menjadi Draft.',
        ]);
    }

    /**
     * Eksekusi langsung pembatalan validasi 1 kelas (Khusus hak akses Administrator)
     */
    public function bulkCancelValidasiWaliKelas(Request $request)
    {
        $request->validate([
            'kelas_id' => 'required|exists:kelas,id',
        ]);

        $user = $request->user();
        $userRoles = $user ? (method_exists($user, 'getAllRolesAttribute') ? $user->all_roles : [$user->role]) : [];
        $isAdmin = in_array('admin', $userRoles) || in_array('kepala_sekolah', $userRoles);

        if (!$isAdmin) {
            return response()->json([
                'status' => 'error',
                'requires_admin_approval' => true,
                'message' => 'Pembatalan validasi seluruh kelas oleh Wali Kelas harus diajukan dan disetujui oleh Administrator terlebih dahulu. Silakan gunakan tombol Ajukan Pembatalan Validasi.',
            ], 403);
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
            'message' => "Berhasil membatalkan validasi seluruh rapor siswa kelas ({$updated} rapor dikembalikan ke Draft oleh Administrator).",
        ]);
    }
}
