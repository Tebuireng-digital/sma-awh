<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Guru extends Model
{
    protected $table = 'guru';

    protected $fillable = [
        'id_guru',
        'nama_lengkap',
        'pendidikan_terakhir',
        'no_hp',
        'status_aktif',
    ];

    protected $casts = [
        'status_aktif' => 'boolean',
    ];

    public function user()
    {
        return $this->hasOne(User::class, 'id_guru', 'id_guru');
    }
}
