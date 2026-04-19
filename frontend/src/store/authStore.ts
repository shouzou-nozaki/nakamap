import { create } from 'zustand';
import type { AuthResponse } from '../types';

interface AuthState {
  token: string | null;
  userId: number | null;
  name: string | null;
  photoUrl: string | null;
  isAuthenticated: boolean;
  setAuth: (auth: AuthResponse) => void;
  clearAuth: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token'),
  userId: localStorage.getItem('userId') ? Number(localStorage.getItem('userId')) : null,
  name: localStorage.getItem('name'),
  photoUrl: localStorage.getItem('photoUrl'),
  isAuthenticated: !!localStorage.getItem('token'),

  setAuth: (auth: AuthResponse) => {
    localStorage.setItem('token', auth.token);
    localStorage.setItem('userId', String(auth.userId));
    if (auth.name) localStorage.setItem('name', auth.name);
    else localStorage.removeItem('name');
    if (auth.photoUrl) localStorage.setItem('photoUrl', auth.photoUrl);
    else localStorage.removeItem('photoUrl');

    set({
      token: auth.token,
      userId: auth.userId,
      name: auth.name,
      photoUrl: auth.photoUrl,
      isAuthenticated: true,
    });
  },

  clearAuth: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('name');
    localStorage.removeItem('photoUrl');

    set({
      token: null,
      userId: null,
      name: null,
      photoUrl: null,
      isAuthenticated: false,
    });
  },
}));

export default useAuthStore;
