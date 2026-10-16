<?php

namespace App\Exports;

use App\Models\Employee;
use Illuminate\Database\Eloquent\Builder;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class EmployeesExport implements
    FromQuery,
    WithHeadings,
    WithMapping,
    WithStyles,
    ShouldAutoSize,
    WithTitle
{
    public function __construct(
        private readonly ?string $search,
        private readonly ?string $qualification,
        private readonly string  $sortBy  = 'created_at',
        private readonly string  $sortDir = 'desc',
    ) {}

    public function query(): Builder
    {
        $query = Employee::query();

        if ($this->search) {
            $search = $this->search;
            $query->where(function ($q) use ($search) {
                $q->where('firstname', 'like', "%{$search}%")
                  ->orWhere('lastname',  'like', "%{$search}%")
                  ->orWhere('email',     'like', "%{$search}%")
                  ->orWhere('employee_id', 'like', "%{$search}%");
            });
        }

        if ($this->qualification) {
            $query->where('education_qualification', $this->qualification);
        }

        $allowed = ['firstname', 'lastname', 'email', 'employee_id', 'date_of_birth', 'created_at'];
        $sortBy  = in_array($this->sortBy, $allowed, true) ? $this->sortBy : 'created_at';
        $sortDir = $this->sortDir === 'asc' ? 'asc' : 'desc';

        return $query->orderBy($sortBy, $sortDir);
    }

    public function headings(): array
    {
        return [
            'Employee ID',
            'First Name',
            'Last Name',
            'Date of Birth',
            'Education Qualification',
            'Address',
            'Email',
            'Phone',
        ];
    }

    public function map($employee): array
    {
        return [
            $this->safeString($employee->employee_id),
            $this->safeString($employee->firstname),
            $this->safeString($employee->lastname),
            $employee->date_of_birth
                ? \Carbon\Carbon::parse($employee->date_of_birth)->format('Y-m-d')
                : '',
            $this->safeString($employee->education_qualification),
            $this->safeString($employee->address),
            $this->safeString($employee->email),
            $this->safeString($employee->phone),
        ];
    }

    public function title(): string
    {
        return 'Employees';
    }

    public function styles(Worksheet $sheet): array
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }

    private function safeString(?string $value): string
    {
        if ($value === null) {
            return '';
        }

        if (preg_match('/^[=+\-@|]/', $value)) {
            $value = "'" . $value;
        }

        return $value;
    }
}
