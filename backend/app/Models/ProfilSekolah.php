<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProfilSekolah extends Model
{
    protected $table = 'profil_sekolah';

    protected $fillable = [
        'nama_sekolah',
        'nss',
        'izin_operasional',
        'luas_tanah_m2',
        'alamat',
        'kecamatan',
        'kabupaten',
        'provinsi',
        'kepala_sekolah',
        'ketua_komite',
    ];
}
