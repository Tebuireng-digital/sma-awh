<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Siswa extends Model
{
    protected $table = 'siswa';

    protected $fillable = [
        'nis',
        'nisn',
        'nama',
        'jenis_kelamin',
        'tanggal_lahir',
        'no_hp_ortu',
        'nama_wali',
        'status_aktif',
    ];

    protected $casts = [
        'status_aktif' => 'boolean',
    ];
}
