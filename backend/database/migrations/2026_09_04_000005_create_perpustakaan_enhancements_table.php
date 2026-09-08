<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('buku_perpustakaan', function (Blueprint $table) {
            if (!Schema::hasColumn('buku_perpustakaan', 'isbn')) {
                $table->string('isbn')->nullable()->after('penerbit');
            }
            if (!Schema::hasColumn('buku_perpustakaan', 'kategori')) {
                $table->string('kategori')->default('Umum')->after('isbn');
            }
            if (!Schema::hasColumn('buku_perpustakaan', 'lokasi_rak')) {
                $table->string('lokasi_rak')->default('Rak Utama')->after('kategori');
            }
        });

        Schema::table('peminjaman_buku', function (Blueprint $table) {
            if (!Schema::hasColumn('peminjaman_buku', 'status_denda')) {
                $table->string('status_denda')->default('Tidak Ada')->after('denda');
            }
            if (!Schema::hasColumn('peminjaman_buku', 'catatan')) {
                $table->text('catatan')->nullable()->after('status_denda');
            }
        });

        if (!Schema::hasTable('kunjungan_perpustakaan')) {
            Schema::create('kunjungan_perpustakaan', function (Blueprint $table) {
                $table->id();
                $table->foreignId('siswa_id')->constrained('siswa')->onDelete('cascade');
                $table->date('tanggal');
                $table->string('jam_masuk')->default('08:00');
                $table->string('tujuan')->default('Membaca Buku');
                $table->text('catatan')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('kunjungan_perpustakaan');
    }
};
