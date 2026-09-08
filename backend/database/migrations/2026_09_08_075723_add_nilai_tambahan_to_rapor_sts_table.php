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
            $table->json('nilai_tambahan')->nullable()->after('nilai_aswaja');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rapor_sts', function (Blueprint $table) {
            $table->dropColumn('nilai_tambahan');
        });
    }
};
