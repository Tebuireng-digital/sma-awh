<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\Guru;
use App\Models\Kelas;
use App\Models\Siswa;
use App\Models\User;

class AdminMasterController extends Controller
{
    // ==========================================
    // GURU CRUD
    // ==========================================
    public function indexGuru(Request $request)
    {
        $query = Guru::query();

        if ($request->has('search') && !empty($request->search)) {
            $s = $request->search;
            $query->where(function($q) use ($s) {
                $q->where('nama_lengkap', 'like', "%{$s}%")
                  ->orWhere('id_guru', 'like', "%{$s}%")
                  ->orWhere('no_hp', 'like', "%{$s}%");
            });
        }

        if ($request->has('status') && $request->status !== '') {
            $query->where('status_aktif', filter_var($request->status, FILTER_VALIDATE_BOOLEAN));
        }

        $guruList = $query->orderBy('id_guru', 'asc')->get();

        foreach ($guruList as $g) {
            $u = User::where('id_guru', $g->id_guru)->first();
            $g->additional_roles = $u && $u->additional_roles ? (is_array($u->additional_roles) ? $u->additional_roles : (json_decode($u->additional_roles, true) ?: [])) : [];
            $g->username = $u?->username;
        }

        return response()->json([
            'status' => 'success',
            'total' => count($guruList),
            'guru' => $guruList,
        ]);
    }

    public function storeGuru(Request $request)
    {
        $request->validate([
            'id_guru' => 'required|numeric|unique:guru,id_guru',
            'nama_lengkap' => 'required|string|max:255',
            'pendidikan_terakhir' => 'nullable|string|max:100',
            'no_hp' => 'nullable|string|max:20',
            'status_aktif' => 'boolean',
        ]);

        $guru = Guru::create([
            'id_guru' => $request->id_guru,
            'nama_lengkap' => $request->nama_lengkap,
            'pendidikan_terakhir' => $request->pendidikan_terakhir,
            'no_hp' => $request->no_hp,
            'status_aktif' => $request->has('status_aktif') ? (bool)$request->status_aktif : true,
        ]);

        // Auto-create user account if not exists
        $username = 'guru_' . $request->id_guru;
        $existingUser = User::where('username', $username)->first();

        $extraRoles = $request->has('additional_roles') ? array_values((array)$request->additional_roles) : [];

        if (!$existingUser) {
            User::create([
                'name' => $request->nama_lengkap,
                'username' => $username,
                'email' => $username . '@smaawh.sch.id',
                'password' => Hash::make('guru123'),
                'role' => 'guru',
                'additional_roles' => count($extraRoles) > 0 ? $extraRoles : null,
                'id_guru' => $request->id_guru,
                'no_hp' => $request->no_hp,
                'must_change_password' => true,
            ]);
        } else if (count($extraRoles) > 0) {
            $existingUser->update(['additional_roles' => $extraRoles]);
        }

        // Sinkronisasi otomatis ke Data Pegawai
        $existsPegawai = DB::table('pegawai')->where('nama_lengkap', $request->nama_lengkap)->first();
        if (!$existsPegawai) {
            DB::table('pegawai')->insert([
                'nama_lengkap' => $request->nama_lengkap,
                'jabatan' => 'Guru',
                'pendidikan' => $request->pendidikan_terakhir ?: 'S1',
                'no_hp' => $request->no_hp ?: null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Data Guru & akun user login berhasil ditambahkan serta tersinkron ke Kepegawaian.',
            'guru' => $guru,
        ], 201);
    }

    public function updateGuru(Request $request, $id)
    {
        $guru = Guru::findOrFail($id);

        $request->validate([
            'id_guru' => 'required|numeric|unique:guru,id_guru,' . $guru->id,
            'nama_lengkap' => 'required|string|max:255',
            'pendidikan_terakhir' => 'nullable|string|max:100',
            'no_hp' => 'nullable|string|max:20',
            'status_aktif' => 'boolean',
        ]);

        $oldIdGuru = $guru->id_guru;
        $oldNama = $guru->nama_lengkap;

        $guru->update([
            'id_guru' => $request->id_guru,
            'nama_lengkap' => $request->nama_lengkap,
            'pendidikan_terakhir' => $request->pendidikan_terakhir,
            'no_hp' => $request->no_hp,
            'status_aktif' => $request->has('status_aktif') ? (bool)$request->status_aktif : $guru->status_aktif,
        ]);

        // Update corresponding User account if exists
        $userUpdateData = [
            'id_guru' => $request->id_guru,
            'name' => $request->nama_lengkap,
            'no_hp' => $request->no_hp,
        ];
        if ($request->has('additional_roles')) {
            $userUpdateData['additional_roles'] = json_encode(array_values((array)$request->additional_roles));
        }

        User::where('id_guru', $oldIdGuru)->orWhere('id_guru', $request->id_guru)->update($userUpdateData);

        // Sinkronisasi otomatis ke Data Pegawai
        DB::table('pegawai')->where('nama_lengkap', $oldNama)->update([
            'nama_lengkap' => $request->nama_lengkap,
            'pendidikan' => $request->pendidikan_terakhir ?: 'S1',
            'no_hp' => $request->no_hp ?: null,
            'updated_at' => now(),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Data Guru berhasil diperbarui serta tersinkron ke Kepegawaian.',
            'guru' => $guru,
        ]);
    }

    public function destroyGuru($id)
    {
        $guru = Guru::findOrFail($id);
        
        // Delete related user account if exists
        User::where('id_guru', $guru->id_guru)->delete();
        
        $guru->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Data Guru berhasil dihapus.',
        ]);
    }

    // ==========================================
    // KELAS CRUD
    // ==========================================
    public function indexKelas(Request $request)
    {
        $kelases = DB::table('kelas as k')
            ->leftJoin('guru as g', 'k.id_guru_wali', '=', 'g.id_guru')
            ->select(
                'k.id',
                'k.nama_kelas',
                'k.tingkat',
                'k.id_guru_wali',
                'k.jumlah_siswa',
                'g.nama_lengkap as wali_kelas',
                'g.no_hp as no_hp_wali'
            )
            ->orderBy('k.tingkat', 'asc')
            ->orderBy('k.nama_kelas', 'asc')
            ->get();

        // Update total actual count of students for each class
        foreach ($kelases as $k) {
            $actualCount = DB::table('anggota_kelas')->where('kelas_id', $k->id)->count();
            if ($actualCount != $k->jumlah_siswa) {
                DB::table('kelas')->where('id', $k->id)->update(['jumlah_siswa' => $actualCount]);
                $k->jumlah_siswa = $actualCount;
            }
        }

        return response()->json([
            'status' => 'success',
            'total' => count($kelases),
            'kelas' => $kelases,
        ]);
    }

    public function storeKelas(Request $request)
    {
        $request->validate([
            'nama_kelas' => 'required|string|unique:kelas,nama_kelas',
            'tingkat' => 'required|string|in:X,XI,XII',
            'id_guru_wali' => 'nullable|numeric|exists:guru,id_guru',
        ]);

        $kelas = Kelas::create([
            'nama_kelas' => $request->nama_kelas,
            'tingkat' => $request->tingkat,
            'id_guru_wali' => $request->id_guru_wali ?: null,
            'jumlah_siswa' => 0,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Data Kelas berhasil ditambahkan.',
            'kelas' => $kelas,
        ], 201);
    }

    public function updateKelas(Request $request, $id)
    {
        $kelas = Kelas::findOrFail($id);

        $request->validate([
            'nama_kelas' => 'required|string|unique:kelas,nama_kelas,' . $kelas->id,
            'tingkat' => 'required|string|in:X,XI,XII',
            'id_guru_wali' => 'nullable|numeric|exists:guru,id_guru',
        ]);

        $kelas->update([
            'nama_kelas' => $request->nama_kelas,
            'tingkat' => $request->tingkat,
            'id_guru_wali' => $request->id_guru_wali ?: null,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Data Kelas berhasil diperbarui.',
            'kelas' => $kelas,
        ]);
    }

    public function destroyKelas($id)
    {
        $kelas = Kelas::findOrFail($id);
        $kelas->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Data Kelas berhasil dihapus.',
        ]);
    }

    // ==========================================
    // SISWA CRUD
    // ==========================================
    public function indexSiswa(Request $request)
    {
        $query = DB::table('siswa as s')
            ->leftJoin('anggota_kelas as ak', 's.id', '=', 'ak.siswa_id')
            ->leftJoin('kelas as k', 'ak.kelas_id', '=', 'k.id')
            ->select(
                's.id',
                's.nis',
                's.nama',
                's.jenis_kelamin',
                's.no_hp_ortu',
                's.status_aktif',
                'k.id as kelas_id',
                'k.nama_kelas',
                'ak.no_urut'
            );

        if ($request->has('kelas_id') && !empty($request->kelas_id)) {
            $query->where('ak.kelas_id', $request->kelas_id);
        }

        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('s.nama', 'like', "%{$search}%")
                  ->orWhere('s.nis', 'like', "%{$search}%")
                  ->orWhere('s.no_hp_ortu', 'like', "%{$search}%");
            });
        }

        $siswaList = $query->orderBy('k.nama_kelas', 'asc')
            ->orderBy('s.nama', 'asc')
            ->get();

        return response()->json([
            'status' => 'success',
            'total' => count($siswaList),
            'data' => $siswaList,
            'siswa' => $siswaList,
        ]);
    }

    public function storeSiswa(Request $request)
    {
        $request->validate([
            'nis' => 'required|string|unique:siswa,nis',
            'nama' => 'required|string|max:255',
            'jenis_kelamin' => 'required|string|in:L,P',
            'no_hp_ortu' => 'nullable|string|max:20',
            'kelas_id' => 'required|numeric|exists:kelas,id',
            'status_aktif' => 'boolean',
        ]);

        $siswa = Siswa::create([
            'nis' => $request->nis,
            'nama' => $request->nama,
            'jenis_kelamin' => $request->jenis_kelamin,
            'no_hp_ortu' => $request->no_hp_ortu,
            'status_aktif' => $request->has('status_aktif') ? (bool)$request->status_aktif : true,
        ]);

        // Get max no_urut in class
        $maxNoUrut = DB::table('anggota_kelas')->where('kelas_id', $request->kelas_id)->max('no_urut') ?? 0;

        DB::table('anggota_kelas')->insert([
            'kelas_id' => $request->kelas_id,
            'siswa_id' => $siswa->id,
            'no_urut' => $maxNoUrut + 1,
            'tahun_ajaran_id' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Update jumlah_siswa in kelas
        $count = DB::table('anggota_kelas')->where('kelas_id', $request->kelas_id)->count();
        DB::table('kelas')->where('id', $request->kelas_id)->update(['jumlah_siswa' => $count]);

        return response()->json([
            'status' => 'success',
            'message' => 'Data Siswa berhasil ditambahkan.',
            'siswa' => $siswa,
        ], 201);
    }

    public function updateSiswa(Request $request, $id)
    {
        $siswa = Siswa::findOrFail($id);

        $request->validate([
            'nis' => 'required|string|unique:siswa,nis,' . $siswa->id,
            'nama' => 'required|string|max:255',
            'jenis_kelamin' => 'required|string|in:L,P',
            'no_hp_ortu' => 'nullable|string|max:20',
            'kelas_id' => 'required|numeric|exists:kelas,id',
            'status_aktif' => 'boolean',
        ]);

        $siswa->update([
            'nis' => $request->nis,
            'nama' => $request->nama,
            'jenis_kelamin' => $request->jenis_kelamin,
            'no_hp_ortu' => $request->no_hp_ortu,
            'status_aktif' => $request->has('status_aktif') ? (bool)$request->status_aktif : $siswa->status_aktif,
        ]);

        // Update class membership
        $currentMembership = DB::table('anggota_kelas')->where('siswa_id', $siswa->id)->first();
        $oldKelasId = $currentMembership ? $currentMembership->kelas_id : null;

        if ($oldKelasId != $request->kelas_id) {
            $maxNoUrut = DB::table('anggota_kelas')->where('kelas_id', $request->kelas_id)->max('no_urut') ?? 0;

            if ($currentMembership) {
                DB::table('anggota_kelas')->where('siswa_id', $siswa->id)->update([
                    'kelas_id' => $request->kelas_id,
                    'no_urut' => $maxNoUrut + 1,
                    'updated_at' => now(),
                ]);
            } else {
                DB::table('anggota_kelas')->insert([
                    'kelas_id' => $request->kelas_id,
                    'siswa_id' => $siswa->id,
                    'no_urut' => $maxNoUrut + 1,
                    'tahun_ajaran_id' => 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            // Recalculate student counts for old and new class
            if ($oldKelasId) {
                $countOld = DB::table('anggota_kelas')->where('kelas_id', $oldKelasId)->count();
                DB::table('kelas')->where('id', $oldKelasId)->update(['jumlah_siswa' => $countOld]);
            }
            $countNew = DB::table('anggota_kelas')->where('kelas_id', $request->kelas_id)->count();
            DB::table('kelas')->where('id', $request->kelas_id)->update(['jumlah_siswa' => $countNew]);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Data Siswa berhasil diperbarui.',
            'siswa' => $siswa,
        ]);
    }

    public function destroySiswa($id)
    {
        $siswa = Siswa::findOrFail($id);
        
        $membership = DB::table('anggota_kelas')->where('siswa_id', $siswa->id)->first();
        $kelasId = $membership ? $membership->kelas_id : null;

        $siswa->delete(); // Cascade deletes anggota_kelas record

        if ($kelasId) {
            $count = DB::table('anggota_kelas')->where('kelas_id', $kelasId)->count();
            DB::table('kelas')->where('id', $kelasId)->update(['jumlah_siswa' => $count]);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Data Siswa berhasil dihapus.',
        ]);
    }

    public function resetPasswordSiswa(Request $request, $id)
    {
        $currentUser = $request->user();
        $allowedRoles = ['admin', 'kepala_sekolah', 'waka', 'kesiswaan', 'kepala_tu', 'tu'];
        $userRoles = $currentUser->all_roles ?: [$currentUser->role];
        $isAuthorized = count(array_intersect($allowedRoles, $userRoles)) > 0;

        if (!$isAuthorized) {
            return response()->json([
                'status' => 'error',
                'message' => 'Anda tidak memiliki hak akses untuk mereset kata sandi siswa.',
            ], 403);
        }

        $request->validate([
            'new_password' => 'required|string|min:6|confirmed',
        ], [
            'new_password.required' => 'Kata sandi baru wajib diisi.',
            'new_password.min' => 'Kata sandi baru minimal 6 karakter.',
            'new_password.confirmed' => 'Konfirmasi kata sandi baru tidak sesuai.',
        ]);

        $siswa = Siswa::findOrFail($id);

        $usernameCandidates = array_filter([
            $siswa->nisn,
            $siswa->nis,
            'siswa_' . $siswa->nis,
        ]);

        $user = User::where('id_siswa', $siswa->id)
            ->orWhere(function ($q) use ($usernameCandidates) {
                $q->where('role', 'siswa')
                  ->whereIn('username', $usernameCandidates);
            })
            ->first();

        if (!$user) {
            $user = User::create([
                'name' => $siswa->nama,
                'username' => $siswa->nisn ?: ('siswa_' . $siswa->nis),
                'email' => ($siswa->nisn ?: $siswa->nis) . '@siswa.smaawh.sch.id',
                'password' => Hash::make($request->new_password),
                'role' => 'siswa',
                'id_siswa' => $siswa->id,
                'must_change_password' => false,
            ]);
        } else {
            $user->password = Hash::make($request->new_password);
            $user->must_change_password = false;
            if (!$user->id_siswa) {
                $user->id_siswa = $siswa->id;
            }
            $user->save();
        }

        return response()->json([
            'status' => 'success',
            'message' => "Kata sandi untuk siswa {$siswa->nama} (NIS: {$siswa->nis}) berhasil diperbarui.",
        ]);
    }
}
