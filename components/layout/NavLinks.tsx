'use client';

import { NavLink } from '@mantine/core';
import { LayoutDashboard, PlusCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const links = [
  { href: '/dashboard', label: 'Claims Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/add-account', label: 'Add Account ID', icon: PlusCircle },
];

export default function NavLinks() {
  const pathname = usePathname();

  const bestMatch = links
    .filter(link => pathname === link.href || pathname.startsWith(link.href + '/'))
    .sort((a, b) => b.href.length - a.href.length)[0];

  const isActive = (href: string) => bestMatch?.href === href;

  return (
    <>
      {links.map(({ href, label, icon: Icon }) => (
        <NavLink
          key={href}
          component={Link}
          href={href}
          label={label}
          leftSection={<Icon size={16} />}
          active={isActive(href)}
        />
      ))}
    </>
  );
}
