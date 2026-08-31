<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Kelas extends Model
{
    protected $table = 'kelas';

    protected $fillable = [
        'nama_kelas',
        'tingkat',
        'id_guru_wali',
        'jumlah_siswa',
    ];

    public function waliKelas()
    {
        return $this->belongsTo(Guru::class, 'id_guru_wali', 'id_guru');
    }
}
