<?php

namespace Tests\Feature;

use App\Models\Employee;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class EmployeeApiTest extends TestCase
{
    use RefreshDatabase;

    private array $validPayload;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');

        $this->validPayload = [
            'employee_id'             => 'EMP-001',
            'firstname'               => 'John',
            'lastname'                => 'Doe',
            'date_of_birth'           => '1990-05-15',
            'education_qualification' => "Bachelor's Degree",
            'address'                 => '123 Main Street, Colombo',
            'email'                   => 'john.doe@example.com',
            'phone'                   => '+94771234567',
        ];
    }

    // =========================================================================
    // STORE
    // =========================================================================

    public function test_can_create_employee_without_files(): void
    {
        $response = $this->postJson('/api/employees', $this->validPayload);

        $response->assertStatus(201)
                 ->assertJsonFragment(['employee_id' => 'EMP-001'])
                 ->assertJsonStructure(['success', 'message', 'data']);

        $this->assertDatabaseHas('employees', ['email' => 'john.doe@example.com']);
    }

    public function test_can_create_employee_with_photo_and_resume(): void
    {
        $payload = array_merge($this->validPayload, [
            'photo'  => UploadedFile::fake()->create('photo.jpg', 100, 'image/jpeg'),
            'resume' => UploadedFile::fake()->create('resume.pdf', 100, 'application/pdf'),
        ]);

        $response = $this->postJson('/api/employees', $payload);

        $response->assertStatus(201);
        $data = $response->json('data');
        $this->assertNotNull($data['photo'], 'Photo path should be stored in DB');
        $this->assertNotNull($data['resume'], 'Resume path should be stored in DB');
        Storage::disk('public')->assertExists($data['photo']);
        Storage::disk('public')->assertExists($data['resume']);
    }

    public function test_create_fails_with_duplicate_email(): void
    {
        Employee::factory()->create(['email' => 'john.doe@example.com']);

        $response = $this->postJson('/api/employees', $this->validPayload);

        $response->assertStatus(422)
                 ->assertJsonValidationErrorFor('email');
    }

    public function test_create_fails_with_duplicate_employee_id(): void
    {
        Employee::factory()->create(['employee_id' => 'EMP-001']);
        $payload = array_merge($this->validPayload, ['email' => 'other@example.com']);

        $response = $this->postJson('/api/employees', $payload);

        $response->assertStatus(422)
                 ->assertJsonValidationErrorFor('employee_id');
    }

    public function test_create_rejects_invalid_photo_mime(): void
    {
        $payload = array_merge($this->validPayload, [
            'photo' => UploadedFile::fake()->create('virus.exe', 10, 'application/octet-stream'),
        ]);

        $response = $this->postJson('/api/employees', $payload);

        $response->assertStatus(422)
                 ->assertJsonValidationErrorFor('photo');
    }

    // =========================================================================
    // INDEX
    // =========================================================================

    public function test_can_list_employees_with_pagination(): void
    {
        Employee::factory()->count(20)->create();

        $response = $this->getJson('/api/employees?per_page=5');

        $response->assertStatus(200)
                 ->assertJsonStructure(['success', 'data', 'meta'])
                 ->assertJsonFragment(['per_page' => 5]);

        $this->assertCount(5, $response->json('data'));
    }

    public function test_can_search_employees(): void
    {
        Employee::factory()->create(['firstname' => 'Alice', 'email' => 'alice@example.com']);
        Employee::factory()->create(['firstname' => 'Bob', 'email' => 'bob@example.com']);

        $response = $this->getJson('/api/employees?search=Alice');

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));
        $this->assertEquals('Alice', $response->json('data.0.firstname'));
    }

    public function test_can_filter_by_qualification(): void
    {
        Employee::factory()->create(['education_qualification' => "Bachelor's Degree"]);
        Employee::factory()->create(['education_qualification' => 'Master\'s Degree']);

        $response = $this->getJson("/api/employees?qualification=Bachelor's Degree");

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));
    }

    // =========================================================================
    // SHOW
    // =========================================================================

    public function test_can_view_single_employee(): void
    {
        $employee = Employee::factory()->create();

        $response = $this->getJson("/api/employees/{$employee->id}");

        $response->assertStatus(200)
                 ->assertJsonFragment(['id' => $employee->id]);
    }

    public function test_show_returns_404_for_missing_employee(): void
    {
        $response = $this->getJson('/api/employees/99999');

        $response->assertStatus(404);
    }

    // =========================================================================
    // UPDATE
    // =========================================================================

    public function test_can_update_employee_email(): void
    {
        $employee = Employee::factory()->create(['email' => 'old@example.com']);

        $response = $this->patchJson("/api/employees/{$employee->id}", [
            'email' => 'new@example.com',
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('employees', ['email' => 'new@example.com']);
    }

    public function test_update_ignores_own_email_for_uniqueness(): void
    {
        $employee = Employee::factory()->create(['email' => 'same@example.com']);

        $response = $this->patchJson("/api/employees/{$employee->id}", [
            'email' => 'same@example.com',
        ]);

        $response->assertStatus(200);
    }

    public function test_update_fails_if_email_belongs_to_another_employee(): void
    {
        Employee::factory()->create(['email' => 'taken@example.com']);
        $employee = Employee::factory()->create(['email' => 'mine@example.com']);

        $response = $this->patchJson("/api/employees/{$employee->id}", [
            'email' => 'taken@example.com',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrorFor('email');
    }

    // =========================================================================
    // DESTROY
    // =========================================================================

    public function test_can_delete_employee(): void
    {
        $employee = Employee::factory()->create();

        $response = $this->deleteJson("/api/employees/{$employee->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('employees', ['id' => $employee->id]);
    }

    public function test_delete_cleans_up_files(): void
    {
        $photo  = 'employees/photos/test.jpg';
        $resume = 'employees/resumes/test.pdf';
        Storage::disk('public')->put($photo, 'fake');
        Storage::disk('public')->put($resume, 'fake');

        $employee = Employee::factory()->create(['photo' => $photo, 'resume' => $resume]);

        $this->deleteJson("/api/employees/{$employee->id}");

        Storage::disk('public')->assertMissing($photo);
        Storage::disk('public')->assertMissing($resume);
    }
}
