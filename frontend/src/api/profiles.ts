import apiClient from './client';
import type { Profile } from '../types';

export const getProfile = async (circleId: number, userId: number): Promise<Profile> => {
  const response = await apiClient.get<Profile>(`/circles/${circleId}/users/${userId}`);
  return response.data;
};

export const updateProfile = async (
  circleId: number,
  data: Partial<Pick<Profile, 'name' | 'photoUrl' | 'hobby' | 'comment'>>
): Promise<Profile> => {
  const response = await apiClient.put<Profile>(`/circles/${circleId}/users/me`, data);
  return response.data;
};
