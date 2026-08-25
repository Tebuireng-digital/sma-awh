# Sistem Informasi SMA KH. A. Wahid Hasyim (SMA AWH) Tebuireng

Sistem mandiri yang didedikasikan untuk seluruh operasional, manajemen kesiswaan, jadwal, dan akademik **SMA KH. A. Wahid Hasyim Tebuireng**.

---

## 📌 Gambaran Umum & Arsitektur

* **Sistem Standalone**: Seluruh fitur akademik, master data sekolah, guru, nilai, dan kelas berada 100% di dalam sistem `sma-awh`.
* **Domain & Hosting**: Terpisah dari `tebuireng-web`.
* **Fokus Integrasi Tunggal**: Hanya mengirimkan **Data Presensi/Absen Sekolah** ke `tebuireng-web` (SIMANTEB) agar wali santri dapat memantau kehadiran sekolah melalui **Portal Wali Santri**.

---

## 📁 Struktur Direktori

```text
sma-awh/
├── backend/          # REST API & Business Logic SMA AWH
├── frontend/         # Web Application / Portal User SMA AWH
└── docs/
    └── INTEGRATION_PLAN.md  # Spesifikasi API Kirim Absensi ke Portal Wali SIMANTEB
```

---

## 🔗 Spesifikasi Integrasi

* **Arah**: `sma-awh` ➡️ `tebuireng-web` (SIMANTEB)
* **Trigger**: Saat siswa melakukan presensi harian di sekolah (Hadir / Sakit / Izin / Alpa).
* **Hasil**: Data presensi muncul secara real-time pada halaman **Portal Wali Santri** di SIMANTEB.
# sma-awh
# sma-awh
