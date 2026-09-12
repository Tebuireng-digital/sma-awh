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
            if (!Schema::hasColumn('humas_konten', 'pinned_at')) {
                $table->timestamp('pinned_at')->nullable()->after('is_pinned')->index();
            }
        });

        // Pastikan maksimal 3 konten yang disematkan (is_pinned = 1).
        // Ambil semua konten yang saat ini is_pinned = 1 diurutkan dari yang terbaru.
        $pinnedItems = DB::table('humas_konten')
            ->where('is_pinned', 1)
            ->orderBy('updated_at', 'desc')
            ->orderBy('id', 'desc')
            ->get();

        $count = 0;
        foreach ($pinnedItems as $item) {
            $count++;
            if ($count <= 3) {
                // Tetap disematkan dan set pinned_at
                DB::table('humas_konten')
                    ->where('id', $item->id)
                    ->update([
                        'pinned_at' => $item->updated_at ?? now(),
                    ]);
            } else {
                // Kelebihan dari kuota 3: otomatis lepas pin (unpin yang terlama)
                DB::table('humas_konten')
                    ->where('id', $item->id)
                    ->update([
                        'is_pinned' => 0,
                        'pinned_at' => null,
                    ]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('humas_konten', function (Blueprint $table) {
            if (Schema::hasColumn('humas_konten', 'pinned_at')) {
                $table->dropColumn('pinned_at');
            }
        });
    }
};
