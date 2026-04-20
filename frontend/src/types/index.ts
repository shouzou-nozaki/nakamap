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
