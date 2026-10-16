<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Employee extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'firstname',
        'lastname',
        'date_of_birth',
        'education_qualification',
        'address',
        'email',
        'phone',
        'photo',
        'resume',
    ];

    protected $casts = [
        'date_of_birth' => 'date:Y-m-d',
    ];

    protected function fullName(): Attribute
    {
        return Attribute::make(
            get: fn () => trim("{$this->firstname} {$this->lastname}"),
        );
    }

    protected $appends = ['full_name'];
}
