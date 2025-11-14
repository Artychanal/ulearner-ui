import { getApiBaseUrl } from '@/lib/api';

export type MediaUploadResponse = {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  url: string;
  createdAt: string;
};

export async function uploadMedia(accessToken: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${getApiBaseUrl()}/media`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Failed to upload file');
  }

  const payload = (await response.json()) as MediaUploadResponse | { data: MediaUploadResponse };
  if ('data' in payload && payload.data) {
    return payload.data;
  }

  return payload as MediaUploadResponse;
}
