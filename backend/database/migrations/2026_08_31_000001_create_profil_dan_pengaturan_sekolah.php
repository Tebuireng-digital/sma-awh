<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('profil_sekolah', function (Blueprint $table) {
            $table->id();
            $table->string('nama_sekolah')->default('SMA ABDUL WAHID HASYIM TEBUIRENG');
            $table->string('nss')->nullable();
            $table->string('izin_operasional')->nullable();
            $table->integer('luas_tanah_m2')->default(12300);
            $table->string('alamat')->nullable();
            $table->string('kecamatan')->default('Diwek');
            $table->string('kabupaten')->default('Jombang');
            $table->string('provinsi')->default('Jawa Timur');
            $table->string('kepala_sekolah')->nullable();
            $table->string('ketua_komite')->nullable();
            $table->timestamps();
        });

        Schema::create('pengaturan_sekolah', function (Blueprint $table) {
            $table->id();
            $table->decimal('latitude_sekolah', 10, 7)->default(-7.5878000);
            $table->decimal('longitude_sekolah', 10, 7)->default(112.2345000);
            $table->integer('radius_toleransi_meter')->default(1000);
            $table->integer('toleransi_terlambat_menit')->default(20);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pengaturan_sekolah');
        Schema::dropIfExists('profil_sekolah');
    }
};
