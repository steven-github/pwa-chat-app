/**
 * Location Service - Utilities for geolocation and privacy
 */

import { db } from '../config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface UserLocationPreferences {
  locationPrivacy: 'private' | 'nearby-only' | 'public';
  shareLocationForDiscovery: boolean;
  locationVisibleToRoomMembers: boolean;
}

const DEFAULT_PREFERENCES: UserLocationPreferences = {
  locationPrivacy: 'nearby-only',
  shareLocationForDiscovery: true,
  locationVisibleToRoomMembers: false,
};

/**
 * Get user's current geolocation
 */
export const getUserLocation = (): Promise<{ latitude: number; longitude: number }> => {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Geolocation not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        reject(new Error(`Geolocation error: ${error.message}`));
      },
      {
        timeout: 5000,
        enableHighAccuracy: true,
      }
    );
  });
};

/**
 * Get user's location privacy preferences
 */
export const getUserLocationPreferences = async (
  userId: string
): Promise<UserLocationPreferences> => {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return DEFAULT_PREFERENCES;
    }

    const data = docSnap.data();
    return {
      locationPrivacy: data.locationPrivacy || DEFAULT_PREFERENCES.locationPrivacy,
      shareLocationForDiscovery:
        data.shareLocationForDiscovery ?? DEFAULT_PREFERENCES.shareLocationForDiscovery,
      locationVisibleToRoomMembers:
        data.locationVisibleToRoomMembers ?? DEFAULT_PREFERENCES.locationVisibleToRoomMembers,
    };
  } catch (error) {
    console.error('Error fetching location preferences:', error);
    return DEFAULT_PREFERENCES;
  }
};

/**
 * Update user's location privacy preferences
 */
export const updateLocationPreferences = async (
  userId: string,
  preferences: Partial<UserLocationPreferences>
): Promise<void> => {
  try {
    const docRef = doc(db, 'users', userId);
    await setDoc(docRef, preferences, { merge: true });
  } catch (error) {
    console.error('Error updating location preferences:', error);
    throw error;
  }
};

/**
 * Check if user allows location sharing for discovery
 */
export const canShareLocationForDiscovery = async (userId: string): Promise<boolean> => {
  const prefs = await getUserLocationPreferences(userId);
  return prefs.shareLocationForDiscovery && prefs.locationPrivacy !== 'private';
};

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
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
};

/**
 * Format distance for display
 */
export const formatDistance = (distanceKm: number): string => {
  if (distanceKm < 0.1) {
    return '< 0.1 km';
  }
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    return `${meters} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
};
