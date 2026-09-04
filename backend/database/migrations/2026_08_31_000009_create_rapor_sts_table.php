<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rapor_sts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('siswa_id')->constrained('siswa')->onDelete('cascade');
            $table->string('tahun_ajaran')->default('2026/2027');
            $table->enum('semester', ['Ganjil', 'Genap'])->default('Ganjil');
            
            // 21 Subjects matching RAPOR STS X-1.docx
            $table->integer('nilai_pai')->default(0);
            $table->integer('nilai_ppkn')->default(0);
            $table->integer('nilai_indo')->default(0);
            $table->integer('nilai_mtk')->default(0);
            $table->integer('nilai_inggris')->default(0);
            $table->integer('nilai_seni')->default(0);
            $table->integer('nilai_penjas')->default(0);
            $table->integer('nilai_informa')->default(0);
            $table->integer('nilai_sejarah')->default(0);
            $table->integer('nilai_biologi')->default(0);
            $table->integer('nilai_fisika')->default(0);
            $table->integer('nilai_kimia')->default(0);
            $table->integer('nilai_geografi')->default(0);
            $table->integer('nilai_sosiologi')->default(0);
            $table->integer('nilai_ekonomi')->default(0);
            $table->integer('nilai_pkwu')->default(0);
            $table->integer('nilai_alquran')->default(0);
            $table->integer('nilai_akhlaq')->default(0);
            $table->integer('nilai_fiqih')->default(0);
            $table->integer('nilai_nahwu')->default(0);
            $table->integer('nilai_aswaja')->default(0);
            
            $table->integer('kktp')->default(75);
            $table->integer('jumlah')->default(0);
            $table->float('rata_rata', 8, 2)->default(0.00);
            $table->text('catatan_wali_kelas')->nullable();
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rapor_sts');
    }
};
