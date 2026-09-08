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
            if (!Schema::hasColumn('humas_konten', 'slug')) {
                $table->string('slug')->nullable()->after('judul');
            }
            if (!Schema::hasColumn('humas_konten', 'ringkasan')) {
                $table->text('ringkasan')->nullable()->after('kategori');
            }
            if (!Schema::hasColumn('humas_konten', 'platform_target')) {
                $table->string('platform_target')->default('Website')->after('ringkasan');
            }
            if (!Schema::hasColumn('humas_konten', 'local_image_path')) {
                $table->string('local_image_path')->nullable()->after('image_url');
            }
            if (!Schema::hasColumn('humas_konten', 'catatan_revisi')) {
                $table->text('catatan_revisi')->nullable()->after('status');
            }
            if (!Schema::hasColumn('humas_konten', 'source_url')) {
                $table->string('source_url')->nullable()->after('catatan_revisi');
            }
            if (!Schema::hasColumn('humas_konten', 'external_id')) {
                $table->string('external_id')->nullable()->after('source_url');
            }
            if (!Schema::hasColumn('humas_konten', 'author')) {
                $table->string('author')->default('Humas SMA AWH')->after('external_id');
            }
            if (!Schema::hasColumn('humas_konten', 'published_at')) {
                $table->timestamp('published_at')->nullable()->after('author');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('humas_konten', function (Blueprint $table) {
            $columns = [
                'slug', 'ringkasan', 'platform_target', 'local_image_path',
                'catatan_revisi', 'source_url', 'external_id', 'author', 'published_at'
            ];
            foreach ($columns as $column) {
                if (Schema::hasColumn('humas_konten', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
