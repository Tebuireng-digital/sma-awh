<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AdminJadwalController extends Controller
{
    // ==========================================
    // MATA PELAJARAN CRUD
    // ==========================================
    public function indexMapel(Request $request)
    {
        $query = DB::table('mata_pelajaran');
        
        if ($request->has('search') && !empty($request->search)) {
            $s = $request->search;
            $query->where(function($q) use ($s) {
                $q->where('kode', 'like', "%{$s}%")
                  ->orWhere('nama_mapel', 'like', "%{$s}%");
            });
        }
        
        $mapelList = $query->orderBy('kode', 'asc')->get();
        
        return response()->json([
            'status' => 'success',
            'total' => count($mapelList),
            'mapel' => $mapelList,
        ]);
    }

    public function storeMapel(Request $request)
    {
        $request->validate([
            'kode' => 'required|string|unique:mata_pelajaran,kode',
            'nama_mapel' => 'required|string|max:255',
        ]);

        $id = DB::table('mata_pelajaran')->insertGetId([
            'kode' => $request->kode,
            'nama_mapel' => $request->nama_mapel,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Mata Pelajaran berhasil ditambahkan.',
            'mapel' => DB::table('mata_pelajaran')->where('id', $id)->first(),
        ], 201);
    }

    public function updateMapel(Request $request, $id)
    {
        $request->validate([
            'kode' => 'required|string|unique:mata_pelajaran,kode,' . $id,
            'nama_mapel' => 'required|string|max:255',
        ]);

        DB::table('mata_pelajaran')->where('id', $id)->update([
            'kode' => $request->kode,
            'nama_mapel' => $request->nama_mapel,
            'updated_at' => now(),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Mata Pelajaran berhasil diperbarui.',
            'mapel' => DB::table('mata_pelajaran')->where('id', $id)->first(),
        ]);
    }

    public function destroyMapel($id)
    {
        DB::table('mata_pelajaran')->where('id', $id)->delete();
        
        return response()->json([
            'status' => 'success',
            'message' => 'Mata Pelajaran berhasil dihapus.',
        ]);
    }

    // ==========================================
    // JADWAL PELAJARAN CRUD
    // ==========================================
    public function indexJadwal(Request $request)
    {
        $query = DB::table('jadwal_pelajaran as jp')
            ->join('kelas as k', 'jp.kelas_id', '=', 'k.id')
            ->join('mata_pelajaran as mp', 'jp.mapel_id', '=', 'mp.id')
            ->join('guru as g', 'jp.id_guru', '=', 'g.id_guru')
            ->select(
                'jp.id',
                'jp.kelas_id',
                'k.nama_kelas',
                'jp.mapel_id',
                'mp.nama_mapel',
                'jp.id_guru',
                'g.nama_lengkap as nama_guru',
                'jp.hari',
                'jp.jam_ke',
                'jp.jam_mulai',
                'jp.jam_selesai'
            );

        if ($request->has('kelas_id') && !empty($request->kelas_id)) {
            $query->where('jp.kelas_id', $request->kelas_id);
        }

        if ($request->has('hari') && !empty($request->hari)) {
            $query->where('jp.hari', $request->hari);
        }

        $jadwalList = $query->orderBy('jp.hari', 'asc')
            ->orderBy('jp.jam_ke', 'asc')
            ->orderBy('k.nama_kelas', 'asc')
            ->get();

        return response()->json([
            'status' => 'success',
            'total' => count($jadwalList),
            'jadwal' => $jadwalList,
        ]);
    }

    public function storeJadwal(Request $request)
    {
        $request->validate([
            'kelas_id' => 'required|numeric|exists:kelas,id',
            'mapel_id' => 'required|numeric|exists:mata_pelajaran,id',
            'id_guru' => 'required|numeric|exists:guru,id_guru',
            'hari' => 'required|string|in:Ahad,Senin,Selasa,Rabu,Kamis,Jumat,Sabtu,Minggu',
            'jam_ke' => 'required|integer|min:1|max:15',
            'jam_mulai' => 'required|date_format:H:i',
            'jam_selesai' => 'required|date_format:H:i|after:jam_mulai',
        ]);

        // Cek bentrok guru (apakah guru mengajar di tempat lain di hari dan jam ke yang sama)
        $bentrokGuru = DB::table('jadwal_pelajaran')
            ->where('id_guru', $request->id_guru)
            ->where('hari', $request->hari)
            ->where('jam_ke', $request->jam_ke)
            ->first();

        if ($bentrokGuru) {
            $kelasBentrok = DB::table('kelas')->where('id', $bentrokGuru->kelas_id)->value('nama_kelas');
            return response()->json([
                'status' => 'error',
                'message' => "Guru ini sudah memiliki jadwal mengajar di kelas {$kelasBentrok} pada hari {$request->hari} jam ke-{$request->jam_ke}.",
            ], 422);
        }

        // Cek bentrok kelas (apakah kelas sudah ada jadwal di hari dan jam ke tersebut)
        $bentrokKelas = DB::table('jadwal_pelajaran')
            ->where('kelas_id', $request->kelas_id)
            ->where('hari', $request->hari)
            ->where('jam_ke', $request->jam_ke)
            ->first();
            
        if ($bentrokKelas) {
            return response()->json([
                'status' => 'error',
                'message' => "Kelas ini sudah memiliki jadwal pelajaran pada hari {$request->hari} jam ke-{$request->jam_ke}.",
            ], 422);
        }

        $id = DB::table('jadwal_pelajaran')->insertGetId([
            'kelas_id' => $request->kelas_id,
            'mapel_id' => $request->mapel_id,
            'id_guru' => $request->id_guru,
            'hari' => $request->hari,
            'jam_ke' => $request->jam_ke,
            'jam_mulai' => $request->jam_mulai,
            'jam_selesai' => $request->jam_selesai,
            'semester_id' => 1, // Default aktif
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Jadwal pelajaran berhasil ditambahkan.',
        ], 201);
    }

    public function updateJadwal(Request $request, $id)
    {
        $request->validate([
            'kelas_id' => 'required|numeric|exists:kelas,id',
            'mapel_id' => 'required|numeric|exists:mata_pelajaran,id',
            'id_guru' => 'required|numeric|exists:guru,id_guru',
            'hari' => 'required|string|in:Ahad,Senin,Selasa,Rabu,Kamis,Jumat,Sabtu,Minggu',
            'jam_ke' => 'required|integer|min:1|max:15',
            'jam_mulai' => 'required|date_format:H:i',
            'jam_selesai' => 'required|date_format:H:i|after:jam_mulai',
        ]);

        // Cek bentrok guru
        $bentrokGuru = DB::table('jadwal_pelajaran')
            ->where('id', '!=', $id)
            ->where('id_guru', $request->id_guru)
            ->where('hari', $request->hari)
            ->where('jam_ke', $request->jam_ke)
            ->first();

        if ($bentrokGuru) {
            $kelasBentrok = DB::table('kelas')->where('id', $bentrokGuru->kelas_id)->value('nama_kelas');
            return response()->json([
                'status' => 'error',
                'message' => "Guru ini sudah memiliki jadwal mengajar di kelas {$kelasBentrok} pada hari {$request->hari} jam ke-{$request->jam_ke}.",
            ], 422);
        }

        // Cek bentrok kelas
        $bentrokKelas = DB::table('jadwal_pelajaran')
            ->where('id', '!=', $id)
            ->where('kelas_id', $request->kelas_id)
            ->where('hari', $request->hari)
            ->where('jam_ke', $request->jam_ke)
            ->first();
            
        if ($bentrokKelas) {
            return response()->json([
                'status' => 'error',
                'message' => "Kelas ini sudah memiliki jadwal pelajaran pada hari {$request->hari} jam ke-{$request->jam_ke}.",
            ], 422);
        }

        DB::table('jadwal_pelajaran')->where('id', $id)->update([
            'kelas_id' => $request->kelas_id,
            'mapel_id' => $request->mapel_id,
            'id_guru' => $request->id_guru,
            'hari' => $request->hari,
            'jam_ke' => $request->jam_ke,
            'jam_mulai' => $request->jam_mulai,
            'jam_selesai' => $request->jam_selesai,
            'updated_at' => now(),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Jadwal pelajaran berhasil diperbarui.',
        ]);
    }

    public function destroyJadwal($id)
    {
        DB::table('jadwal_pelajaran')->where('id', $id)->delete();
        
        return response()->json([
            'status' => 'success',
            'message' => 'Jadwal pelajaran berhasil dihapus.',
        ]);
    }

    public function exportJadwalMatrix(Request $request)
    {
        $service = new \App\Services\JadwalExportService();
        $file = $service->generateExcel();

        return response()->download($file, 'Jadwal_Pelajaran_AWH.xlsx')->deleteFileAfterSend(true);
    }
}
