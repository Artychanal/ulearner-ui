type ApiFetchOptions = RequestInit & {
  query?: Record<string, string | number | boolean | undefined>;
  tags?: string[];
};

type ApiResponse<T> = {
  success?: boolean;
  data?: T;
  message?: string;
};

function resolveApiBaseUrl() {
  const base =
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    process.env.API_BASE_URL ??
    'http://localhost:3001/api/v1';
  return base.replace(/\/$/, '');
}

const API_BASE_URL = resolveApiBaseUrl();

export function getApiBaseUrl() {
  return API_BASE_URL;
}

function buildUrl(path: string, query?: ApiFetchOptions['query']) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${API_BASE_URL}${normalizedPath}`);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        return;
      }
      url.searchParams.append(key, String(value));
    });
  }

  return url.toString();
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { query, tags, ...rest } = options;
  const url = buildUrl(path, query);

  const response = await fetch(url, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(rest.headers ?? {}),
    },
    cache: rest.cache ?? 'no-store',
    next: tags ? { tags } : rest.next,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = (await response.json()) as ApiResponse<T> | T;
  if (typeof payload === 'object' && payload !== null && 'data' in payload) {
    return (payload as ApiResponse<T>).data as T;
  }

  return payload as T;
}
