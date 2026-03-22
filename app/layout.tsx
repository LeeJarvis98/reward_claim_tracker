import {
  MantineProvider,
  ColorSchemeScript,
  createTheme,
  type MantineColorsTuple,
} from '@mantine/core';
import '@mantine/core/styles.css';
import 'mantine-datatable/styles.css';
import './globals.css';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Reward Claim Tracker',
  description: 'Dashboard for monitoring reward claims',
};

const accentColor: MantineColorsTuple = [
  '#FFF8E6', '#FFECB8', '#FFE08A', '#FFD45C', '#FFC82E',
  '#FFB81C', '#E6A619', '#CC9416', '#FFB81C', '#FFC82E',
];

const theme = createTheme({
  colors: { accent: accentColor },
  primaryColor: 'accent',
  black: '#000000',
  white: '#FFFFFF',
  defaultRadius: 'md',
  fontFamily:
    'var(--font-inter), -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} data-mantine-color-scheme="dark">
      <head>
        <ColorSchemeScript defaultColorScheme="dark" />
      </head>
      <body>
        <MantineProvider theme={theme} defaultColorScheme="dark">
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
