import { apiFetch } from '@/lib/api';
import type { AuthResponse, ApiUser } from '@/types/api';

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  avatarUrl?: string;
  bio?: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export async function registerUser(payload: RegisterPayload) {
  return apiFetch<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function loginUser(payload: LoginPayload) {
  return apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function refreshSession(refreshToken: string) {
  return apiFetch<AuthResponse>('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });
}

export async function fetchCurrentUser(accessToken: string) {
  return apiFetch<ApiUser>('/users/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function updateUserProfile(accessToken: string, payload: Partial<RegisterPayload>) {
  return apiFetch<ApiUser>('/users/me', {
    method: 'PATCH',
    body: JSON.stringify(payload),
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
