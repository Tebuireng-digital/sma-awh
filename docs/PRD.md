# Product Requirement Document (PRD)
## Portal Digital SMA KH. A. Wahid Hasyim Tebuireng

* **Nama Sistem**: Portal Digital SMA KH. A. Wahid Hasyim Tebuireng
* **Versi Dokumen**: 2.1.0
* **Tanggal Revisi**: 03 September 2026
* **Dasar Alur Resmi**: `ALUR_PORTAL_revisi.xlsx`
* **Referensi Tambahan**: `RAPOR STS X-1.docx`, `JADWAL PELAJARAN 26-27.xlsx`
* **Status**: Approved — Ready for Development

---

## 1. Ringkasan Eksekutif & Tujuan

**Portal Digital SMA KH. A. Wahid Hasyim Tebuireng** adalah sistem informasi manajemen sekolah terintegrasi yang mengotomatisasi seluruh proses administrasi, akademik, kesiswaan, kepegawaian, sarana, persuratan, dan layanan publik sekolah dalam satu platform.

**Prinsip utama sistem:**
- **Single Source of Truth**: Data siswa berpusat di modul Admin Kesiswaan. Semua modul lain wajib mengambil referensi dari sini.
- **RBAC (Role-Based Access Control)**: 15 peran pengguna dengan hak akses terpisah.
- **Portal Self-Service**: Siswa dan Wali Santri dapat mandiri mengecek data melalui portal.
- **Fokus & Ringan**: Hanya memuat modul yang ada dalam `ALUR_PORTAL_revisi.xlsx`. Tidak ada modul tambahan di luar alur resmi.

---

## 2. Stack Teknis

| Layer | Teknologi |
| --- | --- |
| **Frontend** | React (Vite) + JavaScript |
| **Styling** | Tailwind CSS |
| **Backend** | Laravel 11 (PHP 8.3+) REST API |
| **Auth** | Laravel Sanctum (SPA Token) — wajib ganti password saat login pertama |
| **Database** | SQLite (Development) / MySQL 8 (Production) |
| **Ekspor** | DomPDF (PDF Rapor) + Laravel Excel (Rekap) |
| **Kontainerisasi** | Docker + Docker Compose |

---

## 3. Peran & Hak Akses (15 Role — sesuai ALUR_PORTAL_revisi.xlsx)

| No | Pengguna | Role Sistem | Hak Akses |
|---|---|---|---|
| 1 | **Kepala Sekolah** | `kepala_sekolah` | Akses penuh seluruh modul. Dashboard eksekutif lintas modul. Approve final SK kepegawaian. |
| 2 | **Wakil Kepala Sekolah** | `waka` | Akses penuh seluruh modul. Dashboard bidang. |
| 3 | **Kepala TU** | `kepala_tu` | Full CRUD modul TU, kepegawaian, persuratan. Modul akademik: read-only. Verifikasi tahap 1 alur kepegawaian. |
| 4 | **Staf Kurikulum** | `kurikulum` | Full CRUD: Jadwal Pelajaran, Jurnal Guru, Nilai, Rapor, Absensi Guru, Mata Pelajaran, Perangkat Pembelajaran. Data Siswa: read-only. |
| 5 | **Staf Kesiswaan** | `kesiswaan` | Full CRUD: Data Siswa, Buku Induk, Absensi Siswa, Prestasi, Pelanggaran, PPDB, Mutasi. **Single source of truth.** |
| 6 | **Staf Sarana & Prasarana** | `sarana` | Full CRUD: Inventaris Barang, Barang Masuk-Keluar, Penghapusan, Perawatan, Peminjaman Inventaris & Aset IT. Penghapusan aset besar perlu approval K.TU/Kepsek. |
| 7 | **Staf Kepegawaian (HRD)** | `kepegawaian` | Full CRUD: Data Induk Pegawai, Riwayat Jabatan, Kontrak/SK, Presensi Pegawai, Pengajuan Cuti/Izin, Penilaian Kinerja. Inisiasi alur berjenjang. |
| 8 | **Staf Persuratan** | `persuratan` | Full CRUD: Surat Masuk-Keluar, Penomoran Otomatis, Pembuatan Surat, Arsip Digital. |
| 9 | **Staf Humas & Branding** | `humas` | Full CRUD (dengan approval): Website Sekolah, Konten Medsos, Galeri Kegiatan, Publikasi/Berita. |
| 10 | **Guru** | `guru` | Absensi Guru (isi mandiri), Absensi Siswa (per kelas yang diampu), Jurnal Guru (isi), Nilai (input), Perangkat Pembelajaran (unggah). Jadwal: read-only. Dibatasi hanya kelas & mapel yang diampu. |
| 11 | **Wali Kelas** | `wali_kelas` | Jadwal (baca), Rekap Absensi Siswa (kelas sendiri), Nilai (rekap & validasi), Prestasi, Pelanggaran, Rapor (approval & tanda tangan digital). |
| 12 | **BK** | `bk` | Full CRUD: Absensi Siswa, Prestasi, Pelanggaran, Tracing Study, Rencana Studi Lanjut, Bimbingan Karir, Catatan Konseling (rahasia). |
| 13 | **Wali Santri** | `wali_santri` | Read-only: Prestasi, Pelanggaran, Absensi, Rapor — hanya data anak sendiri. Notifikasi otomatis (WhatsApp) saat ada data baru. |
| 14 | **Pustakawan** | `pustakawan` | Full CRUD: Katalog Buku, Sirkulasi Peminjaman-Pengembalian, Denda, Data Kunjungan. |
| 15 | **Siswa / Santri** | `siswa` | Read-only (milik sendiri): Jadwal Pelajaran, Nilai, Rapor, Absensi, Status Peminjaman Buku. |
| — | **Admin** | `admin` | Manajemen user, role, konfigurasi sistem. |

---

## 4. Modul Fungsional (sesuai ALUR_PORTAL_revisi.xlsx)

### 4.1. Jadwal Pelajaran
Dikelola oleh Staf Kurikulum. Mengacu pada `JADWAL PELAJARAN 26-27.xlsx`.
- Hari sekolah: **Ahad, Senin, Selasa, Rabu, Kamis, Sabtu**.
- Staf Kurikulum: CRUD lengkap.
- Guru, Siswa, Wali Santri, Wali Kelas: read-only.

---

### 4.2. Absensi Guru & Jurnal Mengajar
Dikelola oleh Guru sendiri, dipantau Staf Kurikulum.
- Guru mencatat kehadiran mengajar (masuk & selesai).
- Jurnal Mengajar wajib diisi tiap sesi: Mata Pelajaran, Bab/Materi, Catatan Kelas.
- Input dibatasi hanya pada kelas & mapel yang diampu guru bersangkutan.

---

### 4.3. Absensi Siswa
Dikelola oleh Guru (per kelas yang diampu), Wali Kelas (rekap), dan BK.
- Default status: **Hadir**. Guru hanya mengubah siswa yang tidak hadir.
- Status: `Hadir`, `Sakit`, `Izin`, `Alpa`, `Terlambat`, `Dispensasi`.
- Wali Santri dapat melihat (read-only) absensi anak sendiri.

---

### 4.4. Nilai & Rapor Sumatif Tengah Semester (STS)
Dikelola oleh Guru (input nilai), Wali Kelas (validasi & tanda tangan), Staf Kurikulum (pantau), Kepala Sekolah (approve final).

**21 Mata Pelajaran Resmi** (sesuai `RAPOR STS X-1.docx`):

| No | Kode | Mata Pelajaran |
|---|---|---|
| 1 | PAI | Pendidikan Agama Islam |
| 2 | PPKN | PPKN |
| 3 | BINDO | Bahasa Indonesia |
| 4 | MAT | Matematika |
| 5 | BING | Bhs. Inggris |
| 6 | SENI | Seni Budaya |
| 7 | PENJAS | Penjaskes |
| 8 | INF | Informatika |
| 9 | SEJ | Sejarah |
| 10 | BIO | IPA Biologi |
| 11 | FIS | Fisika |
| 12 | KIM | Kimia |
| 13 | GEO | IPS Geografi |
| 14 | SOS | Sosiologi |
| 15 | EKO | Ekonomi |
| 16 | PKWU | PKWU |
| 17 | ALQURAN | Al-Quran |
| 18 | AKHLAQ | Akhlaq |
| 19 | FIQIH | Fiqih |
| 20 | NAHWU | Nahwu Shorof |
| 21 | ASWAJA | Aswaja |

**Alur Rapor:**
```
Guru (input nilai 21 mapel)
  → Wali Kelas (rekap, validasi, catatan, tanda tangan digital)
  → Kepala Sekolah (approve final)
  → Cetak PDF / dikirim ke Wali Santri
```

- Perhitungan otomatis: **Jumlah** dan **Rata-rata** nilai.
- Tampilan dan cetak sesuai layout `RAPOR STS X-1.docx`.

---

### 4.5. Perangkat Pembelajaran
Dikelola oleh Guru (unggah) dan dipantau oleh Staf Kurikulum.
- Guru mengunggah dokumen perangkat pembelajaran per mapel yang diampu.
- Staf Kurikulum memantau kelengkapan per guru.

---

### 4.6. Data Siswa & Kesiswaan (Single Source of Truth)

> **Seluruh modul lain yang membutuhkan data siswa wajib mengambil referensi dari modul ini via ID Siswa. Tidak ada input ulang data siswa di modul lain.**

Dikelola oleh Staf Kesiswaan:
- **Data Siswa & Buku Induk**: Identitas lengkap siswa.
- **PPDB (Penerimaan Peserta Didik Baru)**: Alur pendaftaran siswa baru.
- **Mutasi Siswa**: Siswa masuk dari sekolah lain atau pindah keluar.
- **Prestasi Siswa**: Rekap prestasi akademik dan non-akademik.
- **Pelanggaran Siswa**: Rekap pelanggaran, poin, dan tindak lanjut.

---

### 4.7. Kepegawaian — Alur Berjenjang 4 Tahap

Dikelola oleh Staf Kepegawaian:
- **Data Induk Pegawai**: Profil guru & karyawan, jabatan, status kepegawaian.
- **Riwayat Jabatan & Kepangkatan**: Histori perubahan jabatan/pangkat.
- **Kontrak Kerja & SK**: Arsip digital dokumen kontrak.
- **Presensi Pegawai**: Kehadiran staf TU dan karyawan non-guru.
- **Pengajuan Cuti / Izin**: Alur wajib berjenjang:

```
(1) Staf Kepegawaian — input / update pengajuan
  → (2) Kepala TU — verifikasi berkas (approve tahap 1)
  → (3) Kepala Sekolah — approve final / penerbitan SK
  → (4) [Read-only ke Keuangan untuk perhitungan gaji/honor]
```

- **Penilaian Kinerja**: Rekap evaluasi kinerja pegawai.

> **Kerahasiaan Data:** Guru/staf lain hanya dapat melihat presensi & data dirinya sendiri. Tidak dapat melihat data kepegawaian pegawai lain.

---

### 4.8. Sarana & Prasarana

Dikelola oleh Staf Sarana:
- **Inventaris Barang**: CRUD aset sekolah (kode, kategori, kondisi, lokasi).
- **Barang Masuk & Keluar**: Mutasi stok barang.
- **Perawatan Barang**: Jadwal dan riwayat perbaikan aset.
- **Peminjaman Inventaris & Aset IT**: Alur peminjaman dengan notifikasi pengembalian ke peminjam.
- **Penghapusan Aset**: Aset bernilai besar perlu approval K.TU dan Kepala Sekolah.

---

### 4.9. Persuratan & Kearsipan

Dikelola oleh Staf Persuratan:
- **Surat Masuk & Keluar**: Pencatatan dan pengarsipan semua surat dinas.
- **Penomoran Surat Otomatis**: Sesuai format standar sekolah.
- **Pembuatan Surat**: Template surat berkop resmi sekolah.
- **Arsip Digital**: PDF + metadata surat yang dapat dicari.

---

### 4.10. BK — Bimbingan Konseling

Dikelola oleh Guru BK:
- **Absensi Siswa**: CRUD dari sudut pandang BK.
- **Catatan Konseling**: Pencatatan sesi konseling individu/kelompok.
- **Tracing Study**: Pendataan rencana studi lanjut siswa kelas XII.
- **Rencana Studi Lanjut & Bimbingan Karir**: Rekap minat dan bakat siswa.
- **Kelola Kasus Pelanggaran**: Penanganan kasus bersama Kesiswaan.

> **Kerahasiaan:** Catatan konseling hanya dapat diakses oleh BK, Kepala Sekolah, dan Waka Kesiswaan. Guru dan Wali Kelas hanya melihat status umum (`"Sedang ditangani BK"`), bukan isi catatan.

---

### 4.11. Humas & Branding

Dikelola oleh Staf Humas:
- **Konten Website Sekolah**: Berita, pengumuman, profil sekolah.
- **Galeri Kegiatan**: Foto/video kegiatan sekolah.
- **Konten Media Sosial**: Manajemen konten untuk medsos sekolah.
- **Alur Approval**: Staf Humas buat konten → Kepala Sekolah approve → Publish.

---

### 4.12. Perpustakaan

Dikelola oleh Pustakawan:
- **Katalog Buku**: CRUD data buku (judul, pengarang, penerbit, stok).
- **Sirkulasi Peminjaman & Pengembalian**: Transaksi peminjaman oleh siswa.
- **Denda Keterlambatan**: Kalkulasi otomatis denda.
- **Data Kunjungan**: Rekap kunjungan harian.
- Terhubung ke Data Siswa (Kesiswaan) untuk validasi identitas peminjam.

---

### 4.13. Portal Self-Service Wali Santri

- Read-only: Prestasi, Pelanggaran, Absensi, Rapor — **hanya data anak sendiri**.
- Login via username atau kode unik anak (NISN).
- **Notifikasi WhatsApp otomatis** saat ada data absensi atau nilai baru.

---

### 4.14. Portal Self-Service Siswa

- Read-only (milik sendiri): Jadwal Pelajaran, Nilai, Rapor, Absensi, Status Peminjaman Buku.
- Login via username/NISN.

---

## 5. Arsitektur Data Utama

```
siswa (master — dikelola Kesiswaan)
  ├── anggota_kelas
  ├── presensi_murid
  ├── rapor_sts (21 mapel)
  ├── bk_catatan (rahasia)
  ├── prestasi_siswa
  ├── pelanggaran_siswa
  └── peminjaman_buku

guru (master — dikelola Kepegawaian)
  ├── jadwal_pelajaran
  ├── presensi_guru + jurnal_mengajar
  ├── pengajuan_cuti_izin (alur 4 tahap)
  └── riwayat_jabatan
```

---

## 6. Skema Database Utama

| # | Tabel | Deskripsi |
|---|---|---|
| 1 | `users` | 15 role, `id_guru`, `id_siswa` |
| 2 | `guru` | Data induk guru |
| 3 | `siswa` | Master data siswa (single source of truth) |
| 4 | `kelas` & `anggota_kelas` | Struktur kelas dan mapping siswa |
| 5 | `mata_pelajaran` (21 mapel) & `jadwal_pelajaran` | Jadwal pelajaran 2026/2027 |
| 6 | `presensi_guru` & `jurnal_mengajar` | KBM harian guru |
| 7 | `presensi_murid` | Absensi siswa per kelas per mapel |
| 8 | `rapor_sts` | Nilai 21 mapel, jumlah, rata-rata, catatan wali kelas |
| 9 | `pegawai` & `pengajuan_kepegawaian` | Alur berjenjang 4 tahap |
| 10 | `bk_catatan` | Rahasia — akses terbatas |
| 11 | `inventaris_barang` & `peminjaman_inventaris` | Sarana & prasarana |
| 12 | `surat` | Persuratan & penomoran otomatis |
| 13 | `humas_konten` | Artikel, galeri, status approve |
| 14 | `buku_perpustakaan` & `peminjaman_buku` | Perpustakaan |
| 15 | `tahun_ajaran` & `semester` | Multi-tahun ajaran |

---

## 7. Kriteria Keberhasilan (Acceptance Criteria)

### Akademik & Kurikulum
- [ ] Staf Kurikulum dapat CRUD jadwal pelajaran (Ahad–Sabtu).
- [ ] Guru dapat input absensi dan jurnal mengajar, dibatasi kelas yang diampu saja.
- [ ] Guru dapat input nilai 21 mapel; sistem kalkulasi jumlah & rata-rata otomatis.
- [ ] Alur rapor berjalan: Guru → Wali Kelas → Kepsek → PDF siap cetak.
- [ ] Rapor STS dicetak sesuai layout `RAPOR STS X-1.docx`.
- [ ] Absensi siswa default "Hadir", perubahan dapat disimpan < 30 detik per kelas.

### Kesiswaan
- [ ] Semua modul mengambil data siswa dari Kesiswaan via ID siswa — tidak ada duplikasi input.
- [ ] PPDB menghasilkan data siswa baru yang langsung tersedia di seluruh modul.

### Kepegawaian
- [ ] Alur pengajuan cuti/izin wajib melewati 4 tahap (Staf HRD → K.TU → Kepsek).
- [ ] Pegawai tidak bisa melihat data kepegawaian rekannya, hanya data dirinya sendiri.

### BK
- [ ] Catatan konseling hanya bisa diakses oleh BK, Kepala Sekolah, dan Waka Kesiswaan.
- [ ] Guru dan Wali Kelas hanya melihat status umum kasus BK, bukan isi detail.

### Portal Self-Service
- [ ] Siswa login mandiri dan melihat nilai, rapor, absensi diri sendiri (read-only).
- [ ] Wali Santri hanya melihat data anak sendiri.
- [ ] Notifikasi WhatsApp terkirim otomatis ke Wali Santri saat ada absensi atau nilai baru.

### Keamanan & RBAC
- [ ] Setiap role hanya melihat menu dan data sesuai `ALUR_PORTAL_revisi.xlsx`.
- [ ] Row-level restriction berlaku: Guru (hanya kelas yang diampu), Siswa (hanya data dirinya).
- [ ] Sistem dapat diakses dari browser mobile tanpa instalasi APK.
