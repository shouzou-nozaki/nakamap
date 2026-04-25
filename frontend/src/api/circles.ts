import apiClient from './client';
import type { CircleListItem, CircleDetail } from '../types';

export const getCircles = async (): Promise<CircleListItem[]> => {
  const response = await apiClient.get<CircleListItem[]>('/circles');
  return response.data;
};

export const createCircle = async (name: string): Promise<{ circleId: number; name: string; joinCode: string }> => {
  const response = await apiClient.post<{ circleId: number; name: string; joinCode: string }>('/circles', { name });
  return response.data;
};

export const joinCircle = async (joinCode: string): Promise<CircleDetail> => {
  const response = await apiClient.post<CircleDetail>('/circles/join', { joinCode });
  return response.data;
};

export const getCircleDetail = async (circleId: number): Promise<CircleDetail> => {
  const response = await apiClient.get<CircleDetail>(`/circles/${circleId}`);
  return response.data;
};

export const updateCircleName = async (circleId: number, name: string): Promise<void> => {
  await apiClient.patch(`/circles/${circleId}`, { name });
};

export const deleteCircle = async (circleId: number): Promise<void> => {
  await apiClient.delete(`/circles/${circleId}`);
};
