<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImageOptimizerService
{
    /**
     * Resize & Convert uploaded image to WebP format.
     *
     * @param UploadedFile $file The uploaded image file
     * @param string $folder The destination subfolder in public disk (e.g., 'humas')
     * @param int $maxWidth Maximum width in pixels (default: 1200)
     * @param int $quality Compression quality 1-100 (default: 82)
     * @return string Relative storage path (e.g. 'humas/xxx.webp')
     */
    public static function optimizeAndStore(UploadedFile $file, string $folder = 'humas', int $maxWidth = 1200, int $quality = 82): string
    {
        $mime = $file->getMimeType();
        $sourcePath = $file->getRealPath();

        // 1. Create image resource using GD based on mime type
        $image = null;
        if (function_exists('imagecreatefromjpeg') && in_array($mime, ['image/jpeg', 'image/jpg'])) {
            $image = @imagecreatefromjpeg($sourcePath);
        } elseif (function_exists('imagecreatefrompng') && $mime === 'image/png') {
            $image = @imagecreatefrompng($sourcePath);
        } elseif (function_exists('imagecreatefromwebp') && $mime === 'image/webp') {
            $image = @imagecreatefromwebp($sourcePath);
        }

        // If GD cannot process or mime is unsupported, store original file safely
        if (!$image) {
            $filename = time() . '_' . Str::random(8) . '.' . $file->getClientOriginalExtension();
            return $file->storeAs($folder, $filename, 'public');
        }

        // 2. Handle EXIF orientation for JPEG if available
        if (function_exists('exif_read_data') && in_array($mime, ['image/jpeg', 'image/jpg'])) {
            try {
                $exif = @exif_read_data($sourcePath);
                if (!empty($exif['Orientation'])) {
                    $image = match ($exif['Orientation']) {
                        3 => imagerotate($image, 180, 0),
                        6 => imagerotate($image, -90, 0),
                        8 => imagerotate($image, 90, 0),
                        default => $image,
                    };
                }
            } catch (\Throwable $e) {
                // Ignore EXIF read errors
            }
        }

        // 3. Calculate target dimensions (preserving aspect ratio)
        $origWidth = imagesx($image);
        $origHeight = imagesy($image);

        if ($origWidth > $maxWidth && $origWidth > 0) {
            $newWidth = $maxWidth;
            $newHeight = (int) round($origHeight * ($maxWidth / $origWidth));
        } else {
            $newWidth = $origWidth;
            $newHeight = $origHeight;
        }

        $resizedImage = imagecreatetruecolor($newWidth, $newHeight);

        // Preserve alpha transparency
        imagealphablending($resizedImage, false);
        imagesavealpha($resizedImage, true);
        $transparent = imagecolorallocatealpha($resizedImage, 255, 255, 255, 127);
        imagefilledrectangle($resizedImage, 0, 0, $newWidth, $newHeight, $transparent);

        // Resample image
        imagecopyresampled($resizedImage, $image, 0, 0, 0, 0, $newWidth, $newHeight, $origWidth, $origHeight);

        // 4. Save to destination as WebP
        $filename = time() . '_' . Str::random(10) . '.webp';
        $relativeFolder = trim($folder, '/');
        $storageDir = storage_path('app/public/' . $relativeFolder);

        if (!is_dir($storageDir)) {
            @mkdir($storageDir, 0755, true);
        }

        $destinationPath = $storageDir . '/' . $filename;

        if (function_exists('imagewebp')) {
            imagewebp($resizedImage, $destinationPath, $quality);
        } else {
            // Fallback to JPEG if WebP is not supported in GD
            imagejpeg($resizedImage, $storageDir . '/' . str_replace('.webp', '.jpg', $filename), $quality);
            $filename = str_replace('.webp', '.jpg', $filename);
        }

        // Free memory
        imagedestroy($image);
        imagedestroy($resizedImage);

        // Also mirror to frontend/public/$folder if directory exists (for development dev server)
        $frontendDir = base_path('../frontend/public/' . $relativeFolder);
        if (is_dir($frontendDir)) {
            @copy(storage_path('app/public/' . $relativeFolder . '/' . $filename), $frontendDir . '/' . $filename);
        }

        return $relativeFolder . '/' . $filename;
    }
}
