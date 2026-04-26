import apiClient from './client';
import type { EncounterHistory, RankingEntry, ScanResult } from '../types';

export const getStampQr = async (circleId: number): Promise<string> => {
  const response = await apiClient.get<{ token: string }>(`/circles/${circleId}/stamp/qr`);
  return response.data.token;
};

export const scanStamp = async (circleId: number, token: string): Promise<ScanResult> => {
  const response = await apiClient.post<ScanResult>(`/circles/${circleId}/stamp/scan`, { token });
  return response.data;
};

export const getStampHistory = async (circleId: number): Promise<EncounterHistory[]> => {
  const response = await apiClient.get<EncounterHistory[]>(`/circles/${circleId}/stamp/history`);
  return response.data;
};

export const getStampRanking = async (circleId: number): Promise<RankingEntry[]> => {
  const response = await apiClient.get<RankingEntry[]>(`/circles/${circleId}/stamp/ranking`);
  return response.data;
};

export const toggleStamp = async (circleId: number, enabled: boolean): Promise<void> => {
  await apiClient.patch(`/circles/${circleId}/stamp`, { enabled });
};

export const getNewEncounters = async (circleId: number, since: string): Promise<EncounterHistory[]> => {
  const response = await apiClient.get<EncounterHistory[]>(
    `/circles/${circleId}/stamp/new-encounters`,
    { params: { since } }
  );
  return response.data;
};
