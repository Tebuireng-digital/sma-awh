# Product Requirement Document (PRD)
## Sistem Presensi Guru, Jurnal Mengajar, & Absensi Murid — SMA AWH

* **Nama Sistem**: Sistem Informasi SMA KH. A. Wahid Hasyim (SMA AWH)
* **Modul**: Presensi Guru, Jurnal Mengajar, Absensi Kesiswaan & Sync SIMANTEB
* **Versi Document**: 1.0.0
* **Tanggal**: 25 Agustus 2026
* **Status**: Approved / Ready for Development

---

## 1. Ringkasan Eksekutif & Tujuan

Modul ini dikembangkan khusus untuk **SMA KH. A. Wahid Hasyim (SMA AWH)** guna mengotomatisasi pencatatan kehadiran guru di kelas, pengisian jurnal kegiatan KBM (Kegiatan Belajar Mengajar), absensi murid harian/per-mapel, serta mengintegrasikan status presensi siswa ke **Portal Wali Santri (SIMANTEB)** secara efisien dan akurat.

---

## 2. Stack Teknis Terkini

| Layer | Teknologi | Implementasi & Catatan Operasional |
| --- | --- | --- |
| **Frontend** | React (Vite) + TypeScript + Tailwind CSS | Single Page Application (SPA) responsif mobile-first, dioptimalkan untuk pengisian cepat di HP guru/staf. |
| **Mobile Packaging** | Capacitor (Android) + PWA | Dibangun untuk browser HP dan dapat dikemas sebagai APK Android native via Capacitor. |
| **State & Offline Queue** | TanStack Query + IndexedDB (Dexie.js) | Presensi mendukung offline-first: data tersimpan di IndexedDB lokal saat sinyal lemah dan otomatis disinkronkan saat online. |
| **Backend** | Laravel 11/12 (PHP 8.3+) REST API | Auth Sanctum, Policy Otorisasi per unit, job scheduler, audit log, dan ekspor data. |
| **Auth** | Laravel Sanctum (SPA Token) | Token otentikasi SPA dengan proteksi masa berlaku dan wajib ganti password pada login pertama. |
| **Database** | MySQL 8.0 / SQLite (Test) | Database utama MySQL 8.0 dengan Docker Volume terisolasi (`sma_awh_mysql_data`). |
| **Queue & Scheduler** | Laravel Queue + Task Scheduler | Cron job untuk sinkronisasi harian presensi ke SIMANTEB dan notifikasi pengingat harian. |
| **Ekspor Engine** | Laravel Excel (`maatwebsite/excel`) & DomPDF | Ekspor data terpusat (Khusus Admin & Kurikulum) tanpa grafik/cover page gambar pada format Excel (.xlsx). |

---

## 3. Peran & Hak Akses Pengguna (User Roles)

| Peran | Deskripsi Hak Akses |
|---|---|
| **Guru Mata Pelajaran** | Presensi masuk kelas, mengisi jurnal mengajar, mengisi absensi murid di kelasnya, dan memberikan Tugas Mandiri jika berhalangan. |
| **Guru Piket / Inval** | Mengambil alih jam mengajar kelas kosong, melakukan presensi guru inval, dan mengisi absensi murid. |
| **Waka Kurikulum** | Mengakses Dashboard Monitoring real-time, melihat statistik KBM, rekap jam mengajar, dan ekspor laporan. |
| **Wali Kelas / Guru BK** | Melihat rekapitulasi presensi harian dan statistik ketidakhadiran murid di kelasnya. |
| **Admin Sistem** | Pengelolaan master data guru, jadwal pelajaran, kelas, siswa, dan konfigurasi API key integrasi. |

---

## 4. Spesifikasi Fitur Utama & Alur Kerja

### 4.1. Presensi Kehadiran Guru (GPS + KBM Check-In)
* **Mekanisme**: Guru melakukan presensi masuk mengajar melalui tombol *"Mulai Mengajar"* pada aplikasi web/mobile.
* **Validasi Geolocation (GPS)**: Sistem memverifikasi lokasi koordinat HP/perangkat guru berada di dalam radius area sekolah SMA AWH (contoh: max 100 meter dari titik pusat sekolah).
* **Validasi Jadwal**: Tombol aktif otomatis sesuai jadwal jam pelajaran yang berlaku hari itu.

### 4.2. Penanganan Guru Berhalangan Hadir & Tugas Mandiri
* **Tugas Mandiri**: Guru yang berhalangan (Sakit/Izin/Dinas) wajib mengunggah/mengisi **Tugas Mandiri** di sistem sebelum/saat jam pelajaran berlangsung.
* **Fitur Guru Inval (Piket)**: 
  * Guru Piket dapat melihat daftar kelas kosong di dashboard piket.
  * Guru Piket dapat mengklaim kelas tersebut sebagai *Guru Inval*, mengawasi pelaksanaan Tugas Mandiri, dan melakukan presensi murid.

### 4.3. Pengisian Jurnal Mengajar Guru
Setiap kali sesi mengajar selesai, guru wajib mengklik *"Selesai Mengajar"* dan mengisi **Jurnal Mengajar Standar**:
1. **Mata Pelajaran & Jam Ke-** *(Otomatis dari jadwal)*
2. **Bab / Materi Pembelajaran** *(Mandatory Text Input / Select)*
3. **Catatan Kelas** *(Opini/Kejadian khusus di kelas, misal: proyektor rusak, suasana kondusif, dll)*

### 4.4. Presensi Murid di Kelas (Checklist Cepat)
* **Antarmuka Fast-Checklist**: Secara default, seluruh murid di kelas otomatis berstatus **`Hadir`**. Guru hanya perlu mengklik nama siswa yang berhalangan untuk mengubah statusnya.
* **Pilihan Status Kehadiran Murid**:
  1. `Hadir` *(Default)*
  2. `Sakit`
  3. `Izin`
  4. `Alpa`
  5. `Terlambat`
  6. `Dispensasi` *(Tugas Sekolah / Lomba / Organisasi)*

### 4.5. Konsolidasi & Integrasi Presensi ke SIMANTEB (`tebuireng-web`)
* **Aturan Status Harian**: Jika pada **Jam Ke-1** (jam pertama sekolah) seorang murid tercatat **`Hadir`**, maka status presensi harian sekolah untuk murid tersebut ditetapkan sebagai **`HADIR`**. (Catatan alpa/cabut pada jam ke-2 dst. tetap tercatat untuk rekap internal SMA AWH).
* **Waktu Pengiriman (Cron Job/Scheduler)**: 
  * Otomatis dikonsolidasi dan dikirim ke API SIMANTEB setiap hari pada **akhir jam sekolah (pukul 14:00 WIB)** via endpoint `POST /api/v1/integrasi/absen-sekolah`.
* **Dampak di SIMANTEB**: Orang tua/wali santri dapat langsung melihat status kehadiran sekolah putra-putrinya di **Portal Wali Santri**.

### 4.6. Dashboard Monitoring Kurikulum (Real-time Analytics)
* **Tanpa Manual Approval**: Jurnal yang diisi guru langsung sah dan masuk ke statistik tanpa memerlukan persetujuan tombol manual oleh Kurikulum.
* **Fitur Monitoring Real-time**:
  * Widget persentase KBM berlangsung hari ini.
  * Daftar kelas yang sedang berlangsung vs kelas kosong.
  * Log aktivitas guru mengajar dan jurnal harian.

### 4.7. Laporan & Ekspor Data (Reporting Module)
Sistem menyediakan modul laporan lengkap dengan format ekspor **PDF** & **Excel**:
1. **Rekap Jam Mengajar Guru**: Digunakan sebagai acuan dasar perhitungan honorarium / jam mengajar harian/bulanan.
2. **Jurnal Mengajar Kelas**: Rekap kumulatif materi pembelajaran per mata pelajaran & per kelas.
3. **Rekap Presensi Siswa**: Persentase & rincian kehadiran murid per bulan.
4. **Grafik Kehadiran**: Visualisasi statistik tren kehadiran guru & murid.

---

## 5. Skema Database Utama (Outline)

1. `jadwal_pelajaran` (id, guru_id, mapel_id, kelas_id, hari, jam_mulai, jam_selesai)
2. `presensi_guru` (id, jadwal_id, guru_id, guru_inval_id, lat, long, waktu_mulai, waktu_selesai, status_inval)
3. `jurnal_mengajar` (id, presensi_guru_id, bab_materi, catatan_kelas, tugas_mandiri)
4. `presensi_murid` (id, presensi_guru_id, murid_id, status, keterangan)
5. `log_sync_simanteb` (id, tanggal, murid_id, status_harian, response_api, status_sync)

---

## 6. Kriteria Keberhasilan (Acceptance Criteria)

* [ ] Guru hanya bisa menekan "Mulai Mengajar" jika koordinat GPS berada di lokasi SMA AWH.
* [ ] Guru berhalangan hadir dapat menambahkan Tugas Mandiri dan di-takeover oleh Guru Inval.
* [ ] Absensi murid default Hadir dan dapat disimpan kurang dari 30 detik per kelas.
* [ ] Tepat pukul 14:00 WIB, cron job memicu pengiriman data presensi harian ke SIMANTEB dan tercatat pada Portal Wali Santri.
* [ ] Waka Kurikulum dapat mengunduh Rekap Honor Jam Mengajar dan Jurnal Mengajar dalam bentuk Excel/PDF.
