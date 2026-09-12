<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('siswa_alumni', function (Blueprint $table) {
            $table->id();
            $table->string('nisn')->nullable()->index();
            $table->string('nis')->index();
            $table->string('nama')->index();
            $table->enum('jenis_kelamin', ['L', 'P'])->default('L');
            $table->enum('kategori_keluar', ['LULUS', 'KELUAR / PINDAH', 'LAINNYA'])->default('LULUS')->index();
            $table->string('tahun_masuk', 10)->nullable();
            $table->string('tahun_keluar', 10)->index(); // Contoh: '2026'
            $table->string('angkatan')->nullable(); // Contoh: 'Angkatan 35'
            $table->string('kelas_terakhir')->nullable(); // Contoh: 'XII MIPA 1'
            $table->string('no_ijazah')->nullable();
            $table->text('alasan_keluar')->nullable();
            $table->string('sekolah_tujuan')->nullable();
            $table->string('no_hp')->nullable();
            $table->string('no_hp_ortu')->nullable();
            $table->text('catatan')->nullable();
            $table->timestamps();
        });

        Schema::create('rapor_arsip_snapshot', function (Blueprint $table) {
            $table->id();
            $table->foreignId('siswa_alumni_id')->constrained('siswa_alumni')->onDelete('cascade');
            $table->longText('data_nilai_json')->nullable();
            $table->text('catatan_akademik')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rapor_arsip_snapshot');
        Schema::dropIfExists('siswa_alumni');
    }
};
