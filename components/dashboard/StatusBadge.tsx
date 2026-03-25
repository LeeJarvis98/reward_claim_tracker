'use client';

import { Badge } from '@mantine/core';

interface StatusBadgeProps {
  status: string;
}

const statusConfig: Record<string, { color: string; label: string }> = {
  not_claimed: { color: 'gray',   label: 'Not Claimed' },
  processing:  { color: 'yellow', label: 'Processing' },
  claimed:     { color: 'green',  label: 'Claimed' },
  denied:      { color: 'red',    label: 'Denied' },
  error:       { color: 'orange', label: 'Error' },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] ?? { color: 'gray', label: status };
  return <Badge color={config.color} variant="light">{config.label}</Badge>;
}
