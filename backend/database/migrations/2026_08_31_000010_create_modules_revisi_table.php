<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Kepegawaian
        Schema::create('pegawai', function (Blueprint $table) {
            $table->id();
            $table->string('nip')->nullable();
            $table->string('nama_lengkap');
            $table->string('jabatan')->nullable();
            $table->string('status_kepegawaian')->nullable();
            $table->string('no_hp')->nullable();
            $table->string('email')->nullable();
            $table->timestamps();
        });

        Schema::create('pengajuan_kepegawaian', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pegawai_id')->constrained('pegawai')->onDelete('cascade');
            $table->enum('jenis', ['Cuti', 'Izin', 'SK', 'Mutasi'])->default('Cuti');
            $table->text('alasan');
            $table->date('tgl_mulai');
            $table->date('tgl_selesai')->nullable();
            $table->enum('status_ktu', ['Pending', 'Disetujui', 'Ditolak'])->default('Pending');
            $table->enum('status_kepsek', ['Pending', 'Disetujui', 'Ditolak'])->default('Pending');
            $table->text('catatan')->nullable();
            $table->timestamps();
        });

        // BK Catatan
        Schema::create('bk_catatan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('siswa_id')->constrained('siswa')->onDelete('cascade');
            $table->date('tanggal');
            $table->enum('kategori', ['Konseling', 'Pelanggaran', 'Prestasi', 'Karir'])->default('Konseling');
            $table->string('judul');
            $table->text('catatan_rahasia');
            $table->string('ditangani_oleh')->default('Guru BK');
            $table->enum('status', ['Proses', 'Selesai', 'Rujukan'])->default('Proses');
            $table->timestamps();
        });

        // Sarana & Prasarana
        Schema::create('inventaris_barang', function (Blueprint $table) {
            $table->id();
            $table->string('kode_barang')->unique();
            $table->string('nama_barang');
            $table->string('kategori')->default('Aset IT');
            $table->integer('jumlah')->default(1);
            $table->enum('kondisi', ['Baik', 'Rusak Ringan', 'Rusak Berat'])->default('Baik');
            $table->string('lokasi')->default('Laboratorium');
            $table->timestamps();
        });

        Schema::create('peminjaman_inventaris', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inventaris_id')->constrained('inventaris_barang')->onDelete('cascade');
            $table->string('peminjam_nama');
            $table->string('peminjam_role')->default('Guru');
            $table->date('tgl_pinjam');
            $table->date('tgl_kembali')->nullable();
            $table->enum('status', ['Dipinjam', 'Dikembalikan'])->default('Dipinjam');
            $table->timestamps();
        });

        // Persuratan
        Schema::create('surat', function (Blueprint $table) {
            $table->id();
            $table->string('no_surat')->unique();
            $table->enum('jenis', ['Surat Masuk', 'Surat Keluar'])->default('Surat Keluar');
            $table->string('perihal');
            $table->string('pengirim_penerima');
            $table->date('tanggal');
            $table->string('file_path')->nullable();
            $table->timestamps();
        });

        // Humas & Branding
        Schema::create('humas_konten', function (Blueprint $table) {
            $table->id();
            $table->string('judul');
            $table->enum('kategori', ['Berita', 'Galeri', 'Pengumuman'])->default('Berita');
            $table->text('isi');
            $table->string('image_url')->nullable();
            $table->enum('status', ['Draft', 'Pending Approval', 'Published'])->default('Draft');
            $table->timestamps();
        });

        // Perpustakaan
        Schema::create('buku_perpustakaan', function (Blueprint $table) {
            $table->id();
            $table->string('kode_buku')->unique();
            $table->string('judul');
            $table->string('pengarang');
            $table->string('penerbit')->nullable();
            $table->integer('stok')->default(1);
            $table->timestamps();
        });

        Schema::create('peminjaman_buku', function (Blueprint $table) {
            $table->id();
            $table->foreignId('buku_id')->constrained('buku_perpustakaan')->onDelete('cascade');
            $table->foreignId('siswa_id')->constrained('siswa')->onDelete('cascade');
            $table->date('tgl_pinjam');
            $table->date('tgl_tenggat');
            $table->date('tgl_kembali')->nullable();
            $table->integer('denda')->default(0);
            $table->enum('status', ['Dipinjam', 'Dikembalikan'])->default('Dipinjam');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('peminjaman_buku');
        Schema::dropIfExists('buku_perpustakaan');
        Schema::dropIfExists('humas_konten');
        Schema::dropIfExists('surat');
        Schema::dropIfExists('peminjaman_inventaris');
        Schema::dropIfExists('inventaris_barang');
        Schema::dropIfExists('bk_catatan');
        Schema::dropIfExists('pengajuan_kepegawaian');
        Schema::dropIfExists('pegawai');
    }
};
