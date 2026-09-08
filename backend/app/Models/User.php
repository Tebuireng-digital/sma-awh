<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'username',
        'email',
        'password',
        'role',
        'additional_roles',
        'id_guru',
        'id_siswa',
        'no_hp',
        'must_change_password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'must_change_password' => 'boolean',
            'additional_roles' => 'array',
        ];
    }

    public function getAllRolesAttribute(): array
    {
        $roles = [$this->role];
        if (!empty($this->additional_roles)) {
            $extra = is_array($this->additional_roles) ? $this->additional_roles : json_decode($this->additional_roles, true);
            if (is_array($extra)) {
                $roles = array_merge($roles, $extra);
            }
        }
        return array_values(array_unique(array_filter($roles)));
    }

    public function hasRole(string $role): bool
    {
        return in_array($role, $this->all_roles);
    }

    public function hasAnyRole(array $roles): bool
    {
        return count(array_intersect($this->all_roles, $roles)) > 0;
    }

    public function guru()
    {
        return $this->belongsTo(Guru::class, 'id_guru', 'id_guru');
    }

    public function siswa()
    {
        return $this->belongsTo(Siswa::class, 'id_siswa', 'id');
    }
}
