<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('humas_konten', function (Blueprint $table) {
            if (!Schema::hasColumn('humas_konten', 'is_public')) {
                $table->boolean('is_public')->default(true)->after('is_pinned')->index();
            }
        });

        // Set existing 'Aset Web' or internal assets to is_public = false (0)
        // so they don't pollute the main public news page (/berita)
        DB::table('humas_konten')
            ->where('kategori', 'Aset Web')
            ->orWhere('slug', 'like', 'aset-%')
            ->update(['is_public' => 0]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('humas_konten', function (Blueprint $table) {
            if (Schema::hasColumn('humas_konten', 'is_public')) {
                $table->dropColumn('is_public');
            }
        });
    }
};
