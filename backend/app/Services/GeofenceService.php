<?php

namespace App\Services;

use App\Models\PengaturanSekolah;

class GeofenceService
{
    /**
     * Calculate Haversine distance in meters between two lat/long points
     */
    public static function calculateDistance(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $earthRadius = 6371000; // Earth radius in meters

        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat / 2) * sin($dLat / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($dLon / 2) * sin($dLon / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }

    /**
     * Verify if teacher's location is within school geofence radius
     */
    public static function validateLocation(float $userLat, float $userLon): array
    {
        $settings = PengaturanSekolah::first() ?? new PengaturanSekolah([
            'latitude_sekolah' => -7.5878000,
            'longitude_sekolah' => 112.2345000,
            'radius_toleransi_meter' => 100,
        ]);

        $schoolLat = (float) $settings->latitude_sekolah;
        $schoolLon = (float) $settings->longitude_sekolah;
        $allowedRadius = (int) $settings->radius_toleransi_meter;

        $distance = self::calculateDistance($userLat, $userLon, $schoolLat, $schoolLon);
        $isWithinRadius = $distance <= $allowedRadius;

        return [
            'is_valid' => $isWithinRadius,
            'distance_meter' => round($distance, 1),
            'allowed_radius_meter' => $allowedRadius,
            'school_latitude' => $schoolLat,
            'school_longitude' => $schoolLon,
        ];
    }
}
