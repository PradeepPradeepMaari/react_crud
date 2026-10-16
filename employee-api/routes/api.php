<?php

use App\Http\Controllers\Api\EmployeeController;
use Illuminate\Support\Facades\Route;


Route::get('employees/export',          [EmployeeController::class, 'export'])->name('employees.export');
Route::get('employees/import-template', [EmployeeController::class, 'downloadTemplate'])->name('employees.importTemplate');
Route::post('employees/import',         [EmployeeController::class, 'import'])->name('employees.import');

Route::apiResource('employees', EmployeeController::class);
