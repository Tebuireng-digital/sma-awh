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
}
