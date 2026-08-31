<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProgramSemester extends Model
{
    protected $table = 'program_semester';

    protected $fillable = [
        'prota_id',
        'semester_id',
        'tp_id',
        'bulan',
        'minggu_ke',
        'target_jp',
        'status_selesai',
    ];

    protected $casts = [
        'status_selesai' => 'boolean',
    ];

    public function tp()
    {
        return $this->belongsTo(TujuanPembelajaran::class, 'tp_id');
    }
}
