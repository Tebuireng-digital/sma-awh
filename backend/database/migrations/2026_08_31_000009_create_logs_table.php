<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('log_sync_simanteb', function (Blueprint $table) {
            $table->id();
            $table->date('tanggal');
            $table->foreignId('siswa_id')->constrained('siswa')->onDelete('cascade');
            $table->string('status_harian');
            $table->json('response_api')->nullable();
            $table->enum('status_sync', ['success', 'failed'])->default('success');
            $table->timestamps();
        });

        Schema::create('log_notifikasi_wa', function (Blueprint $table) {
            $table->id();
            $table->string('penerima_type'); // 'ortu', 'guru_piket', 'guru_mapel'
            $table->string('penerima_no_hp');
            $table->string('jenis_notif'); // 'alpa', 'terlambat', 'sakit', 'inval_alert', 'jurnal_reminder'
            $table->text('isi_pesan');
            $table->enum('status', ['sent', 'failed'])->default('sent');
            $table->json('response_api')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('log_notifikasi_wa');
        Schema::dropIfExists('log_sync_simanteb');
    }
};
