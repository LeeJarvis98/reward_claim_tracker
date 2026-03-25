'use client';

import { useState } from 'react';
import { DataTable } from 'mantine-datatable';
import { Group, Select, Text, Button } from '@mantine/core';
import StatusBadge from './StatusBadge';

const STATUS_OPTIONS = [
  { value: 'not_claimed', label: 'Not Claimed' },
  { value: 'processing', label: 'Processing' },
  { value: 'claimed', label: 'Claimed' },
  { value: 'denied', label: 'Denied' },
  { value: 'error', label: 'Error' },
];

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
  // Map of claimId -> pending status selection
  const [pendingStatus, setPendingStatus] = useState<Record<string, string>>({});
  const [applying, setApplying] = useState<string | null>(null);

  const filtered = statusFilter
    ? claims.filter((c) => c.status === statusFilter)
    : claims;

  async function applyStatus(claimId: string) {
    const status = pendingStatus[claimId];
    if (!status) return;
    setApplying(claimId);
    try {
      const res = await fetch('/api/update-claim-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimId, status }),
      });
      if (res.ok) {
        const completedAt =
          status === 'claimed' || status === 'denied' ? new Date().toISOString() : null;
        setClaims((prev) =>
          prev.map((c) =>
            c.id === claimId
              ? {
                  ...c,
                  status,
                  updated_at: new Date().toISOString(),
                  completed_at: completedAt ?? c.completed_at,
                }
              : c
          )
        );
        setPendingStatus((prev) => {
          const next = { ...prev };
          delete next[claimId];
          return next;
        });
      }
    } finally {
      setApplying(null);
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
          data={STATUS_OPTIONS}
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
            title: 'Created At',
            render: (row) =>
              row.created_at ? new Date(row.created_at).toLocaleString() : '—',
            width: 170,
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
          { accessor: 'reward_text', title: 'Reward Text', width: 160 },
          { accessor: 'chosen_reward', title: 'Chosen', width: 90 },
          {
            accessor: 'completed_at',
            title: 'Completed At',
            width: 170,
            render: (row) =>
              row.completed_at ? new Date(row.completed_at).toLocaleString() : '—',
          },
          {
            accessor: 'status',
            title: 'Status',
            width: 160,
            render: (row) => (
              <Select
                size="xs"
                data={STATUS_OPTIONS}
                value={pendingStatus[row.id] ?? row.status ?? null}
                onChange={(val) => {
                  if (!val) return;
                  if (val === row.status) {
                    setPendingStatus((prev) => {
                      const next = { ...prev };
                      delete next[row.id];
                      return next;
                    });
                  } else {
                    setPendingStatus((prev) => ({ ...prev, [row.id]: val }));
                  }
                }}
                renderOption={({ option }) => <StatusBadge status={option.value} />}
                styles={{ input: { minHeight: 28 } }}
              />
            ),
          },
          {
            accessor: 'actions',
            title: 'Actions',
            width: 90,
            render: (row) =>
              pendingStatus[row.id] ? (
                <Button
                  size="xs"
                  color="blue"
                  loading={applying === row.id}
                  onClick={() => applyStatus(row.id)}
                >
                  Apply
                </Button>
              ) : null,
          },
        ]}
      />
    </>
  );
}


