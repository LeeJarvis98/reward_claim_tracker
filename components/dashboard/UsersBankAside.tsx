'use client';

import { useState } from 'react';
import { TextInput, Text, Stack, Paper, Title, Badge, ScrollArea } from '@mantine/core';
import { Search } from 'lucide-react';
import type { Json } from '@/types/database.generated';

interface User {
  id: string;
  email: string;
  bank_info: Json | null;
  status: string;
  referral_id: string;
  created_at: string;
}

interface UsersBankAsideProps {
  users: User[];
}

function formatBankInfo(info: Json | null): string {
  if (!info || typeof info !== 'object' || Array.isArray(info)) return '-';
  const entries = Object.entries(info as Record<string, unknown>)
    .filter(([, v]) => v != null && v !== '')
    .map(([k, v]) => `${k}: ${v}`);
  return entries.length > 0 ? entries.join('\n') : '-';
}

export default function UsersBankAside({ users }: UsersBankAsideProps) {
  const [search, setSearch] = useState('');

  const filtered = search
    ? users.filter(
        (u) =>
          u.email.toLowerCase().includes(search.toLowerCase()) ||
          u.id.toLowerCase().includes(search.toLowerCase())
      )
    : users;

  return (
    <>
      <Title order={5} mb="sm">Users Bank Info</Title>
      <TextInput
        placeholder="Search by email or ID..."
        leftSection={<Search size={14} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
        mb="xs"
      />
      <Text size="xs" c="dimmed" mb="xs">
        {filtered.length} user{filtered.length !== 1 ? 's' : ''}
      </Text>
      <ScrollArea style={{ flex: 1 }} type="scroll">
        <Stack gap="xs">
          {filtered.map((user) => (
            <Paper key={user.id} withBorder p="sm" radius="md">
              <Text size="sm" fw={500} style={{ wordBreak: 'break-all' }}>{user.email}</Text>
              <Text size="xs" c="dimmed" style={{ wordBreak: 'break-all' }} mb={4}>{user.id}</Text>
              <Badge size="xs" variant="light" mb={6}>{user.status}</Badge>
              <Text size="xs" c="dimmed" style={{ whiteSpace: 'pre-line' }}>
                {formatBankInfo(user.bank_info)}
              </Text>
            </Paper>
          ))}
          {filtered.length === 0 && (
            <Text size="sm" c="dimmed" ta="center" py="md">No users found</Text>
          )}
        </Stack>
      </ScrollArea>
    </>
  );
}