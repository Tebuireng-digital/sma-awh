<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class JurnalMengajarController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'presensi_guru_id' => 'required|integer',
            'bab_materi' => 'required|string|max:255',
            'catatan_kelas' => 'nullable|string',
            'tugas_mandiri' => 'nullable|string',
            'tp_id' => 'nullable|integer',
            'promes_id' => 'nullable|integer',
            'status_ketercapaian' => 'nullable|string|in:tercapai,tertunda,remedial',
        ]);

        $statusKetercapaian = $request->status_ketercapaian ?? 'tercapai';

        $existing = DB::table('jurnal_mengajar')->where('presensi_guru_id', $request->presensi_guru_id)->first();

        if ($existing) {
            DB::table('jurnal_mengajar')->where('id', $existing->id)->update([
                'tp_id' => $request->tp_id,
                'promes_id' => $request->promes_id,
                'bab_materi' => $request->bab_materi,
                'catatan_kelas' => $request->catatan_kelas,
                'tugas_mandiri' => $request->tugas_mandiri,
                'status_ketercapaian' => $statusKetercapaian,
                'is_submitted' => true,
                'updated_at' => now(),
            ]);
            $jurnalId = $existing->id;
        } else {
            $jurnalId = DB::table('jurnal_mengajar')->insertGetId([
                'presensi_guru_id' => $request->presensi_guru_id,
                'tp_id' => $request->tp_id,
                'promes_id' => $request->promes_id,
                'bab_materi' => $request->bab_materi,
                'catatan_kelas' => $request->catatan_kelas,
                'tugas_mandiri' => $request->tugas_mandiri,
                'status_ketercapaian' => $statusKetercapaian,
                'is_submitted' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Mark Promes as completed if status_ketercapaian == 'tercapai'
        if ($request->promes_id && $statusKetercapaian === 'tercapai') {
            DB::table('program_semester')->where('id', $request->promes_id)->update([
                'status_selesai' => true,
                'updated_at' => now(),
            ]);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Jurnal Mengajar berhasil disimpan & status Promes ter-update otomatis.',
            'jurnal_id' => $jurnalId,
        ]);
    }

    public function show($presensi_guru_id)
    {
        $jurnal = DB::table('jurnal_mengajar as jm')
            ->leftJoin('tujuan_pembelajaran as tp', 'jm.tp_id', '=', 'tp.id')
            ->select('jm.*', 'tp.kode_tp', 'tp.deskripsi_tp')
            ->where('jm.presensi_guru_id', $presensi_guru_id)
            ->first();

        return response()->json([
            'status' => 'success',
            'jurnal' => $jurnal,
        ]);
    }
}
