const ACCESS_TOKEN_KEY = 'ulearner_access_token';
const REFRESH_TOKEN_KEY = 'ulearner_refresh_token';

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

function isBrowser() {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

export function loadAuthTokens(): AuthTokens | null {
  if (!isBrowser()) {
    return null;
  }
  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

  if (!accessToken || !refreshToken) {
    return null;
  }

  return { accessToken, refreshToken };
}

export function persistAuthTokens(tokens: AuthTokens) {
  if (!isBrowser()) {
    return;
  }
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
}

export function clearAuthTokens() {
  if (!isBrowser()) {
    return;
  }
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}
