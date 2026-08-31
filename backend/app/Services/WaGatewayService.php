<?php

namespace App\Services;

use App\Models\PengaturanSekolah;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class WaGatewayService
{
    protected static function getSettings()
    {
        return DB::table('pengaturan_sekolah')->first() ?? (object)[
            'wa_bot_enabled' => true,
            'wa_gateway_url' => 'http://localhost:3000',
            'wa_gateway_key' => 'secret_key_bot_tebuireng',
        ];
    }

    /**
     * Get WA connection status & QR code data URL
     */
    public static function getStatus(): array
    {
        $settings = self::getSettings();
        if (!$settings->wa_bot_enabled) {
            return [
                'bot_enabled' => false,
                'status' => 'disabled',
                'message' => 'Bot WhatsApp saat ini dinonaktifkan oleh Admin.',
            ];
        }

        try {
            $response = Http::withHeaders([
                'x-api-key' => $settings->wa_gateway_key,
            ])->timeout(5)->get($settings->wa_gateway_url . '/qr-data');

            if ($response->successful()) {
                $data = $response->json();
                return [
                    'bot_enabled' => true,
                    'status' => $data['wa_connection'] ?? 'unknown',
                    'qr_image' => $data['qr_image'] ?? null,
                    'phone_number' => $data['phone_number'] ?? null,
                    'timestamp' => $data['timestamp'] ?? now()->toIso8601String(),
                ];
            }
        } catch (\Exception $e) {
            Log::error('WA Gateway Status Check Error: ' . $e->getMessage());
        }

        return [
            'bot_enabled' => true,
            'status' => 'disconnected',
            'qr_image' => null,
            'error' => 'Gagal terhubung ke layanan WA Gateway lokal (Port 3000)',
        ];
    }

    /**
     * Disconnect WA session & generate new QR
     */
    public static function disconnect(): array
    {
        $settings = self::getSettings();
        try {
            $response = Http::withHeaders([
                'x-api-key' => $settings->wa_gateway_key,
            ])->timeout(5)->post($settings->wa_gateway_url . '/disconnect');

            return $response->json() ?? ['status' => 'error', 'message' => 'Gagal merespons'];
        } catch (\Exception $e) {
            return ['status' => 'error', 'message' => $e->getMessage()];
        }
    }

    /**
     * Send direct WhatsApp message
     */
    public static function sendMessage(string $phone, string $message, string $recipientType = 'ortu', string $jenisNotif = 'umum'): bool
    {
        $settings = self::getSettings();
        if (!$settings->wa_bot_enabled) {
            Log::info("WA Bot Disabled. Message to {$phone} skipped.");
            return false;
        }

        $sentStatus = 'failed';
        $apiResponse = null;

        try {
            $response = Http::withHeaders([
                'x-api-key' => $settings->wa_gateway_key,
            ])->timeout(10)->post($settings->wa_gateway_url . '/send-message', [
                'phone' => $phone,
                'message' => $message,
            ]);

            $apiResponse = $response->json();

            if ($response->successful() && isset($apiResponse['status']) && $apiResponse['status'] === 'success') {
                $sentStatus = 'sent';
            }
        } catch (\Exception $e) {
            $apiResponse = ['error' => $e->getMessage()];
            Log::error("WA Gateway Send Error to {$phone}: " . $e->getMessage());
        }

        // Log to database
        DB::table('log_notifikasi_wa')->insert([
            'penerima_type' => $recipientType,
            'penerima_no_hp' => $phone,
            'jenis_notif' => $jenisNotif,
            'isi_pesan' => $message,
            'status' => $sentStatus,
            'response_api' => json_encode($apiResponse),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return $sentStatus === 'sent';
    }

    /**
     * Trigger 1: Notifikasi Orang Tua / Wali Santri untuk Alpa, Terlambat, Sakit
     */
    public static function notifyOrangTuaOnAbsence(string $siswaName, string $status, ?string $parentPhone, string $kelasName, string $tanggalStr): void
    {
        if (!$parentPhone) return;

        $msg = "📢 *PEMBERITAHUAN PRESENSI SMA AWH*\n\n";
        $msg .= "Yth. Bapak/Ibu Wali Santri,\n";
        $msg .= "Menginfokan bahwa putra/putri Anda:\n";
        $msg .= "• Nama: *{$siswaName}*\n";
        $msg .= "• Kelas: *{$kelasName}*\n";
        $msg .= "• Tanggal: *{$tanggalStr}*\n";
        $msg .= "• Status Kehadiran: *{$status}*\n\n";

        if ($status === 'ALPA') {
            $msg .= "Mohon konfirmasi atau hubungi Wali Kelas untuk informasi lebih lanjut.\n";
        } elseif ($status === 'TERLAMBAT') {
            $msg .= "Siswa tercatat hadir terlambat di sekolah. Terima kasih atas perhatiannya.\n";
        } elseif ($status === 'SAKIT') {
            $msg .= "Semoga lekas sembuh. Jangan lupa mengirimkan surat keterangan sakit ke Wali Kelas.\n";
        }

        $msg .= "\n---\n*Sistem Presensi SMA KH. A. Wahid Hasyim Tebuireng*";

        self::sendMessage($parentPhone, $msg, 'ortu', strtolower($status));
    }

    /**
     * Trigger 2: Alert ke WA Guru Piket jika ada Kelas Kosong (Guru Mapel Absen)
     */
    public static function notifyPiketOnEmptyClass(string $kelasName, string $mapelName, int $jamKe, ?string $tugasMandiri = null): void
    {
        // Get all Guru Piket phone numbers
        $piketUsers = DB::table('users')->where('role', 'piket')->whereNotNull('no_hp')->get();

        $msg = "🚨 *ALERT KELAS KOSONG (GURU INVAL NEEDED)*\n\n";
        $msg .= "Pemberitahuan untuk Guru Piket:\n";
        $msg .= "• Kelas: *{$kelasName}*\n";
        $msg .= "• Mata Pelajaran: *{$mapelName}*\n";
        $msg .= "• Jam ke-: *{$jamKe}*\n";
        if ($tugasMandiri) {
            $msg .= "• Tugas Mandiri: {$tugasMandiri}\n";
        }
        $msg .= "\nMohon Guru Piket segera mengklaim kelas inval via Dashboard Aplikasi.\n";
        $msg .= "\n---\n*Sistem Informasi SMA AWH*";

        foreach ($piketUsers as $u) {
            if ($u->no_hp) {
                self::sendMessage($u->no_hp, $msg, 'guru_piket', 'inval_alert');
            }
        }
    }

    /**
     * Trigger 3: Pengingat WA jika Guru Lupa Mengisi Jurnal Mengajar
     */
    public static function notifyGuruOnJournalReminder(string $guruName, ?string $guruPhone, string $kelasName, string $mapelName): void
    {
        if (!$guruPhone) return;

        $msg = "📝 *PENGINGAT JURNAL MENGAJAR*\n\n";
        $msg .= "Yth. {$guruName},\n";
        $msg .= "Sesi mengajar Anda di kelas *{$kelasName}* ({$mapelName}) telah selesai.\n";
        $msg .= "Mohon dapat mengisi *Jurnal Mengajar* di aplikasi web/mobile.\n\n";
        $msg .= "Terima kasih atas dedikasi Anda.\n";
        $msg .= "\n---\n*SMA KH. A. Wahid Hasyim Tebuireng*";

        self::sendMessage($guruPhone, $msg, 'guru_mapel', 'jurnal_reminder');
    }
}
