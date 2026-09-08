<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('rapor_sts', function (Blueprint $table) {
            $table->enum('status_validasi', ['draft', 'submitted_by_guru', 'approved_by_walikelas', 'approved_by_kepsek'])->default('draft')->after('catatan_wali_kelas');
            $table->timestamp('ttd_walikelas')->nullable()->after('status_validasi');
            $table->timestamp('ttd_kepsek')->nullable()->after('ttd_walikelas');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rapor_sts', function (Blueprint $table) {
            $table->dropColumn(['status_validasi', 'ttd_walikelas', 'ttd_kepsek']);
        });
    }
};
