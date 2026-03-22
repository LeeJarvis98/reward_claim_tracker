'use client';

import {
  AppShell as MantineAppShell,
  Burger,
  Group,
  Text,
  useMantineColorScheme,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import NavLinks from './NavLinks';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [opened, { toggle }] = useDisclosure();

  return (
    <MantineAppShell
      header={{ height: 56 }}
      navbar={{ width: 220, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="0"
    >
      <MantineAppShell.Header style={{ backgroundColor: '#25282a', borderBottom: '1px solid #333' }}>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Text fw={700} size="md" style={{ color: '#FFB81C' }}>
              Reward Tracker
            </Text>
          </Group>
        </Group>
      </MantineAppShell.Header>

      <MantineAppShell.Navbar p="sm" style={{ backgroundColor: '#1e2023', borderRight: '1px solid #333' }}>
        <NavLinks />
      </MantineAppShell.Navbar>

      <MantineAppShell.Main style={{ backgroundColor: '#1a1b1e', minHeight: '100vh' }}>
        {children}
      </MantineAppShell.Main>
    </MantineAppShell>
  );
}
