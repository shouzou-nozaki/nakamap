import apiClient from './client';
import type { LocationPin, MyLocation } from '../types';

export const getLocations = async (circleId: number): Promise<LocationPin[]> => {
  const response = await apiClient.get<LocationPin[]>(`/circles/${circleId}/locations`);
  return response.data;
};

export const getMyLocation = async (circleId: number): Promise<MyLocation | null> => {
  try {
    const response = await apiClient.get<MyLocation>(`/circles/${circleId}/locations/me`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

export const registerLocation = async (
  circleId: number,
  lat: number,
  lng: number
): Promise<MyLocation> => {
  const response = await apiClient.post<MyLocation>(`/circles/${circleId}/locations`, {
    latitude: lat,
    longitude: lng,
  });
  return response.data;
};

export const updateLocation = async (
  circleId: number,
  lat: number,
  lng: number
): Promise<MyLocation> => {
  const response = await apiClient.put<MyLocation>(`/circles/${circleId}/locations/me`, {
    latitude: lat,
    longitude: lng,
  });
  return response.data;
};
