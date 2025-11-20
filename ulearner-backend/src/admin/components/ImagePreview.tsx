import React from 'react';
import type { ShowPropertyProps } from 'adminjs';
import { Box, Text } from '@adminjs/design-system';

type PreviewOptions = {
  maxWidth?: number;
  emptyLabel?: string;
  rounded?: boolean;
};

type Props = ShowPropertyProps & PreviewOptions;

function resolveOption<T extends keyof PreviewOptions>(
  property: ShowPropertyProps['property'],
  fallback: PreviewOptions,
  key: T,
): PreviewOptions[T] | undefined {
  const custom = (property?.custom?.preview ?? {}) as PreviewOptions;
  return custom[key] ?? fallback[key];
}

const ImagePreview: React.FC<Props> = ({ record, property, maxWidth = 260, emptyLabel = 'No image', rounded }) => {
  const imageUrl = record?.params?.[property.path] as string | undefined;
  const resolvedMaxWidth = resolveOption(property, { maxWidth, emptyLabel, rounded }, 'maxWidth') ?? 260;
  const resolvedEmptyLabel = resolveOption(property, { maxWidth, emptyLabel, rounded }, 'emptyLabel') ?? 'No image';
  const resolvedRounded = resolveOption(property, { maxWidth, emptyLabel, rounded }, 'rounded') ?? false;

  if (!imageUrl) {
    return (
      <Text color="grey60" fontSize={12}>
        {resolvedEmptyLabel}
      </Text>
    );
  }

  return (
    <Box
      width="100%"
      maxWidth={resolvedMaxWidth}
      borderRadius={resolvedRounded ? '50%' : 12}
      overflow="hidden"
      boxShadow="card"
      bg="white"
    >
      <img
        src={imageUrl}
        alt={property.label || 'Image preview'}
        style={{ display: 'block', width: '100%' }}
      />
    </Box>
  );
};

export default ImagePreview;
