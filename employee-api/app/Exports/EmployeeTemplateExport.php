<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class EmployeeTemplateExport implements FromArray, WithHeadings, WithStyles, ShouldAutoSize, WithTitle
{
    public function array(): array
    {
        return [
            [
                'EMP-001',
                'Jane',
                'Doe',
                '1990-05-15',
                "Bachelor's Degree",
                '123 Main Street, Springfield, IL 62701',
                'jane.doe@example.com',
                '+1-555-000-1234',
            ],
        ];
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

    public function title(): string
    {
        return 'Import Template';
    }

    public function styles(Worksheet $sheet): array
    {
        return [
            1 => ['font' => ['bold' => true]],
            2 => ['fill' => [
                'fillType'   => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                'startColor' => ['argb' => 'FFE8F5E9'],
            ]],
        ];
    }
}
