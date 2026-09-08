<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('siswa', function (Blueprint $table) {
            if (!Schema::hasColumn('siswa', 'nisn')) {
                $table->string('nisn')->nullable()->after('nis');
            }
            if (!Schema::hasColumn('siswa', 'tanggal_lahir')) {
                $table->date('tanggal_lahir')->nullable()->after('jenis_kelamin');
            }
            if (!Schema::hasColumn('siswa', 'nama_wali')) {
                $table->string('nama_wali')->nullable()->after('no_hp_ortu');
            }
        });

        // Seed default NISN & tanggal lahir for sample data
        DB::table('siswa')->where('id', 1)->update([
            'nisn' => '0081234567',
            'tanggal_lahir' => '2008-05-15',
            'nama_wali' => 'H. Safii Al-Faruq'
        ]);

        // Auto-generate realistic NISN and sample birthdate for any other existing students without NISN
        $students = DB::table('siswa')->whereNull('nisn')->orWhere('nisn', '')->get();
        foreach ($students as $index => $s) {
            $generatedNisn = '008' . str_pad((string)($s->nis ?? ($index + 10000)), 7, '0', STR_PAD_LEFT);
            DB::table('siswa')->where('id', $s->id)->update([
                'nisn' => $generatedNisn,
                'tanggal_lahir' => $s->tanggal_lahir ?? '2008-01-01',
                'nama_wali' => $s->nama_wali ?? 'Orang Tua / Wali Murid'
            ]);
        }
    }

    public function down(): void
    {
        Schema::table('siswa', function (Blueprint $table) {
            if (Schema::hasColumn('siswa', 'nisn')) {
                $table->dropColumn('nisn');
            }
            if (Schema::hasColumn('siswa', 'tanggal_lahir')) {
                $table->dropColumn('tanggal_lahir');
            }
            if (Schema::hasColumn('siswa', 'nama_wali')) {
                $table->dropColumn('nama_wali');
            }
        });
    }
};
