<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('presensi_murid_harian', function (Blueprint $table) {
            $table->id();
            $table->date('tanggal');
            $table->foreignId('siswa_id')->constrained('siswa')->onDelete('cascade');
            $table->enum('status', ['HADIR', 'SAKIT', 'IZIN', 'ALPA', 'TERLAMBAT', 'DISPENSASI'])->default('HADIR');
            $table->enum('jam_ke_1_status', ['HADIR', 'SAKIT', 'IZIN', 'ALPA', 'TERLAMBAT', 'DISPENSASI'])->default('HADIR');
            $table->timestamp('synced_to_simanteb_at')->nullable();
            $table->timestamps();

            $table->unique(['tanggal', 'siswa_id']);
        });

        Schema::create('presensi_murid_per_jam', function (Blueprint $table) {
            $table->id();
            $table->foreignId('presensi_guru_id')->constrained('presensi_guru')->onDelete('cascade');
            $table->foreignId('siswa_id')->constrained('siswa')->onDelete('cascade');
            $table->enum('status', ['Hadir', 'Sakit', 'Izin', 'Alpa', 'Terlambat', 'Dispensasi'])->default('Hadir');
            $table->text('keterangan')->nullable();
            $table->timestamps();

            $table->unique(['presensi_guru_id', 'siswa_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('presensi_murid_per_jam');
        Schema::dropIfExists('presensi_murid_harian');
    }
};
