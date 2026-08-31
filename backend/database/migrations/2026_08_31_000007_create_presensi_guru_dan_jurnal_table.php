<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('presensi_guru', function (Blueprint $table) {
            $table->id();
            $table->foreignId('jadwal_id')->constrained('jadwal_pelajaran')->onDelete('cascade');
            $table->unsignedBigInteger('id_guru');
            $table->foreign('id_guru')->references('id_guru')->on('guru')->onDelete('cascade');
            $table->unsignedBigInteger('id_guru_inval')->nullable();
            $table->foreign('id_guru_inval')->references('id_guru')->on('guru')->onDelete('set null');
            $table->enum('status_inval', ['tidak_inval', 'inval_diproses', 'inval_diklaim'])->default('tidak_inval');
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->integer('jarak_meter')->nullable();
            $table->enum('status_kehadiran', ['hadir', 'sakit', 'izin', 'dinas', 'alpa'])->default('hadir');
            $table->timestamp('waktu_masuk')->nullable();
            $table->timestamp('waktu_selesai')->nullable();
            $table->timestamps();
        });

        Schema::create('jurnal_mengajar', function (Blueprint $table) {
            $table->id();
            $table->foreignId('presensi_guru_id')->constrained('presensi_guru')->onDelete('cascade');
            $table->string('bab_materi');
            $table->text('catatan_kelas')->nullable();
            $table->text('tugas_mandiri')->nullable();
            $table->boolean('is_submitted')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('jurnal_mengajar');
        Schema::dropIfExists('presensi_guru');
    }
};
