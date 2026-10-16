<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEmployeeRequest;
use App\Http\Requests\UpdateEmployeeRequest;
use App\Models\Employee;
use App\Services\EmployeeFileService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EmployeeController extends Controller
{
    public function __construct(private readonly EmployeeFileService $fileService) {}


    public function index(Request $request): JsonResponse
    {
        $query = Employee::query();

        if ($search = $request->string('search')->trim()->value()) {
            $query->where(function ($q) use ($search) {
                $q->where('firstname', 'like', "%{$search}%")
                  ->orWhere('lastname', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('employee_id', 'like', "%{$search}%");
            });
        }

        if ($qualification = $request->string('qualification')->trim()->value()) {
            $query->where('education_qualification', $qualification);
        }

        $allowedSorts = ['firstname', 'lastname', 'email', 'employee_id', 'date_of_birth', 'created_at'];
        $sortBy       = in_array($request->query('sort_by'), $allowedSorts, true)
            ? $request->query('sort_by')
            : 'created_at';
        $sortDir = strtolower($request->query('sort_dir', 'desc')) === 'asc' ? 'asc' : 'desc';

        $query->orderBy($sortBy, $sortDir);

        $perPage = max(1, min((int) $request->query('per_page', 15), 100));
        $employees = $query->paginate($perPage)->withQueryString();

        $employees->getCollection()->transform(function (Employee $employee) {
            return $this->appendFileUrls($employee);
        });

        return response()->json([
            'success' => true,
            'data'    => $employees->items(),
            'meta'    => [
                'current_page' => $employees->currentPage(),
                'last_page'    => $employees->lastPage(),
                'per_page'     => $employees->perPage(),
                'total'        => $employees->total(),
                'from'         => $employees->firstItem(),
                'to'           => $employees->lastItem(),
            ],
        ]);
    }


    public function store(StoreEmployeeRequest $request): JsonResponse
    {
        $data = $request->validated();

        if ($request->hasFile('photo')) {
            $data['photo'] = $this->fileService->store($request->file('photo'), 'employees/photos');
        }
        if ($request->hasFile('resume')) {
            $data['resume'] = $this->fileService->store($request->file('resume'), 'employees/resumes');
        }

        $employee = Employee::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Employee created successfully.',
            'data'    => $this->appendFileUrls($employee),
        ], 201);
    }


    public function show(Employee $employee): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $this->appendFileUrls($employee),
        ]);
    }

    public function update(UpdateEmployeeRequest $request, Employee $employee): JsonResponse
    {
        $data = $request->validated();

        if ($request->hasFile('photo')) {
            $data['photo'] = $this->fileService->replace($employee->photo, $request->file('photo'), 'employees/photos');
        }

        if ($request->hasFile('resume')) {
            $data['resume'] = $this->fileService->replace($employee->resume, $request->file('resume'), 'employees/resumes');
        }

        $employee->update($data);
        $employee->refresh();

        return response()->json([
            'success' => true,
            'message' => 'Employee updated successfully.',
            'data'    => $this->appendFileUrls($employee),
        ]);
    }

    public function destroy(Employee $employee): JsonResponse
    {
        $this->fileService->delete($employee->photo);
        $this->fileService->delete($employee->resume);

        $employee->delete();

        return response()->json([
            'success' => true,
            'message' => 'Employee deleted successfully.',
        ]);
    }

    private function appendFileUrls(Employee $employee): Employee
    {
        $employee->setAttribute('photo_url', $this->fileService->url($employee->photo));
        $employee->setAttribute('resume_url', $this->fileService->url($employee->resume));

        return $employee;
    }
}
