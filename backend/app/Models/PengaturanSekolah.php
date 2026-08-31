<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PengaturanSekolah extends Model
{
    protected $table = 'pengaturan_sekolah';

    protected $fillable = [
        'latitude_sekolah',
        'longitude_sekolah',
        'radius_toleransi_meter',
        'toleransi_terlambat_menit',
        'wa_bot_enabled',
        'wa_gateway_url',
        'wa_gateway_key',
    ];

    protected $casts = [
        'latitude_sekolah' => 'float',
        'longitude_sekolah' => 'float',
        'radius_toleransi_meter' => 'integer',
        'toleransi_terlambat_menit' => 'integer',
        'wa_bot_enabled' => 'boolean',
    ];
}
