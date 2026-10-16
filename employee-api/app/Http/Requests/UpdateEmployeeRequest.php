<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateEmployeeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $employeeId = $this->route('employee')->id;

        return [
            'employee_id'             => ['sometimes', 'string', 'max:50', Rule::unique('employees', 'employee_id')->ignore($employeeId), 'regex:/^[A-Za-z0-9\-_]+$/'],
            'firstname'               => ['sometimes', 'string', 'max:100'],
            'lastname'                => ['sometimes', 'string', 'max:100'],
            'date_of_birth'           => ['sometimes', 'date', 'before:today'],
            'education_qualification' => ['sometimes', 'string', 'max:255'],
            'address'                 => ['sometimes', 'string', 'max:1000'],
            'email'                   => ['sometimes', 'email', 'max:255', Rule::unique('employees', 'email')->ignore($employeeId)],
            'phone'                   => ['sometimes', 'string', 'max:20', 'regex:/^[0-9\+\-\s\(\)]+$/'],
            'photo'                   => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'resume'                  => ['nullable', 'file', 'mimes:pdf,doc,docx', 'max:5120'],
        ];
    }

    public function messages(): array
    {
        return [
            'employee_id.unique' => 'This Employee ID is already in use by another employee.',
            'email.unique'       => 'This email address is already registered to another employee.',
            'date_of_birth.before' => 'Date of birth must be in the past.',
            'photo.mimes'        => 'Photo must be a JPG, PNG, or WebP image.',
            'photo.max'          => 'Photo may not exceed 2 MB.',
            'resume.mimes'       => 'Resume must be a PDF, DOC, or DOCX file.',
            'resume.max'         => 'Resume may not exceed 5 MB.',
            'phone.regex'        => 'Phone number may only contain digits, spaces, +, -, (, ).',
        ];
    }
}
