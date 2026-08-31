<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kelas', function (Blueprint $table) {
            $table->id();
            $table->string('nama_kelas')->unique(); // e.g. "X.1", "XII.8"
            $table->enum('tingkat', ['X', 'XI', 'XII']);
            $table->unsignedBigInteger('id_guru_wali')->nullable();
            $table->foreign('id_guru_wali')->references('id_guru')->on('guru')->onDelete('set null');
            $table->integer('jumlah_siswa')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kelas');
    }
};
