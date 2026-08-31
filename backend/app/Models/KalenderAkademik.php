<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KalenderAkademik extends Model
{
    protected $table = 'kalender_akademik';

    protected $fillable = [
        'tahun_ajaran_id',
        'sumber_kalender',
        'jenis_hari',
        'tanggal',
        'keterangan',
        'is_libur',
        'is_acara_pondok',
    ];

    protected $casts = [
        'is_libur' => 'boolean',
        'is_acara_pondok' => 'boolean',
    ];

    public function tahunAjaran()
    {
        return $this->belongsTo(TahunAjaran::class, 'tahun_ajaran_id');
    }
}
