<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pegawai', function (Blueprint $table) {
            if (!Schema::hasColumn('pegawai', 'tgl_masuk')) {
                $table->date('tgl_masuk')->nullable()->after('status_kepegawaian');
            }
            if (!Schema::hasColumn('pegawai', 'pendidikan')) {
                $table->string('pendidikan')->nullable()->after('tgl_masuk');
            }
            if (!Schema::hasColumn('pegawai', 'gaji_pokok')) {
                $table->decimal('gaji_pokok', 12, 2)->nullable()->after('pendidikan');
            }
            if (!Schema::hasColumn('pegawai', 'tunjangan')) {
                $table->decimal('tunjangan', 12, 2)->nullable()->after('gaji_pokok');
            }
            if (!Schema::hasColumn('pegawai', 'no_sk_terakhir')) {
                $table->string('no_sk_terakhir')->nullable()->after('tunjangan');
            }
        });

        // Table Riwayat Jabatan & SK
        if (!Schema::hasTable('pegawai_riwayat_jabatan')) {
            Schema::create('pegawai_riwayat_jabatan', function (Blueprint $table) {
                $table->id();
                $table->foreignId('pegawai_id')->constrained('pegawai')->onDelete('cascade');
                $table->string('jabatan');
                $table->string('no_sk')->nullable();
                $table->date('tgl_sk')->nullable();
                $table->string('keterangan')->nullable();
                $table->timestamps();
            });
        }

        // Table Penilaian Kinerja
        if (!Schema::hasTable('pegawai_penilaian_kinerja')) {
            Schema::create('pegawai_penilaian_kinerja', function (Blueprint $table) {
                $table->id();
                $table->foreignId('pegawai_id')->constrained('pegawai')->onDelete('cascade');
                $table->string('periode')->default('Semester Ganjil 2026/2027');
                $table->integer('skor_kinerja')->default(85);
                $table->enum('predikat', ['Sangat Baik', 'Baik', 'Cukup', 'Kurang'])->default('Baik');
                $table->text('catatan_evaluasi')->nullable();
                $table->string('penilai')->default('Kepala TU & Kepsek');
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('pegawai_penilaian_kinerja');
        Schema::dropIfExists('pegawai_riwayat_jabatan');
        Schema::table('pegawai', function (Blueprint $table) {
            $table->dropColumn(['tgl_masuk', 'pendidikan', 'gaji_pokok', 'tunjangan', 'no_sk_terakhir']);
        });
    }
};
