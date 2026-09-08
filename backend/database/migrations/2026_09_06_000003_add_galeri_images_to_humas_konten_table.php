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
        Schema::table('humas_konten', function (Blueprint $table) {
            if (!Schema::hasColumn('humas_konten', 'galeri_images')) {
                $table->text('galeri_images')->nullable()->after('local_image_path');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('humas_konten', function (Blueprint $table) {
            if (Schema::hasColumn('humas_konten', 'galeri_images')) {
                $table->dropColumn('galeri_images');
            }
        });
    }
};
