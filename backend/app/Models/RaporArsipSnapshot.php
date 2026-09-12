<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RaporArsipSnapshot extends Model
{
    protected $table = 'rapor_arsip_snapshot';

    protected $fillable = [
        'siswa_alumni_id',
        'data_nilai_json',
        'catatan_akademik',
    ];

    protected $casts = [
        'data_nilai_json' => 'array',
    ];

    public function alumni()
    {
        return $this->belongsTo(SiswaAlumni::class, 'siswa_alumni_id');
    }
}
