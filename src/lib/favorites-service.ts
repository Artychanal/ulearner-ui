import { apiFetch } from '@/lib/api';
import type { FavoriteApi } from '@/types/api';

export async function fetchFavorites(accessToken: string) {
  return apiFetch<FavoriteApi[]>('/favorites/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function toggleFavorite(accessToken: string, payload: { courseId: string; origin: 'catalog' | 'authored' }) {
  return apiFetch<{ removed: boolean; favorite?: FavoriteApi }>('/favorites/toggle', {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
