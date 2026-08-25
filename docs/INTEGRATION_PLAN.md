# Rencana Integrasi Spesifik: Absensi Sekolah SMA AWH ➡️ Portal Wali SIMANTEB

Dokumen ini merinci **satu-satunya titik integrasi** antara **Sistem SMA KH. A. Wahid Hasyim (`sma-awh`)** dengan **Sistem Utama Tebuireng (`tebuireng-web` / SIMANTEB)**.

---

## 🎯 Lingkup Integrasi (Single Point Integration)

Seluruh manajemen sekolah, master data kesiswaan, jadwal, nilai, dan akademik berjalan 100% mandiri di dalam sistem **`sma-awh`**.

**Satu-satunya integrasi ke `tebuireng-web` (SIMANTEB) adalah:**
> 📍 **Pencatatan Kehadiran Sekolah**: Ketika siswa melakukan presensi/absen harian di sekolah (SMA AWH), data status kehadiran tersebut dikirimkan secara otomatis ke `tebuireng-web` agar dapat tampil di **Portal Wali Santri (SIMANTEB)**.

---

## 📡 Flow & Skema Endpoint

```text
[ Guru / Sistem Presensi SMA AWH ]
               │
               ▼ (Absen Tercatat)
      [ Database SMA AWH ]
               │
               ▼ (HTTP POST Webhook / API Request)
    [ API Backend SIMANTEB ]
               │
               ▼ (Simpan Record Absensi Sekolah)
  [ Portal Wali Santri SIMANTEB ] ──► (Wali Santri melihat rekap absen sekolah)
```

### Endpoint API (Tebuireng Web / SIMANTEB)
* **URL**: `POST /api/v1/integrasi/absen-sekolah`
* **Headers**:
  * `X-API-KEY`: `[Secret Key khusus SMA AWH]`
  * `Content-Type`: `application/json`
* **Payload Request**:
  ```json
  {
    "nisn": "1234567890",
    "nis_pondok": "202600123",
    "tanggal": "2026-08-25",
    "status": "Hadir", // Options: Hadir, Izin, Sakit, Alpa
    "keterangan": "Hadir Tepat Waktu",
    "waktu_absen": "2026-08-25 07:05:00"
  }
  ```

---

## 🔒 Keamanan & Validasi

1. **API Key Authentication**: Menggunakan token rahasia `X-API-KEY` yang disepakati antara server `sma-awh` dan `tebuireng-web`.
2. **Validasi NIS / Santri**: Server SIMANTEB memverifikasi NISN / NIS Pondok sebelum menyimpan data ke log presensi Portal Wali.
3. **Idempotency**: Jika presensi dikirim berulang untuk tanggal yang sama, sistem akan melakukan *update* (upsert) tanpa menggandakan data.
