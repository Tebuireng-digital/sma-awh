<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiswaAlumni extends Model
{
    protected $table = 'siswa_alumni';

    protected $fillable = [
        'nisn',
        'nis',
        'nama',
        'jenis_kelamin',
        'kategori_keluar',
        'tahun_masuk',
        'tahun_keluar',
        'angkatan',
        'kelas_terakhir',
        'no_ijazah',
        'alasan_keluar',
        'sekolah_tujuan',
        'no_hp',
        'no_hp_ortu',
        'catatan',
    ];

    public function snapshotRapor()
    {
        return $this->hasOne(RaporArsipSnapshot::class, 'siswa_alumni_id');
    }
}
