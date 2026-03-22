'use client';

import { Badge } from '@mantine/core';

interface StatusBadgeProps {
  status: string;
}

const statusConfig: Record<string, { color: string; label: string }> = {
  not_claimed: { color: 'gray', label: 'Not Claimed' },
  processing:  { color: 'yellow', label: 'Processing' },
  completed:   { color: 'green', label: 'Completed' },
  rejected:    { color: 'red', label: 'Rejected' },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] ?? { color: 'gray', label: status };
  return <Badge color={config.color} variant="light">{config.label}</Badge>;
}
