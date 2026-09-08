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
            if (!Schema::hasColumn('humas_konten', 'is_pinned')) {
                $table->boolean('is_pinned')->default(false)->after('status')->index();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('humas_konten', function (Blueprint $table) {
            if (Schema::hasColumn('humas_konten', 'is_pinned')) {
                $table->dropColumn('is_pinned');
            }
        });
    }
};
