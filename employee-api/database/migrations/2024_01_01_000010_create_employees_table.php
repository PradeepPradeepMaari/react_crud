<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->string('employee_id', 50)->unique();
            $table->string('firstname', 100);
            $table->string('lastname', 100);
            $table->date('date_of_birth');
            $table->string('education_qualification', 255);
            $table->text('address');
            $table->string('email', 255)->unique();
            $table->string('phone', 20);
            $table->string('photo', 500)->nullable();
            $table->string('resume', 500)->nullable();
            $table->timestamps();

            $table->index(['firstname', 'lastname']);
            $table->index('education_qualification');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};
