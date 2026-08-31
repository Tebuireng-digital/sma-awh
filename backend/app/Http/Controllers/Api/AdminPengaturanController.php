<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Services\WaGatewayService;

class AdminPengaturanController extends Controller
{
    public function getPengaturan()
    {
        $profil = DB::table('profil_sekolah')->first();
        $pengaturan = DB::table('pengaturan_sekolah')->first();
        $waStatus = WaGatewayService::getStatus();

        return response()->json([
            'status' => 'success',
            'profil' => $profil,
            'pengaturan' => $pengaturan,
            'wa_bot' => $waStatus,
        ]);
    }

    public function updatePengaturan(Request $request)
    {
        $request->validate([
            'latitude_sekolah' => 'nullable|numeric',
            'longitude_sekolah' => 'nullable|numeric',
            'radius_toleransi_meter' => 'nullable|integer|min:10',
            'toleransi_terlambat_menit' => 'nullable|integer|min:0',
            'wa_bot_enabled' => 'nullable|boolean',
            'wa_gateway_url' => 'nullable|string',
            'wa_gateway_key' => 'nullable|string',
        ]);

        $updateData = [];
        if ($request->has('latitude_sekolah')) $updateData['latitude_sekolah'] = $request->latitude_sekolah;
        if ($request->has('longitude_sekolah')) $updateData['longitude_sekolah'] = $request->longitude_sekolah;
        if ($request->has('radius_toleransi_meter')) $updateData['radius_toleransi_meter'] = $request->radius_toleransi_meter;
        if ($request->has('toleransi_terlambat_menit')) $updateData['toleransi_terlambat_menit'] = $request->toleransi_terlambat_menit;
        if ($request->has('wa_bot_enabled')) $updateData['wa_bot_enabled'] = $request->wa_bot_enabled;
        if ($request->has('wa_gateway_url')) $updateData['wa_gateway_url'] = $request->wa_gateway_url;
        if ($request->has('wa_gateway_key')) $updateData['wa_gateway_key'] = $request->wa_gateway_key;
        $updateData['updated_at'] = now();

        DB::table('pengaturan_sekolah')->where('id', 1)->update($updateData);

        return response()->json([
            'status' => 'success',
            'message' => 'Pengaturan GPS Geofence & Bot WhatsApp berhasil disimpan.',
            'pengaturan' => DB::table('pengaturan_sekolah')->first(),
        ]);
    }

    public function getWaStatus()
    {
        return response()->json([
            'status' => 'success',
            'wa_bot' => WaGatewayService::getStatus(),
        ]);
    }

    public function disconnectWa()
    {
        $result = WaGatewayService::disconnect();
        return response()->json($result);
    }

    public function sendTestWa(Request $request)
    {
        $request->validate([
            'phone' => 'required|string',
            'message' => 'required|string',
        ]);

        $success = WaGatewayService::sendMessage(
            $request->phone,
            $request->message,
            'admin_test',
            'test_message'
        );

        if ($success) {
            return response()->json([
                'status' => 'success',
                'message' => 'Pesan uji coba WhatsApp berhasil dikirim ke ' . $request->phone,
            ]);
        }

        return response()->json([
            'status' => 'error',
            'message' => 'Gagal mengirim pesan uji coba WhatsApp. Cek koneksi bot atau log sistem.',
        ], 500);
    }
}
