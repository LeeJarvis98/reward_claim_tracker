'use client';

import { useState } from 'react';
import { DataTable } from 'mantine-datatable';
import { Group, Select, Text, ActionIcon, Tooltip } from '@mantine/core';
import { Check, X } from 'lucide-react';
import StatusBadge from './StatusBadge';

interface Claim {
  id: string;
  user_id: string | null;
  partner_id: string | null;
  platform: string | null;
  level: number | null;
  reward_usd: number | null;
  reward_text: string | null;
  status: string | null;
  chosen_reward: string | null;
  completed_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface ClaimsTableProps {
  claims: Claim[];
}

export default function ClaimsTable({ claims: initialClaims }: ClaimsTableProps) {
  const [claims, setClaims] = useState(initialClaims);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const filtered = statusFilter
    ? claims.filter((c) => c.status === statusFilter)
    : claims;

  async function updateStatus(claimId: string, status: string) {
    setUpdating(claimId);
    try {
      const res = await fetch('/api/update-claim-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimId, status }),
      });
      if (res.ok) {
        setClaims((prev) =>
          prev.map((c) =>
            c.id === claimId
              ? { ...c, status, updated_at: new Date().toISOString() }
              : c
          )
        );
      }
    } finally {
      setUpdating(null);
    }
  }

  return (
    <>
      <Group mb="sm">
        <Select
          placeholder="Filter by status"
          clearable
          value={statusFilter}
          onChange={setStatusFilter}
          data={[
            { value: 'not_claimed', label: 'Not Claimed' },
            { value: 'processing', label: 'Processing' },
            { value: 'completed', label: 'Completed' },
            { value: 'rejected', label: 'Rejected' },
          ]}
          style={{ width: 200 }}
        />
        <Text size="sm" c="dimmed">{filtered.length} record{filtered.length !== 1 ? 's' : ''}</Text>
      </Group>
      <DataTable
        records={filtered}
        withTableBorder
        borderRadius="md"
        highlightOnHover
        striped
        columns={[
          {
            accessor: 'created_at',
            title: 'Date',
            render: (row) =>
              row.created_at ? new Date(row.created_at).toLocaleDateString() : '—',
            width: 110,
          },
          { accessor: 'user_id', title: 'User ID', width: 200 },
          { accessor: 'platform', title: 'Platform', width: 110 },
          { accessor: 'level', title: 'Level', width: 70 },
          {
            accessor: 'reward_usd',
            title: 'Reward (USD)',
            width: 120,
            render: (row) =>
              row.reward_usd != null ? `$${row.reward_usd.toFixed(2)}` : row.reward_text ?? '—',
          },
          { accessor: 'chosen_reward', title: 'Chosen', width: 90 },
          {
            accessor: 'status',
            title: 'Status',
            width: 130,
            render: (row) => <StatusBadge status={row.status ?? ''} />,
          },
          {
            accessor: 'actions',
            title: 'Actions',
            width: 100,
            render: (row) =>
              row.status === 'processing' ? (
                <Group gap={4}>
                  <Tooltip label="Mark completed">
                    <ActionIcon
                      size="sm"
                      color="green"
                      loading={updating === row.id}
                      onClick={() => updateStatus(row.id, 'completed')}
                    >
                      <Check size={14} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="Reject">
                    <ActionIcon
                      size="sm"
                      color="red"
                      loading={updating === row.id}
                      onClick={() => updateStatus(row.id, 'rejected')}
                    >
                      <X size={14} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              ) : null,
          },
        ]}
      />
    </>
  );
}
