import React from 'react';
import type { ShowPropertyProps } from 'adminjs';
import { Box, Text } from '@adminjs/design-system';

const VideoPreview: React.FC<ShowPropertyProps> = ({ record, property }) => {
  const videoUrl = record?.params?.[property.path] as string | undefined;

  if (!videoUrl) {
    return (
      <Text color="grey60" fontSize={12}>
        No video
      </Text>
    );
  }

  return (
    <Box width="100%" maxWidth={360} borderRadius={12} overflow="hidden" boxShadow="card" bg="black">
      <video
        controls
        src={videoUrl}
        style={{ display: 'block', width: '100%', height: 'auto' }}
        preload="metadata"
      />
    </Box>
  );
};

export default VideoPreview;
