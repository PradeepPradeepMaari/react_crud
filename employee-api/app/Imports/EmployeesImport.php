<?php

namespace App\Imports;

use App\Models\Employee;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class EmployeesImport implements ToCollection, WithHeadingRow
{
    private array $imported = [];
    private array $skipped  = [];
    private array $errors   = [];

    private array $seenEmails      = [];
    private array $seenEmployeeIds = [];

    public function collection(Collection $rows): void
    {
        foreach ($rows as $index => $row) {
            $rowNumber = $index + 2;

            $data = $this->normaliseRow($row->toArray());

            $validator = $this->makeValidator($data, $rowNumber);

            if ($validator->fails()) {
                $this->skipped[] = $rowNumber;
                $this->errors[]  = [
                    'row'    => $rowNumber,
                    'errors' => $this->flattenErrors($validator->errors()->toArray()),
                ];
                continue;
            }

            $validated = $validator->validated();

            $email      = strtolower(trim($validated['email']));
            $employeeId = trim($validated['employee_id']);

            if (in_array($email, $this->seenEmails, true)) {
                $this->skipped[] = $rowNumber;
                $this->errors[]  = [
                    'row'    => $rowNumber,
                    'errors' => ["Email '{$validated['email']}' appears more than once in the import file."],
                ];
                continue;
            }

            if (in_array($employeeId, $this->seenEmployeeIds, true)) {
                $this->skipped[] = $rowNumber;
                $this->errors[]  = [
                    'row'    => $rowNumber,
                    'errors' => ["Employee ID '{$employeeId}' appears more than once in the import file."],
                ];
                continue;
            }

            if (Employee::where('email', $email)->exists()) {
                $this->skipped[] = $rowNumber;
                $this->errors[]  = [
                    'row'    => $rowNumber,
                    'errors' => ["Email '{$validated['email']}' already exists in the database (skipped)."],
                ];
                continue;
            }

            if (Employee::where('employee_id', $employeeId)->exists()) {
                $this->skipped[] = $rowNumber;
                $this->errors[]  = [
                    'row'    => $rowNumber,
                    'errors' => ["Employee ID '{$employeeId}' already exists in the database (skipped)."],
                ];
                continue;
            }

            DB::transaction(function () use ($validated, $email, $employeeId) {
                Employee::create([
                    'employee_id'             => $employeeId,
                    'firstname'               => trim($validated['firstname']),
                    'lastname'                => trim($validated['lastname']),
                    'date_of_birth'           => $validated['date_of_birth'],
                    'education_qualification' => trim($validated['education_qualification']),
                    'address'                 => trim($validated['address']),
                    'email'                   => $email,
                    'phone'                   => trim($validated['phone']),
                ]);
            });

            $this->imported[]        = $rowNumber;
            $this->seenEmails[]      = $email;
            $this->seenEmployeeIds[] = $employeeId;
        }
    }

    public function getImported(): array { return $this->imported; }
    public function getSkipped(): array  { return $this->skipped; }
    public function getErrors(): array   { return $this->errors; }

    public function getSummary(): array
    {
        return [
            'total_rows' => count($this->imported) + count($this->skipped),
            'imported'   => count($this->imported),
            'skipped'    => count($this->skipped),
            'errors'     => $this->errors,
        ];
    }

    private function normaliseRow(array $row): array
    {
        $keyMap = [
            'first_name' => 'firstname',
            'last_name'  => 'lastname',
        ];

        $normalised = [];
        foreach ($row as $key => $value) {
            $key = $keyMap[$key] ?? $key;

            if ($key === 'phone') {
                $normalised[$key] = $this->normalisePhone($value);
                continue;
            }

            if ($key === 'date_of_birth') {
                $normalised[$key] = $this->normaliseDate($value);
                continue;
            }

            $normalised[$key] = is_string($value) ? trim($value) : $value;
        }

        return $normalised;
    }

    private function normalisePhone(mixed $value): string
    {
        if ($value === null || $value === '') {
            return '';
        }

        if (is_float($value)) {
            $str = rtrim(rtrim((string) $value, '0'), '.');
        } else {
            $str = (string) $value;
        }

        return trim($str);
    }

    private function normaliseDate(mixed $value): string
    {
        if ($value === null || $value === '') {
            return '';
        }

        if (is_int($value) || is_float($value)) {
            try {
                $dt = \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject((float) $value);
                return $dt->format('Y-m-d');
            } catch (\Throwable $e) {
            }
        }

        $str = trim((string) $value);

        if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $str)) {
            return $str;
        }

        try {
            return \Carbon\Carbon::parse($str)->format('Y-m-d');
        } catch (\Throwable $e) {
            return $str;
        }
    }

    private function makeValidator(array $data, int $rowNumber): \Illuminate\Validation\Validator
    {
        return Validator::make($data, [
            'employee_id'             => ['required', 'string', 'max:50', 'regex:/^[A-Za-z0-9\-_]+$/'],
            'firstname'               => ['required', 'string', 'max:100'],
            'lastname'                => ['required', 'string', 'max:100'],
            'date_of_birth'           => ['required', 'date_format:Y-m-d', 'before:today'],
            'education_qualification' => ['required', 'string', 'max:255'],
            'address'                 => ['required', 'string', 'max:1000'],
            'email'                   => ['required', 'email', 'max:255'],
            'phone'                   => ['required', 'string', 'max:20', 'regex:/^[0-9\+\-\s\(\)]+$/'],
        ], [
            'employee_id.required'             => "Row {$rowNumber}: Employee ID is required.",
            'employee_id.regex'                => "Row {$rowNumber}: Employee ID may only contain letters, numbers, hyphens, and underscores.",
            'firstname.required'               => "Row {$rowNumber}: First name is required.",
            'lastname.required'                => "Row {$rowNumber}: Last name is required.",
            'date_of_birth.required'           => "Row {$rowNumber}: Date of birth is required.",
            'date_of_birth.date_format'        => "Row {$rowNumber}: Date of birth must be in YYYY-MM-DD format (e.g. 1990-05-15).",
            'date_of_birth.before'             => "Row {$rowNumber}: Date of birth must be in the past.",
            'education_qualification.required' => "Row {$rowNumber}: Education qualification is required.",
            'address.required'                 => "Row {$rowNumber}: Address is required.",
            'email.required'                   => "Row {$rowNumber}: Email is required.",
            'email.email'                      => "Row {$rowNumber}: Email is not a valid email address.",
            'phone.required'                   => "Row {$rowNumber}: Phone is required.",
            'phone.string'                     => "Row {$rowNumber}: Phone must be a string.",
            'phone.regex'                      => "Row {$rowNumber}: Phone may only contain digits, spaces, +, -, (, ).",
        ]);
    }

    private function flattenErrors(array $errorBag): array
    {
        $flat = [];
        foreach ($errorBag as $messages) {
            foreach ((array) $messages as $message) {
                $flat[] = $message;
            }
        }
        return $flat;
    }
}
