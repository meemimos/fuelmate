import * as Location from 'expo-location';
import { CITY_COORDINATES } from './mockData';

export type CityName = keyof typeof CITY_COORDINATES;

const CITIES = Object.values(CITY_COORDINATES);

/**
 * Request location permission from user
 */
export async function requestLocationPermission(): Promise<boolean> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.warn('Error requesting location permission:', error);
    return false;
  }
}

/**
 * Get device's current location
 */
export async function getDeviceLocation(): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    console.warn('Error getting device location:', error);
    return null;
  }
}

/**
 * Calculate distance between two coordinates in kilometers
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Find the closest city to the given coordinates
 */
export function findClosestCity(
  latitude: number,
  longitude: number
): { city: CityName; distance: number } {
  let closest: { city: CityName; distance: number } = {
    city: 'Sydney' as CityName,
    distance: Infinity,
  };

  Object.entries(CITY_COORDINATES).forEach(([cityName, coords]) => {
    const distance = calculateDistance(latitude, longitude, coords.latitude, coords.longitude);
    if (distance < closest.distance) {
      closest = { city: cityName as CityName, distance };
    }
  });

  return closest;
}

/**
 * Get city based on coordinates, with fallback to closest city within radius
 * The radius determines how far away a user can be to still get assigned to a city
 */
export function getCityFromLocation(
  latitude: number,
  longitude: number,
  radiusKm: number = 100 // Default: assign to any city within 100km
): CityName | null {
  const closest = findClosestCity(latitude, longitude);

  // If user is within the radius of a city, use that city
  if (closest.distance <= radiusKm) {
    return closest.city;
  }

  // Return null if no city is within the specified radius
  return null;
}
