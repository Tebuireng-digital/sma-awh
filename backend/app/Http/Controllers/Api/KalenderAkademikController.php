<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\KalenderAkademik;
use App\Services\RencanaMingguEfektifService;
use App\Services\TahunAjaranRolloverService;

class KalenderAkademikController extends Controller
{
    public function index(Request $request)
    {
        $tahunAjaranId = $request->get('tahun_ajaran_id', 1);
        $sumber = $request->get('sumber_kalender');

        $query = KalenderAkademik::where('tahun_ajaran_id', $tahunAjaranId);

        if ($sumber) {
            $query->where('sumber_kalender', $sumber);
        }

        $kalender = $query->orderBy('tanggal', 'asc')->get();

        // Calculate Rincian Minggu Efektif (RME)
        $rmeGanjil = RencanaMingguEfektifService::calculateRme($tahunAjaranId, 1);
        $rmeGenap = RencanaMingguEfektifService::calculateRme($tahunAjaranId, 2);

        return response()->json([
            'status' => 'success',
            'tahun_ajaran_id' => (int) $tahunAjaranId,
            'total_agenda' => count($kalender),
            'rencana_minggu_efektif' => [
                'semester_ganjil' => $rmeGanjil,
                'semester_genap' => $rmeGenap,
            ],
            'kalender' => $kalender,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'tahun_ajaran_id' => 'nullable|integer',
            'sumber_kalender' => 'required|string|in:kemenag_dinas,sekolah_pondok',
            'jenis_hari' => 'required|string|in:efektif,libur_nasional,libur_pondok,ujian_asesmen,kegiatan_sekolah,kegiatan_pondok',
            'tanggal' => 'required|date',
            'keterangan' => 'required|string',
            'is_libur' => 'required|boolean',
            'is_acara_pondok' => 'required|boolean',
        ]);

        $tahunAjaranId = $request->tahun_ajaran_id ?? 1;

        $kalender = KalenderAkademik::updateOrCreate(
            [
                'tahun_ajaran_id' => $tahunAjaranId,
                'tanggal' => $request->tanggal,
            ],
            [
                'sumber_kalender' => $request->sumber_kalender,
                'jenis_hari' => $request->jenis_hari,
                'keterangan' => $request->keterangan,
                'is_libur' => $request->is_libur,
                'is_acara_pondok' => $request->is_acara_pondok,
            ]
        );

        return response()->json([
            'status' => 'success',
            'message' => 'Agenda kalender akademik (Kemenag/Sekolah/Pondok) berhasil disimpan.',
            'kalender' => $kalender,
        ]);
    }

    public function destroy($id)
    {
        KalenderAkademik::destroy($id);
        return response()->json([
            'status' => 'success',
            'message' => 'Agenda kalender akademik berhasil dihapus.',
        ]);
    }

    public function rolloverTahunAjaran(Request $request)
    {
        $request->validate([
            'tahun_ajaran' => 'required|string', // e.g. "2027/2028"
            'tanggal_mulai' => 'required|date',
            'tanggal_selesai' => 'required|date',
        ]);

        $result = TahunAjaranRolloverService::createNewAcademicYear(
            $request->tahun_ajaran,
            $request->tanggal_mulai,
            $request->tanggal_selesai
        );

        return response()->json($result);
    }
}
