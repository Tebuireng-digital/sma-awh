<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('surat')) {
            Schema::table('surat', function (Blueprint $table) {
                if (!Schema::hasColumn('surat', 'kategori')) {
                    $table->string('kategori')->default('Umum')->after('jenis');
                }
                if (!Schema::hasColumn('surat', 'kerahasiaan')) {
                    $table->enum('kerahasiaan', ['Biasa', 'Penting', 'Rahasia', 'Sangat Rahasia'])->default('Biasa')->after('kategori');
                }
                if (!Schema::hasColumn('surat', 'isi_surat')) {
                    $table->text('isi_surat')->nullable()->after('perihal');
                }
                if (!Schema::hasColumn('surat', 'lokasi_arsip')) {
                    $table->string('lokasi_arsip')->default('Box Arsip Utama')->after('file_path');
                }
                if (!Schema::hasColumn('surat', 'metadata_json')) {
                    $table->json('metadata_json')->nullable()->after('lokasi_arsip');
                }
                if (!Schema::hasColumn('surat', 'status')) {
                    $table->enum('status', ['Draft', 'Proses', 'Selesai', 'Diarsipkan'])->default('Diarsipkan')->after('metadata_json');
                }
            });
        }

        if (!Schema::hasTable('template_surat')) {
            Schema::create('template_surat', function (Blueprint $table) {
                $table->id();
                $table->string('kode_template')->unique();
                $table->string('nama_template');
                $table->string('kategori')->default('Umum');
                $table->text('format_konten');
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('template_surat');
    }
};
