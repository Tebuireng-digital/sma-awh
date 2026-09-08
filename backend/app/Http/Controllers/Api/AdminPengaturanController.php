<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminPengaturanController extends Controller
{
    public function getPengaturan()
    {
        $profil = DB::table('profil_sekolah')->first();
        $pengaturan = DB::table('pengaturan_sekolah')->first();

        return response()->json([
            'status' => 'success',
            'profil' => $profil,
            'pengaturan' => $pengaturan,
        ]);
    }

    public function updatePengaturan(Request $request)
    {
        $request->validate([
            'toleransi_terlambat_menit' => 'nullable|integer|min:0',
        ]);

        $updateData = [];
        if ($request->has('toleransi_terlambat_menit')) $updateData['toleransi_terlambat_menit'] = $request->toleransi_terlambat_menit;
        $updateData['updated_at'] = now();
        DB::table('pengaturan_sekolah')->where('id', 1)->update($updateData);

        return response()->json([
            'status' => 'success',
            'message' => 'Pengaturan berhasil disimpan.',
            'pengaturan' => DB::table('pengaturan_sekolah')->first(),
        ]);
    }

    public function getSemester()
    {
        $sem = DB::table('semester')->where('is_active', true)->first();
        return response()->json([
            'status' => 'success',
            'semester' => $sem ? $sem->nama : 'Ganjil',
        ]);
    }

    public function toggleSemester(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'admin') {
            return response()->json([
                'status' => 'error',
                'message' => 'Hanya Administrator yang dapat mengubah semester.'
            ], 403);
        }

        $sem = DB::table('semester')->where('is_active', true)->first();
        $current = $sem ? $sem->nama : 'Ganjil';
        $newSemester = ($current === 'Ganjil') ? 'Genap' : 'Ganjil';

        if ($sem) {
            DB::table('semester')->where('id', $sem->id)->update([
                'nama' => $newSemester,
                'updated_at' => now(),
            ]);
        } else {
            DB::table('semester')->insert([
                'tahun_ajaran_id' => 1,
                'nama' => $newSemester,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Sinkronkan ke seluruh data rapor_sts
        DB::table('rapor_sts')->update([
            'semester' => $newSemester,
            'updated_at' => now(),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => "Semester berhasil diubah menjadi {$newSemester}.",
            'semester' => $newSemester,
        ]);
    }

    public function getTahunAjaran()
    {
        $ta = DB::table('tahun_ajaran')->where('is_active', true)->first();
        $list = DB::table('tahun_ajaran')->orderBy('id', 'desc')->get();
        return response()->json([
            'status' => 'success',
            'tahun_ajaran' => $ta ? $ta->nama : '2026/2027',
            'daftar_tahun_ajaran' => $list,
        ]);
    }

    public function updateTahunAjaran(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'admin') {
            return response()->json([
                'status' => 'error',
                'message' => 'Hanya Administrator yang dapat mengubah tahun pelajaran.'
            ], 403);
        }

        $request->validate([
            'tahun_ajaran' => 'required|string|max:50',
        ]);

        $newTa = trim($request->tahun_ajaran);

        DB::table('tahun_ajaran')->update(['is_active' => false]);
        $existing = DB::table('tahun_ajaran')->where('nama', $newTa)->first();
        if ($existing) {
            DB::table('tahun_ajaran')->where('id', $existing->id)->update([
                'is_active' => true,
                'updated_at' => now(),
            ]);
        } else {
            DB::table('tahun_ajaran')->insert([
                'nama' => $newTa,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Sinkronkan ke seluruh data rapor_sts
        DB::table('rapor_sts')->update([
            'tahun_ajaran' => $newTa,
            'updated_at' => now(),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => "Tahun pelajaran berhasil diubah menjadi {$newTa}.",
            'tahun_ajaran' => $newTa,
        ]);
    }
}

