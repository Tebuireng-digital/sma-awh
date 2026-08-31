<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProgramTahunan extends Model
{
    protected $table = 'program_tahunan';

    protected $fillable = [
        'tahun_ajaran_id',
        'mapel_id',
        'tingkat',
        'total_jp',
    ];
}
