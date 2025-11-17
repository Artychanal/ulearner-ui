import React, { useEffect, useState } from 'react';
import { Box, H2, Text, Loader, Button } from '@adminjs/design-system';

type StatsResponse = {
  courses: number;
  lessons: number;
  users: number;
  enrollments: number;
  reviews: number;
  testimonials: number;
};

const cardOrder: Array<{ key: keyof StatsResponse; label: string }> = [
  { key: 'courses', label: 'Courses' },
  { key: 'lessons', label: 'Lessons' },
  { key: 'users', label: 'Users' },
  { key: 'enrollments', label: 'Enrollments' },
  { key: 'reviews', label: 'Reviews' },
  { key: 'testimonials', label: 'Testimonials' },
];

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/v1/admin/stats', { credentials: 'include' });
      const payload = (await response.json().catch(() => ({}))) as StatsResponse & {
        message?: string;
        data?: StatsResponse;
      };
      if (!response.ok) {
        const message = payload.message ?? 'Failed to load stats';
        throw new Error(message);
      }
      setStats(payload.data ?? payload);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load stats');
      setStats(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadStats();
  }, []);

  return (
    <Box variant="grey" flex flexDirection="column" p="xl" minHeight="100%">
      <H2 mb="lg">Platform overview</H2>
      {isLoading && (
        <Box display="flex" alignItems="center" gap="md">
          <Loader />
          <Text variant="xs">Loading latest numbers...</Text>
        </Box>
      )}
      {error && !isLoading && (
        <Box mb="lg">
          <Text variant="sm" color="danger">
            {error}
          </Text>
          <Button mt="md" onClick={() => void loadStats()}>
            Retry
          </Button>
        </Box>
      )}
      {stats && !isLoading && (
        <Box display="grid" gridTemplateColumns={['1fr', 'repeat(2, 1fr)', 'repeat(3, 1fr)']} gap="lg">
          {cardOrder.map(({ key, label }) => (
            <Box key={key} variant="white" boxShadow="card" borderRadius="xl" p="lg">
              <Text variant="lg" color="grey60">
                {label}
              </Text>
              <Text variant="h1" mt="sm">
                {stats[key].toLocaleString()}
              </Text>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default Dashboard;
