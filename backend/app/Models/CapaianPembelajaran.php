<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CapaianPembelajaran extends Model
{
    protected $table = 'capaian_pembelajaran';

    protected $fillable = [
        'mapel_id',
        'fase',
        'tingkat',
        'elemen',
        'deskripsi_cp',
    ];

    public function tujuanPembelajaran()
    {
        return $this->hasMany(TujuanPembelajaran::class, 'cp_id');
    }
}
