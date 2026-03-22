'use client';

import { SimpleGrid, Paper, Text, Group } from '@mantine/core';

interface StatsCardsProps {
  total: number;
  notClaimed: number;
  processing: number;
  completed: number;
}

interface StatCardProps {
  label: string;
  value: number;
  color?: string;
}

function StatCard({ label, value, color = '#ffffff' }: StatCardProps) {
  return (
    <Paper p="md" radius="md" style={{ backgroundColor: '#25282a' }}>
      <Text size="sm" c="dimmed" mb={4}>{label}</Text>
      <Text size="xl" fw={700} style={{ color }}>{value}</Text>
    </Paper>
  );
}

export default function StatsCards({ total, notClaimed, processing, completed }: StatsCardsProps) {
  return (
    <SimpleGrid cols={{ base: 2, sm: 4 }}>
      <StatCard label="Total Claims" value={total} />
      <StatCard label="Not Claimed" value={notClaimed} color="#adb5bd" />
      <StatCard label="Processing" value={processing} color="#FFB81C" />
      <StatCard label="Completed" value={completed} color="#51cf66" />
    </SimpleGrid>
  );
}
