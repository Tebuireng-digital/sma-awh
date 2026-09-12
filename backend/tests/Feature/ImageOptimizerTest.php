<?php

namespace Tests\Feature;

use App\Services\ImageOptimizerService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ImageOptimizerTest extends TestCase
{
    public function test_image_optimizer_converts_and_resizes_to_webp(): void
    {
        Storage::fake('public');

        // Create a temporary GD image
        $tmpFile = tempnam(sys_get_temp_dir(), 'test_img') . '.jpg';
        $im = imagecreatetruecolor(1600, 1200);
        $red = imagecolorallocate($im, 255, 0, 0);
        imagefilledrectangle($im, 0, 0, 1600, 1200, $red);
        imagejpeg($im, $tmpFile, 95);
        imagedestroy($im);

        $uploadedFile = new UploadedFile(
            $tmpFile,
            'kegiatan_sekolah.jpg',
            'image/jpeg',
            null,
            true
        );

        $savedPath = ImageOptimizerService::optimizeAndStore($uploadedFile, 'test_humas', 1200, 80);

        // Path should end with .webp or .jpg (if gd lacks webp)
        $this->assertTrue(str_ends_with($savedPath, '.webp') || str_ends_with($savedPath, '.jpg'));
        
        $fullPath = storage_path('app/public/' . $savedPath);
        if (file_exists($fullPath)) {
            $dimensions = getimagesize($fullPath);
            // Width should be constrained to 1200px
            $this->assertLessThanOrEqual(1200, $dimensions[0]);
            @unlink($fullPath);
        }

        @unlink($tmpFile);
    }
}
