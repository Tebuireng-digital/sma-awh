<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TujuanPembelajaran extends Model
{
    protected $table = 'tujuan_pembelajaran';

    protected $fillable = [
        'cp_id',
        'kode_tp',
        'deskripsi_tp',
        'alokasi_jp',
        'urutan',
    ];

    public function capaianPembelajaran()
    {
        return $this->belongsTo(CapaianPembelajaran::class, 'cp_id');
    }
}
