'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { Group, Select, Text, Button, TextInput } from '@mantine/core';
import { RefreshCw, Search } from 'lucide-react';
import StatusBadge from './StatusBadge';

const STATUS_OPTIONS = [
  { value: 'not_claimed', label: 'Not Claimed' },
  { value: 'processing', label: 'Processing' },
  { value: 'claimed', label: 'Claimed' },
  { value: 'denied', label: 'Denied' },
  { value: 'error', label: 'Error' },
];

const PAGE_SIZES = [10, 25, 50];

const STATUS_DOT_COLORS: Record<string, string> = {
  not_claimed: 'var(--mantine-color-gray-6)',
  processing:  'var(--mantine-color-yellow-6)',
  claimed:     'var(--mantine-color-green-6)',
  denied:      'var(--mantine-color-red-6)',
  error:       'var(--mantine-color-orange-6)',
};

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
  const router = useRouter();
  const [claims, setClaims] = useState(initialClaims);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus<Claim>>({
    columnAccessor: 'created_at',
    direction: 'desc',
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [pendingStatus, setPendingStatus] = useState<Record<string, string>>({});
  const [applying, setApplying] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    setClaims(initialClaims);
    setIsRefreshing(false);
  }, [initialClaims]);

  function handleRefresh() {
    setPendingStatus({});
    setIsRefreshing(true);
    router.refresh();
  }

  const filtered = useMemo(() => {
    let result = claims;

    if (statusFilter) {
      result = result.filter((c) => c.status === statusFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((c) =>
        [c.user_id, c.platform, c.partner_id, c.reward_text, c.chosen_reward]
          .some((v) => v?.toLowerCase().includes(q))
      );
    }

    const { columnAccessor, direction } = sortStatus;
    result = [...result].sort((a, b) => {
      const aVal = a[columnAccessor as keyof Claim];
      const bVal = b[columnAccessor as keyof Claim];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return direction === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [claims, statusFilter, search, sortStatus]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

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

  function handleSortChange(newSort: DataTableSortStatus<Claim>) {
    setSortStatus(newSort);
    setPage(1);
  }

  return (
    <>
      <Group mb="sm" wrap="wrap">
        <TextInput
          placeholder="Search user, platform, partner..."
          leftSection={<Search size={14} />}
          value={search}
          onChange={(e) => { setSearch(e.currentTarget.value); setPage(1); }}
          style={{ width: 260 }}
        />
        <Select
          placeholder="Filter by status"
          clearable
          value={statusFilter}
          onChange={(v) => { setStatusFilter(v); setPage(1); }}
          data={STATUS_OPTIONS}
          style={{ width: 200 }}
        />
        <Text size="sm" c="dimmed">
          {filtered.length} record{filtered.length !== 1 ? 's' : ''}
        </Text>
        <Button
          leftSection={<RefreshCw size={14} />}
          variant="subtle"
          size="sm"
          loading={isRefreshing}
          onClick={handleRefresh}
        >
          Refresh
        </Button>
      </Group>
      <DataTable
        records={paginated}
        totalRecords={filtered.length}
        recordsPerPage={pageSize}
        page={page}
        onPageChange={setPage}
        recordsPerPageOptions={PAGE_SIZES}
        onRecordsPerPageChange={(size) => { setPageSize(size); setPage(1); }}
        sortStatus={sortStatus}
        onSortStatusChange={handleSortChange}
        withTableBorder
        borderRadius="md"
        highlightOnHover
        striped
        columns={[
          {
            accessor: 'created_at',
            title: 'Created At',
            sortable: true,
            render: (row) =>
              row.created_at ? new Date(row.created_at).toLocaleString() : '—',
            width: 170,
          },
          { accessor: 'user_id', title: 'User ID', sortable: true, width: 200 },
          { accessor: 'platform', title: 'Platform', sortable: true, width: 110 },
          { accessor: 'level', title: 'Level', sortable: true, width: 70 },
          {
            accessor: 'reward_usd',
            title: 'Reward (USD)',
            sortable: true,
            width: 120,
            render: (row) =>
              row.reward_usd != null ? `$${row.reward_usd.toFixed(2)}` : row.reward_text ?? '—',
          },
          { accessor: 'reward_text', title: 'Reward Text', width: 160 },
          { accessor: 'chosen_reward', title: 'Chosen', width: 90 },
          {
            accessor: 'completed_at',
            title: 'Completed At',
            sortable: true,
            width: 170,
            render: (row) =>
              row.completed_at ? new Date(row.completed_at).toLocaleString() : '—',
          },
          {
            accessor: 'status',
            title: 'Status',
            sortable: true,
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
                leftSection={
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      flexShrink: 0,
                      backgroundColor:
                        STATUS_DOT_COLORS[pendingStatus[row.id] ?? row.status ?? ''] ??
                        'var(--mantine-color-gray-6)',
                    }}
                  />
                }
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


