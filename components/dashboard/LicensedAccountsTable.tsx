'use client';

import { useState } from 'react';
import { DataTable } from 'mantine-datatable';
import { Button, Group, TextInput, Text, ActionIcon, Tooltip, Stack, Title, Alert } from '@mantine/core';
import { Trash2, Plus } from 'lucide-react';

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

export default function LicensedAccountsTable({ accounts: initialAccounts }: LicensedAccountsTableProps) {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [newAccountId, setNewAccountId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
        <Group mb="xs">
          <Title order={4}>Licensed Accounts</Title>
          <Text size="sm" c="dimmed">{accounts.length} record{accounts.length !== 1 ? 's' : ''}</Text>
        </Group>
        <DataTable
          records={accounts}
          withTableBorder
          borderRadius="md"
          highlightOnHover
          striped
          columns={[
            { accessor: 'account_id', title: 'Account ID', width: 150 },
            { accessor: 'email', title: 'Email', width: 190 },
            { accessor: 'uid', title: 'UID', width: 150 },
            { accessor: 'platform', title: 'Platform', width: 100 },
            { accessor: 'licensed_status', title: 'Status', width: 100 },
            { accessor: 'owner', title: 'Owner', width: 100 },
            {
              accessor: 'licensed_date',
              title: 'Licensed At',
              width: 170,
              render: (row) => row.licensed_date ? new Date(row.licensed_date).toLocaleString() : '-',
            },
            {
              accessor: 'registered_at',
              title: 'Registered At',
              width: 170,
              render: (row) => row.registered_at ? new Date(row.registered_at).toLocaleString() : '-',
            },
            { accessor: 'lot_volume', title: 'Lot Volume', width: 100 },
            { accessor: 'reward', title: 'Reward', width: 90 },
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