export interface AuthResponse {
  token: string;
  userId: number;
  name: string | null;
  photoUrl: string | null;
}

export interface CircleListItem {
  circleId: number;
  name: string;
  role: string;
  memberCount: number;
}

export interface CircleDetail {
  circleId: number;
  name: string;
  createdAt: string;
  joinCode: string | null;
  stampEnabled: boolean;
}

export interface EncounterHistory {
  encounterId: number;
  partnerUserId: number;
  partnerName: string;
  partnerPhotoUrl: string | null;
  metAt: string;
  firstMeeting: boolean;
}

export interface RankingEntry {
  rank: number;
  userId: number;
  name: string;
  photoUrl: string | null;
  totalPoints: number;
}

export interface ScanResult {
  targetName: string;
  targetPhotoUrl: string | null;
  pointsEarned: number;
  firstMeeting: boolean;
  allMembersBonus: boolean;
}

export interface LocationPin {
  userId: number;
  name: string;
  photoUrl: string | null;
  displayLatitude: number;
  displayLongitude: number;
}

export interface MyLocation {
  locationId: number;
  displayLatitude: number;
  displayLongitude: number;
}

export interface Profile {
  userId: number;
  name: string;
  photoUrl: string | null;
  hobby: string | null;
  comment: string | null;
}
