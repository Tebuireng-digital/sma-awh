<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Log Mutasi Barang (Masuk / Keluar)
        if (!Schema::hasTable('sarana_mutasi')) {
            Schema::create('sarana_mutasi', function (Blueprint $table) {
                $table->id();
                $table->foreignId('inventaris_id')->constrained('inventaris_barang')->onDelete('cascade');
                $table->enum('jenis', ['Masuk', 'Keluar'])->default('Masuk');
                $table->integer('jumlah')->default(1);
                $table->date('tanggal');
                $table->string('keterangan')->nullable();
                $table->timestamps();
            });
        }

        // Log Perawatan Barang / Maintenance
        if (!Schema::hasTable('sarana_perawatan')) {
            Schema::create('sarana_perawatan', function (Blueprint $table) {
                $table->id();
                $table->foreignId('inventaris_id')->constrained('inventaris_barang')->onDelete('cascade');
                $table->string('jenis_perawatan');
                $table->decimal('biaya', 12, 2)->default(0);
                $table->string('teknisi')->default('Teknisi Sekolah');
                $table->date('tgl_perawatan');
                $table->enum('status', ['Proses', 'Selesai'])->default('Proses');
                $table->timestamps();
            });
        }

        // Pengajuan Penghapusan Barang (Write-Off Aset)
        if (!Schema::hasTable('sarana_penghapusan')) {
            Schema::create('sarana_penghapusan', function (Blueprint $table) {
                $table->id();
                $table->foreignId('inventaris_id')->constrained('inventaris_barang')->onDelete('cascade');
                $table->integer('jumlah')->default(1);
                $table->text('alasan');
                $table->enum('status_ktu', ['Pending', 'Disetujui', 'Ditolak'])->default('Pending');
                $table->enum('status_kepsek', ['Pending', 'Disetujui', 'Ditolak'])->default('Pending');
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('sarana_penghapusan');
        Schema::dropIfExists('sarana_perawatan');
        Schema::dropIfExists('sarana_mutasi');
    }
};
