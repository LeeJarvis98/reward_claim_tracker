'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { Button, Group, TextInput, Text, ActionIcon, Tooltip, Stack, Title, Alert, Select } from '@mantine/core';
import { RefreshCw, Trash2, Plus, Search } from 'lucide-react';

interface LicensedAccount {
  account_id: string;
  email: string;
  uid: string;
  licensed_date: string;
  id: string | null;
  platform: string | null;
  licensed_status: string | null;
  owner: string | null;
  lot_volume: number | null;
  reward: number | null;
  registered_at: string | null;
  entry_volume_lots: number | null;
  entry_reward: number | null;
}

interface LicensedAccountsTableProps {
  accounts: LicensedAccount[];
}

const PAGE_SIZES = [10, 25, 50];

export default function LicensedAccountsTable({ accounts: initialAccounts }: LicensedAccountsTableProps) {
  const router = useRouter();
  const [accounts, setAccounts] = useState(initialAccounts);
  const [newAccountId, setNewAccountId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    setAccounts(initialAccounts);
    setIsRefreshing(false);
  }, [initialAccounts]);

  function handleRefresh() {
    setIsRefreshing(true);
    router.refresh();
  }
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus<LicensedAccount>>({
    columnAccessor: 'licensed_date',
    direction: 'desc',
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);

  const platformOptions = useMemo(() => {
    const unique = [...new Set(accounts.map((a) => a.platform).filter(Boolean))] as string[];
    return unique.map((p) => ({ value: p, label: p }));
  }, [accounts]);

  const statusOptions = useMemo(() => {
    const unique = [...new Set(accounts.map((a) => a.licensed_status).filter(Boolean))] as string[];
    return unique.map((s) => ({ value: s, label: s }));
  }, [accounts]);

  const filtered = useMemo(() => {
    let result = accounts;

    if (platformFilter) {
      result = result.filter((a) => a.platform === platformFilter);
    }

    if (statusFilter) {
      result = result.filter((a) => a.licensed_status === statusFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((a) =>
        [a.account_id, a.email, a.uid, a.owner, a.platform]
          .some((v) => v?.toLowerCase().includes(q))
      );
    }

    const { columnAccessor, direction } = sortStatus;
    result = [...result].sort((a, b) => {
      const aVal = a[columnAccessor as keyof LicensedAccount];
      const bVal = b[columnAccessor as keyof LicensedAccount];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return direction === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [accounts, platformFilter, statusFilter, search, sortStatus]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  async function handleAdd() {
    if (!newAccountId.trim()) return;
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('/api/add-licensed-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId: newAccountId.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to add account');
        return;
      }
      const now = new Date().toISOString();
      setAccounts((prev) => [
        {
          account_id: newAccountId.trim(),
          email: 'manual@account.com',
          uid: 'manual_account',
          licensed_date: now,
          id: 'ADMIN',
          platform: 'exness',
          licensed_status: 'licensed',
          owner: 'ADMIN',
          lot_volume: null,
          reward: null,
          registered_at: now,
          entry_volume_lots: null,
          entry_reward: null,
        },
        ...prev,
      ]);
      setNewAccountId('');
      setSuccess(`Account "${newAccountId.trim()}" added successfully.`);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(accountId: string) {
    setDeleting(accountId);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('/api/delete-licensed-account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId }),
      });
      if (res.ok) {
        setAccounts((prev) => prev.filter((a) => a.account_id !== accountId));
        setSuccess(`Account "${accountId}" deleted.`);
      } else {
        const data = await res.json();
        setError(data.error ?? 'Failed to delete account');
      }
    } finally {
      setDeleting(null);
    }
  }

  return (
    <Stack gap="lg">
      <div>
        <Title order={4} mb="xs">Add Account ID</Title>
        <Group align="flex-end" gap="sm">
          <TextInput
            placeholder="Enter account ID..."
            value={newAccountId}
            onChange={(e) => setNewAccountId(e.currentTarget.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
            style={{ width: 300 }}
            label="Account ID"
          />
          <Button
            leftSection={<Plus size={16} />}
            loading={submitting}
            onClick={handleAdd}
            disabled={!newAccountId.trim()}
          >
            Add Account
          </Button>
        </Group>
        {error && <Alert color="red" mt="xs" withCloseButton onClose={() => setError(null)}>{error}</Alert>}
        {success && <Alert color="green" mt="xs" withCloseButton onClose={() => setSuccess(null)}>{success}</Alert>}
      </div>

      <div>
        <Group mb="xs" justify="space-between">
          <Title order={4}>Licensed Accounts</Title>
          <Group gap="sm">
            <Button
              leftSection={<RefreshCw size={14} />}
              variant="subtle"
              size="sm"
              loading={isRefreshing}
              onClick={handleRefresh}
            >
              Refresh
            </Button>
            <Text size="sm" c="dimmed">{filtered.length} record{filtered.length !== 1 ? 's' : ''}</Text>
          </Group>
        </Group>
        <Group mb="sm" wrap="wrap">
          <TextInput
            placeholder="Search account, email, UID, owner..."
            leftSection={<Search size={14} />}
            value={search}
            onChange={(e) => { setSearch(e.currentTarget.value); setPage(1); }}
            style={{ width: 280 }}
          />
          <Select
            placeholder="Filter by platform"
            clearable
            value={platformFilter}
            onChange={(v) => { setPlatformFilter(v); setPage(1); }}
            data={platformOptions}
            style={{ width: 180 }}
          />
          <Select
            placeholder="Filter by status"
            clearable
            value={statusFilter}
            onChange={(v) => { setStatusFilter(v); setPage(1); }}
            data={statusOptions}
            style={{ width: 180 }}
          />
        </Group>
        <DataTable
          records={paginated}
          idAccessor="account_id"
          totalRecords={filtered.length}
          recordsPerPage={pageSize}
          page={page}
          onPageChange={setPage}
          recordsPerPageOptions={PAGE_SIZES}
          onRecordsPerPageChange={(size) => { setPageSize(size); setPage(1); }}
          sortStatus={sortStatus}
          onSortStatusChange={(s) => { setSortStatus(s); setPage(1); }}
          withTableBorder
          borderRadius="md"
          highlightOnHover
          striped
          columns={[
            { accessor: 'account_id', title: 'Account ID', sortable: true, width: 150 },
            { accessor: 'email', title: 'Email', sortable: true, width: 190 },
            { accessor: 'uid', title: 'UID', sortable: true, width: 150 },
            { accessor: 'platform', title: 'Platform', sortable: true, width: 100 },
            { accessor: 'licensed_status', title: 'Status', sortable: true, width: 100 },
            { accessor: 'owner', title: 'Owner', sortable: true, width: 100 },
            {
              accessor: 'licensed_date',
              title: 'Licensed At',
              sortable: true,
              width: 170,
              render: (row) => row.licensed_date ? new Date(row.licensed_date).toLocaleString() : '-',
            },
            {
              accessor: 'registered_at',
              title: 'Registered At',
              sortable: true,
              width: 170,
              render: (row) => row.registered_at ? new Date(row.registered_at).toLocaleString() : '-',
            },
            { accessor: 'lot_volume', title: 'Lot Volume', sortable: true, width: 100 },
            { accessor: 'reward', title: 'Reward', sortable: true, width: 90 },
            {
              accessor: 'actions',
              title: '',
              width: 60,
              render: (row) => (
                <Tooltip label="Delete row">
                  <ActionIcon
                    color="red"
                    size="sm"
                    variant="subtle"
                    loading={deleting === row.account_id}
                    onClick={() => handleDelete(row.account_id)}
                  >
                    <Trash2 size={14} />
                  </ActionIcon>
                </Tooltip>
              ),
            },
          ]}
        />
      </div>
    </Stack>
  );
}