<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class EmployeeFileService
{

    public function store(UploadedFile $file, string $directory): string
    {
        $extension = $file->getClientOriginalExtension();
        $filename  = Str::uuid() . '.' . strtolower($extension);
        $path = $file->storeAs($directory, $filename, 'public');

        return $path; 
    }


    public function replace(?string $oldPath, UploadedFile $newFile, string $directory): string
    {
        $newPath = $this->store($newFile, $directory);

        if ($oldPath && $newPath !== $oldPath) {
            $this->delete($oldPath);
        }

        return $newPath;
    }


    public function delete(?string $path): void
    {
        if ($path && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }


    public function url(?string $path): ?string
    {
        if (!$path) {
            return null;
        }

        return Storage::disk('public')->url($path);
    }
}
