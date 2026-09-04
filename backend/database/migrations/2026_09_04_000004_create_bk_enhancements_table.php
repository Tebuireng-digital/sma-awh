<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Prestasi Siswa
        Schema::create('bk_prestasi', function (Blueprint $table) {
            $table->id();
            $table->foreignId('siswa_id')->constrained('siswa')->onDelete('cascade');
            $table->string('nama_prestasi');
            $table->string('tingkat')->default('Provinsi'); // Kota/Kabupaten, Provinsi, Nasional, Internasional
            $table->string('peringkat')->default('Juara 1');
            $table->string('penyelenggara')->nullable();
            $table->date('tanggal');
            $table->text('catatan')->nullable();
            $table->timestamps();
        });

        // 2. Pelanggaran & Kelola Kasus Siswa
        Schema::create('bk_pelanggaran', function (Blueprint $table) {
            $table->id();
            $table->foreignId('siswa_id')->constrained('siswa')->onDelete('cascade');
            $table->string('jenis_pelanggaran');
            $table->enum('kategori_bobot', ['Ringan', 'Sedang', 'Berat'])->default('Ringan');
            $table->integer('poin')->default(10);
            $table->date('tanggal');
            $table->string('tindakan_penanganan')->nullable();
            $table->enum('status_kasus', ['Dalam Penanganan BK', 'Panggilan Orang Tua', 'SP1', 'SP2', 'Selesai'])->default('Dalam Penanganan BK');
            $table->text('catatan_rahasia')->nullable(); // Akses khusus Guru BK, Kepsek, Waka Kesiswaan
            $table->string('status_publik')->default('Sedang ditangani BK'); // Untuk Guru / Wali Kelas
            $table->timestamps();
        });

        // 3. Tracing Study, Rencana Studi Lanjut & Bimbingan Karir
        Schema::create('bk_studi_lanjut', function (Blueprint $table) {
            $table->id();
            $table->foreignId('siswa_id')->constrained('siswa')->onDelete('cascade');
            $table->string('tahun_lulus')->nullable();
            $table->string('pilihan_karir')->default('Kuliah PTN'); // Kuliah PTN, Kuliah PTS, Kerja, Wirausaha, Pesantren
            $table->string('target_universitas_perusahaan')->nullable();
            $table->string('jurusan_diminati')->nullable();
            $table->string('status_tracing')->default('Terdata'); // Terdata, Diterima PTN, Bekerja, Belum Terdata
            $table->text('catatan_bimbingan_karir')->nullable();
            $table->timestamps();
        });

        // 4. Rekap Absensi Khusus BK (Alpa/Bolos)
        Schema::create('bk_absensi', function (Blueprint $table) {
            $table->id();
            $table->foreignId('siswa_id')->constrained('siswa')->onDelete('cascade');
            $table->date('tanggal');
            $table->enum('status_absensi', ['Hadir', 'Izin', 'Sakit', 'Alpa', 'Membolos'])->default('Alpa');
            $table->string('keterangan')->nullable();
            $table->boolean('ditindaklanjuti_bk')->default(false);
            $table->timestamps();
        });

        // 5. Tambah kolom status_publik ke bk_catatan jika ada
        if (Schema::hasTable('bk_catatan') && !Schema::hasColumn('bk_catatan', 'status_publik')) {
            Schema::table('bk_catatan', function (Blueprint $table) {
                $table->string('status_publik')->default('Sedang ditangani BK')->after('status');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('bk_absensi');
        Schema::dropIfExists('bk_studi_lanjut');
        Schema::dropIfExists('bk_pelanggaran');
        Schema::dropIfExists('bk_prestasi');
    }
};
