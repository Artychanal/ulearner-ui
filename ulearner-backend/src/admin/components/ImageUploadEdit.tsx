import React, { useState } from 'react';
import type { EditPropertyProps } from 'adminjs';
import { Box, Button, Input, Label, Text } from '@adminjs/design-system';

const ImageUploadEdit: React.FC<EditPropertyProps> = ({ property, record, onChange }) => {
  const value = (record?.params?.[property.path] as string | undefined) ?? '';
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(property.path, event.target.value);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    setError(null);
    try {
      const response = await fetch('/api/v1/admin/media', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      const payload = (await response.json().catch(() => ({}))) as {
        url?: string;
        message?: string;
        data?: { url?: string; message?: string };
      };
      if (!response.ok) {
        const message = payload.message ?? payload.data?.message ?? 'Upload failed';
        throw new Error(message);
      }
      const nextUrl = payload.url ?? payload.data?.url;
      if (nextUrl) {
        onChange?.(property.path, nextUrl);
        setUploadedFile(file.name);
        setError(null);
      }
    } catch (uploadError) {
      const message =
        uploadError instanceof Error ? uploadError.message : 'Upload failed. Please try again.';
      setError(message);
      setUploadedFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Box display="flex" flexDirection="column" gap="md">
      <Box>
        <Label htmlFor={property.path}>{property.label}</Label>
        <Input id={property.path} value={value} onChange={handleUrlChange} />
        <Text variant="xs" color="grey60">
          Paste a URL or upload a new image below.
        </Text>
      </Box>
      <Box>
        <Label htmlFor={`${property.path}-file`}>Upload image</Label>
        <Input
          id={`${property.path}-file`}
          name="file"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isUploading}
        />
        {isUploading && (
          <Text mt="sm" variant="xs" color="primary100">
            Uploading...
          </Text>
        )}
        {uploadedFile && !isUploading && !error && (
          <Text mt="sm" variant="xs" color="success">
            Uploaded {uploadedFile}. Don’t forget to save the record.
          </Text>
        )}
        {error && (
          <Text mt="sm" variant="xs" color="danger">
            {error}
          </Text>
        )}
      </Box>
    </Box>
  );
};

export default ImageUploadEdit;
