<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('presensi_rekap_semester', function (Blueprint $table) {
            $table->id();
            $table->foreignId('siswa_id')->constrained('siswa')->onDelete('cascade');
            $table->foreignId('tahun_ajaran_id')->nullable()->constrained('tahun_ajaran')->onDelete('set null');
            $table->enum('semester', ['GANJIL', 'GENAP'])->default('GANJIL');
            $table->integer('hadir')->default(0);
            $table->integer('sakit')->default(0);
            $table->integer('izin')->default(0);
            $table->integer('alpa')->default(0);
            $table->integer('terlambat')->default(0);
            $table->integer('dispensasi')->default(0);
            $table->decimal('persentase_kehadiran', 5, 2)->default(100.00);
            $table->timestamp('terakhir_dihitung')->nullable();
            $table->timestamps();

            $table->unique(['siswa_id', 'tahun_ajaran_id', 'semester'], 'unique_rekap_presensi_semester');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('presensi_rekap_semester');
    }
};
