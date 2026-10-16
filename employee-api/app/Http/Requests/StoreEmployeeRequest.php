<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEmployeeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'employee_id'             => ['required', 'string', 'max:50', 'unique:employees,employee_id', 'regex:/^[A-Za-z0-9\-_]+$/'],
            'firstname'               => ['required', 'string', 'max:100'],
            'lastname'                => ['required', 'string', 'max:100'],
            'date_of_birth'           => ['required', 'date', 'before:today'],
            'education_qualification' => ['required', 'string', 'max:255'],
            'address'                 => ['required', 'string', 'max:1000'],
            'email'                   => ['required', 'email', 'max:255', 'unique:employees,email'],
            'phone'                   => ['required', 'string', 'max:20', 'regex:/^[0-9\+\-\s\(\)]+$/'],
            'photo'                   => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'resume'                  => ['nullable', 'file', 'mimes:pdf,doc,docx', 'max:5120'],
        ];
    }

    public function messages(): array
    {
        return [
            'employee_id.unique'   => 'This Employee ID is already in use.',
            'employee_id.regex'    => 'Employee ID may only contain letters, numbers, hyphens, and underscores.',
            'email.unique'         => 'This email address is already registered to another employee.',
            'date_of_birth.before' => 'Date of birth must be in the past.',
            'photo.mimes'          => 'Photo must be a JPG, PNG, or WebP image.',
            'photo.max'            => 'Photo may not exceed 2 MB.',
            'resume.mimes'         => 'Resume must be a PDF, DOC, or DOCX file.',
            'resume.max'           => 'Resume may not exceed 5 MB.',
            'phone.regex'          => 'Phone number may only contain digits, spaces, +, -, (, ).',
        ];
    }
}
