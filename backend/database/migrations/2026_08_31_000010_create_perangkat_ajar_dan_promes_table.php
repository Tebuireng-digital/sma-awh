<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('capaian_pembelajaran', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mapel_id')->constrained('mata_pelajaran')->onDelete('cascade');
            $table->enum('fase', ['E', 'F'])->default('E');
            $table->enum('tingkat', ['X', 'XI', 'XII'])->default('X');
            $table->string('elemen');
            $table->text('deskripsi_cp');
            $table->timestamps();
        });

        Schema::create('tujuan_pembelajaran', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cp_id')->constrained('capaian_pembelajaran')->onDelete('cascade');
            $table->string('kode_tp'); // e.g. "TP-BIO-10.1"
            $table->text('deskripsi_tp');
            $table->integer('alokasi_jp')->default(2);
            $table->integer('urutan')->default(1);
            $table->timestamps();
        });

        Schema::create('program_tahunan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tahun_ajaran_id')->constrained('tahun_ajaran')->onDelete('cascade');
            $table->foreignId('mapel_id')->constrained('mata_pelajaran')->onDelete('cascade');
            $table->enum('tingkat', ['X', 'XI', 'XII']);
            $table->integer('total_jp')->default(72);
            $table->timestamps();
        });

        Schema::create('program_semester', function (Blueprint $table) {
            $table->id();
            $table->foreignId('prota_id')->constrained('program_tahunan')->onDelete('cascade');
            $table->foreignId('semester_id')->constrained('semester')->onDelete('cascade');
            $table->foreignId('tp_id')->constrained('tujuan_pembelajaran')->onDelete('cascade');
            $table->integer('bulan')->default(7); // 1-12
            $table->integer('minggu_ke')->default(1); // 1-5
            $table->integer('target_jp')->default(2);
            $table->boolean('status_selesai')->default(false);
            $table->timestamps();
        });

        Schema::create('kalender_akademik', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tahun_ajaran_id')->default(1)->constrained('tahun_ajaran')->onDelete('cascade');
            $table->enum('sumber_kalender', ['kemenag_dinas', 'sekolah_pondok'])->default('kemenag_dinas');
            $table->enum('jenis_hari', ['efektif', 'libur_nasional', 'libur_pondok', 'ujian_asesmen', 'kegiatan_sekolah', 'kegiatan_pondok'])->default('libur_nasional');
            $table->date('tanggal');
            $table->string('keterangan');
            $table->boolean('is_libur')->default(true);
            $table->boolean('is_acara_pondok')->default(false);
            $table->timestamps();

            $table->unique(['tahun_ajaran_id', 'tanggal']);
        });

        Schema::table('jurnal_mengajar', function (Blueprint $table) {
            $table->unsignedBigInteger('tp_id')->nullable()->after('presensi_guru_id');
            $table->unsignedBigInteger('promes_id')->nullable()->after('tp_id');
            $table->enum('status_ketercapaian', ['tercapai', 'tertunda', 'remedial'])->default('tercapai')->after('tugas_mandiri');

            $table->foreign('tp_id')->references('id')->on('tujuan_pembelajaran')->onDelete('set null');
            $table->foreign('promes_id')->references('id')->on('program_semester')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('jurnal_mengajar', function (Blueprint $table) {
            $table->dropForeign(['promes_id']);
            $table->dropForeign(['tp_id']);
            $table->dropColumn(['tp_id', 'promes_id', 'status_ketercapaian']);
        });

        Schema::dropIfExists('kalender_akademik');
        Schema::dropIfExists('program_semester');
        Schema::dropIfExists('program_tahunan');
        Schema::dropIfExists('tujuan_pembelajaran');
        Schema::dropIfExists('capaian_pembelajaran');
    }
};
