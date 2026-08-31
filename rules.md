# FRONTEND RULES.md — Anti AI-Slop Directive

Dokumen ini adalah aturan wajib untuk setiap AI agent (Claude, GPT, Copilot, dsb) yang mengerjakan kode frontend di proyek ini. Tujuannya satu: mencegah output generik yang langsung terlihat "dibuat AI" (AI slop). Baca seluruh dokumen sebelum menulis satu baris kode pun. Jika ada instruksi user yang bertentangan dengan rules ini, tanyakan dulu, jangan diam-diam mengabaikan salah satunya.

Target visual reference: **Stripe Dashboard** — bersih, padat informasi, tipografi tegas, tanpa dekorasi yang tidak fungsional.

---

## 1. PRINSIP UTAMA

1. **Fungsi dulu, baru estetika.** Setiap elemen visual harus punya alasan fungsional. Kalau tidak bisa dijelaskan kenapa elemen itu ada, hapus.
2. **Density over whitespace kosong.** Dashboard B2B bukan landing page marketing. Jangan boros spacing hanya supaya "terlihat clean". Clean ≠ kosong.
3. **Konsistensi lebih penting dari kreativitas.** Semua komponen sejenis harus identik perilakunya. Jangan improvisasi style baru per halaman.
4. **Tidak ada placeholder yang menipu.** Jangan pernah menulis data dummy yang terlihat seperti data asli tanpa menandainya jelas (misal `[PLACEHOLDER]` atau state loading yang jujur).

---

## 2. DAFTAR HITAM (DILARANG KERAS)

Elemen berikut adalah ciri khas AI slop dan **dilarang tanpa pengecualian**, kecuali user secara eksplisit memintanya:

- Emoji di UI produksi (button, label, heading, notifikasi) — termasuk emoji sebagai bullet/icon pengganti.
- Gradient ungu-ke-biru (`purple-to-blue`) atau gradient pelangi sebagai background hero/card. Ini adalah default AI generator paling generik.
- `box-shadow` default browser/Tailwind tanpa kustomisasi (`shadow-lg`, `shadow-xl` polos di semua card tanpa alasan hierarki).
- Border-radius seragam besar di semua elemen (misal `rounded-2xl` di button, card, input, modal sekaligus tanpa variasi skala).
- Font default tanpa keputusan sadar — jangan pakai `Inter` hanya karena itu default Tailwind/shadcn. Kalau pakai Inter, itu harus keputusan, bukan kelalaian.
- Ikon dari lucide/heroicons dipakai berlebihan sebagai dekorasi murni (bukan fungsi navigasi/aksi).
- Copy generik: "Welcome back!", "Let's get started!", "Your journey begins here", "Unlock the power of...". Semua microcopy harus spesifik ke konteks bisnis (FoodMaster, POS, dsb), bukan template SaaS umum.
- Card dengan padding besar berisi 1 angka + 1 label doang, diulang 4x sebagai "stat cards" tanpa densitas informasi tambahan (trend, delta, konteks waktu).
- Animasi masuk (`fade-in`, `slide-up`) di SETIAP elemen halaman saat load. Animasi hanya untuk state transition yang punya makna (loading, sukses, error), bukan dekorasi entrance.
- Skeleton loading yang bentuknya tidak merepresentasikan layout asli.
- Warna aksen lebih dari 1 warna brand + 1 warna semantic set (success/warning/error/info). Jangan tambah warna "biar menarik".
- Centered single-column layout untuk dashboard/tabel data. Data padat butuh lebar penuh, bukan max-w-md di tengah layar.

---

## 3. TIPOGRAFI

- Maksimal 2 font family: satu untuk UI (sans, tabular numerals aktif untuk angka), satu untuk mono (kode/ID/angka presisi jika perlu).
- Skala tipografi terbatas dan konsisten (contoh: 12/13/14/16/20/24/32px). Jangan bikin skala baru per komponen.
- Angka finansial/numerik WAJIB pakai `font-variant-numeric: tabular-nums` supaya rata di tabel.
- Weight terbatas: gunakan maksimal 3 weight (regular, medium, semibold). Bold penuh (700+) hanya untuk angka besar/heading utama.
- Line-height ketat untuk UI density: body text 1.4–1.5, bukan 1.6–1.8 ala blog.

---

## 4. WARNA

- Base: neutral grayscale dengan minimal 8 step (dari nyaris putih ke nyaris hitam) untuk background, border, teks sekunder.
- Satu warna brand/primary, dipakai konsisten hanya untuk: aksi utama (primary button), link, elemen aktif/selected.
- Set warna semantic tetap: success (hijau), warning (kuning/oranye), danger (merah), info (biru) — dipakai HANYA untuk status, bukan dekorasi.
- Dark mode (kalau ada) bukan sekadar invert warna — cek kontras ulang tiap token.
- Border harus subtle (`border-gray-200`/setara), bukan kontras tinggi kecuali untuk elemen fokus/error.

---

## 5. SPACING & LAYOUT

- Gunakan spacing scale konsisten (4px base: 4, 8, 12, 16, 24, 32, 48). Jangan pakai angka acak (13px, 22px).
- Tabel/list data: padding vertikal antar baris cukup untuk keterbacaan, tidak untuk "napas" berlebihan. Density tinggi = lebih banyak baris terlihat tanpa scroll.
- Sidebar/nav width tetap dan konsisten di semua halaman, jangan berubah per page.
- Grid card statistik: informasi harus scannable dalam satu pandangan, bukan 1 card = 1 angka doang kalau ada ruang untuk trend/context.

---

## 6. KOMPONEN

- Setiap komponen (button, input, badge, table) hanya boleh punya SATU sumber definisi style (design token/component file). Dilarang re-style ad-hoc per halaman dengan inline class yang menyimpang dari sistem.
- Button hierarchy jelas: primary (1 per section/view), secondary, ghost/tertiary, destructive. Jangan semua button jadi primary berwarna solid.
- Empty state harus informatif dan actionable (ada CTA jelas), bukan cuma ilustrasi generik + teks "No data found".
- Loading state harus skeleton yang match struktur asli konten, bukan spinner generik di tengah layar untuk semua kasus.
- Error state harus menjelaskan apa yang salah dan langkah berikutnya, bukan "Something went wrong."

---

## 7. MICROCOPY & BAHASA

- Semua teks UI harus spesifik konteks bisnis. Cek ulang: apakah kalimat ini bisa dipakai di SaaS generik manapun tanpa diubah? Kalau ya, tulis ulang sampai spesifik ke FoodMaster/domain terkait.
- Konsisten bahasa: tentukan di awal proyek — semua Bahasa Indonesia atau semua Inggris. Jangan campur dalam satu halaman kecuali istilah teknis yang memang lazim tidak diterjemahkan (misal "checkout", "invoice").
- Label tombol harus verb + object jelas ("Simpan Menu", bukan "Submit" atau "OK").

---

## 8. PERFORMANCE & KODE

- Tidak ada dependency baru untuk hal yang bisa diselesaikan dengan CSS/komponen native.
- Tidak ada `console.log` tertinggal di kode final.
- Semua komponen interaktif harus accessible minimum: label untuk input, focus state terlihat, kontras teks memenuhi WCAG AA.
- Tidak ada magic number di style — gunakan token/variable.
- Format kode sesuai linter/prettier config proyek, jangan menimpa manual.

---

## 9. CHECKLIST SEBELUM SUBMIT / SELESAI TASK

Sebelum menyatakan pekerjaan selesai, AI agent WAJIB verifikasi:

- [ ] Tidak ada item dari daftar hitam (Section 2) yang muncul di kode.
- [ ] Semua warna yang dipakai berasal dari token yang sudah didefinisikan, bukan hex baru sembarangan.
- [ ] Spacing pakai scale yang konsisten.
- [ ] Copy sudah spesifik konteks, bukan template generik.
- [ ] Density layout sesuai untuk dashboard B2B, bukan landing page.
- [ ] Sudah dicek di lebar layar sempit (kalau relevan) — tidak ada elemen terpotong.
- [ ] Tidak ada state (loading/empty/error) yang terlewat untuk komponen data.

Jika ada satu poin gagal, PERBAIKI dulu sebelum melapor selesai ke user. Jangan laporkan "done" kalau checklist ini belum lolos semua.

---

## 10. KETIKA RAGU

Kalau instruksi user ambigu dan berpotensi menghasilkan pattern di daftar hitam (misal: "buatin lebih menarik" yang bisa diartikan gradient/emoji), pilih interpretasi yang paling sesuai prinsip Section 1, dan sebutkan singkat asumsi yang diambil — jangan diam-diam menambahkan dekorasi generik untuk "aman".
