# Reward Claim Tracker — New Project Setup Guide

This guide contains everything you need to bootstrap the **Reward Claim Tracker** website in a new workspace. It mirrors the VNCLC (`moneyx_feature_guide`) tech stack but removes Resend and Turnstile, connects to the **same Supabase database**, and deploys to Vercel as a separate project.

---

## Table of Contents

1. [Tech Stack](#1-tech-stack)
2. [Prerequisites](#2-prerequisites)
3. [Create the Next.js Project](#3-create-the-nextjs-project)
4. [Install Dependencies](#4-install-dependencies)
5. [Project Configuration Files](#5-project-configuration-files)
6. [Environment Variables](#6-environment-variables)
7. [Supabase Setup (Same Database)](#7-supabase-setup-same-database)
8. [Folder Structure](#8-folder-structure)
9. [Core Library Files](#9-core-library-files)
10. [TypeScript Types](#10-typescript-types)
11. [Dashboard Layout & Pages](#11-dashboard-layout--pages)
12. [API Routes](#12-api-routes)
13. [Vercel Deployment](#13-vercel-deployment)
14. [Environment Variables Reference](#14-environment-variables-reference)
15. [Relevant Database Tables](#15-relevant-database-tables)

---

## 1. Tech Stack

| Category | Package | Version | Notes |
|---|---|---|---|
| Framework | `next` | `^15.1.4` | App Router |
| UI Runtime | `react` / `react-dom` | `^19.0.0` | |
| Language | `typescript` | `^5.7.3` | strict mode |
| Component Library | `@mantine/core` | `^7.15.5` | |
| Mantine Hooks | `@mantine/hooks` | `^7.15.5` | |
| Data Table | `mantine-datatable` | `^8.3.13` | For the claims dashboard table |
| Icons | `lucide-react` | `^0.469.0` | |
| Database Client | `@supabase/supabase-js` | `^2.90.1` | |
| Font | `next/font/google` (Inter) | built-in | |

---

## 2. Prerequisites

Make sure these are installed on the new machine before starting:

```
Node.js  >= 20.x   (https://nodejs.org)
npm      >= 10.x   (bundled with Node)
Git                (https://git-scm.com)
VS Code            (recommended)
```

Login to the Supabase CLI (needed for type generation only):

```bash
npx supabase login
```

Login to Vercel CLI (optional, for CLI-based deploys):

```bash
npm i -g vercel
vercel login
```

---

## 3. Create the Next.js Project

Run this in your new workspace directory:

```bash
npx create-next-app@latest reward-claim-tracker \
  --typescript \
  --eslint \
  --app \
  --src-dir=false \
  --tailwind=false \
  --import-alias="@/*"

cd reward-claim-tracker
```

When prompted, choose:
- TypeScript → **Yes**
- ESLint → **Yes**
- App Router → **Yes**
- `src/` directory → **No**
- Tailwind CSS → **No**
- Import alias → **Yes** (`@/*`)

---

## 4. Install Dependencies

```bash
npm install \
  @mantine/core@^7.15.5 \
  @mantine/hooks@^7.15.5 \
  mantine-datatable@^8.3.13 \
  lucide-react@^0.469.0 \
  @supabase/supabase-js@^2.90.1
```

Dev dependencies (type generation):

```bash
npm install -D supabase@^2.72.8
```

---

## 5. Project Configuration Files

### `next.config.ts`

Replace the generated file with:

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
```

### `tsconfig.json`

Replace the generated file with:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts"
  ],
  "exclude": ["node_modules"]
}
```

### `middleware.ts`

Create at the project root:

```ts
// No middleware needed for this project
export const config = {
  matcher: [],
};
```

### `package.json` scripts

Add these scripts inside `"scripts"`:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "types:generate": "npx supabase gen types typescript --project-id yctqvpgofipnaziqdxsz > types/database.generated.ts",
  "types:update": "npm run types:generate && echo Types updated successfully!"
}
```

> `yctqvpgofipnaziqdxsz` is the existing VNCLC Supabase project ID. Do not change it — both projects share the same database.

---

## 6. Environment Variables

Create `.env.local` at the project root. **Never commit this file.**

```env
# ── Supabase (same project as VNCLC) ─────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://yctqvpgofipnaziqdxsz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InljdHF2cGdvZmlwbmF6aXFkeHN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3NTYzMTYsImV4cCI6MjA4NDMzMjMxNn0.ucIKBlk_Egr8L6kXV0ZdC_EUAhqXUE8C8uJ5fYTIydI
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InljdHF2cGdvZmlwbmF6aXFkeHN6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODc1NjMxNiwiZXhwIjoyMDg0MzMyMzE2fQ.mFmmX574tzbPRDWAOu3T6fcplqJDui505HRgOcjlbcE
```

---

## 7. Supabase Setup (Same Database)

This project reads from the **existing** VNCLC database. No new Supabase project is created. No migrations need to be run.

### Tables used by this dashboard

| Table | Purpose |
|---|---|
| `user_reward_claims` | All claim records (status, chosen_reward, level, etc.) |
| `partner_reward_configs` | Partner-configured reward levels per platform |
| `users` | User accounts (email, referral_id) |
| `own_referral_id_list` | Maps referral IDs to partner IDs |
| `licensed_accounts` | Trading lot volumes per user per platform |
| `user_reward_tracking` | Cached progress state per user |

### Regenerate TypeScript types

After cloning to a new machine, run:

```bash
npm run types:generate
```

This connects to Supabase and writes the full schema into `types/database.generated.ts`.

---

## 8. Folder Structure

Create this structure manually (or let the steps below create files in place):

```
reward-claim-tracker/
├── .env.local                  ← NOT committed to git
├── middleware.ts
├── next.config.ts
├── next-env.d.ts
├── package.json
├── tsconfig.json
│
├── app/
│   ├── globals.css             ← global dark-theme styles
│   ├── layout.tsx              ← root layout with MantineProvider
│   ├── page.tsx                ← redirect to /dashboard
│   │
│   ├── dashboard/
│   │   ├── layout.tsx          ← dashboard shell with sidebar nav
│   │   └── page.tsx            ← main claims table view
│   │
│   └── api/
│       ├── get-all-claims/
│       │   └── route.ts        ← admin: fetch all claims with filters
│       ├── update-claim-status/
│       │   └── route.ts        ← admin: mark claim as completed/rejected
│       └── get-dashboard-stats/
│           └── route.ts        ← aggregate stats (counts by status)
│
├── components/
│   ├── dashboard/
│   │   ├── ClaimsTable.tsx     ← mantine-datatable claims table
│   │   ├── StatsCards.tsx      ← summary stat cards
│   │   └── StatusBadge.tsx     ← colored badge for claim status
│   └── layout/
│       ├── AppShell.tsx        ← sidebar + header shell
│       └── NavLinks.tsx        ← navigation links
│
├── lib/
│   └── supabase.ts             ← Supabase client (server + public)
│
└── types/
    ├── database.generated.ts   ← auto-generated (npm run types:generate)
    ├── database.ts             ← helper type exports
    └── index.ts                ← barrel export
```

---

## 9. Core Library Files

### `lib/supabase.ts`

Copy this file exactly from VNCLC — it is identical:

```ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.generated';

/** Server-side client — uses service role key for full DB access */
export function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient<Database>(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/** Client-side client — uses anon key */
export function getSupabaseClientPublic() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey);
}
```

---

## 10. TypeScript Types

### `types/database.ts`

```ts
import type { Database } from './database.generated';

type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

// Reward claim tables
export type UserRewardClaim = Tables<'user_reward_claims'>;
export type UserRewardClaimInsert = TablesInsert<'user_reward_claims'>;
export type UserRewardClaimUpdate = TablesUpdate<'user_reward_claims'>;

export type PartnerRewardConfig = Tables<'partner_reward_configs'>;
export type UserRewardTracking = Tables<'user_reward_tracking'>;

// User & partner tables
export type User = Tables<'users'>;
export type LicensedAccount = Tables<'licensed_accounts'>;
```

### `types/index.ts`

```ts
export * from './database';
export type { Database } from './database.generated';
```

---

## 11. Dashboard Layout & Pages

### `app/globals.css`

```css
body {
  margin: 0;
  padding: 0;
  background-color: #1a1b1e;
  color: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  -webkit-font-smoothing: antialiased;
}

* { box-sizing: border-box; }

:root {
  --color-background: #1a1b1e;
  --color-surface: #25282a;
  --color-text: #ffffff;
  --color-accent: #FFB81C;
}
```

### `app/layout.tsx`

```tsx
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
```

### `app/page.tsx`

```tsx
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/dashboard');
}
```

### `app/dashboard/page.tsx`

This is the main claims view. It renders a server component that fetches aggregate stats, then passes the data to client-side table components:

```tsx
import { getSupabaseClient } from '@/lib/supabase';
import StatsCards from '@/components/dashboard/StatsCards';
import ClaimsTable from '@/components/dashboard/ClaimsTable';
import { Stack, Title } from '@mantine/core';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = getSupabaseClient();

  // Fetch recent claims (last 200 records) for the table
  const { data: claims } = await supabase
    .from('user_reward_claims')
    .select('id, user_id, partner_id, platform, level, reward_usd, reward_text, status, chosen_reward, completed_at, created_at, updated_at')
    .order('created_at', { ascending: false })
    .limit(200);

  // Aggregate counts per status
  const total = claims?.length ?? 0;
  const notClaimed = claims?.filter((c) => c.status === 'not_claimed').length ?? 0;
  const processing = claims?.filter((c) => c.status === 'processing').length ?? 0;
  const completed = claims?.filter((c) => c.status === 'completed').length ?? 0;

  return (
    <Stack p="xl" gap="lg">
      <Title order={2}>Reward Claims Dashboard</Title>
      <StatsCards
        total={total}
        notClaimed={notClaimed}
        processing={processing}
        completed={completed}
      />
      <ClaimsTable claims={claims ?? []} />
    </Stack>
  );
}
```

---

## 12. API Routes

### `app/api/get-all-claims/route.ts`

Paginated fetch with optional status filter for the dashboard:

```ts
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');     // optional filter
    const page = parseInt(searchParams.get('page') ?? '1', 10);
    const pageSize = 50;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const supabase = getSupabaseClient();

    let query = supabase
      .from('user_reward_claims')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, count, error } = await query;

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch claims' }, { status: 500 });
    }

    return NextResponse.json({ claims: data ?? [], total: count ?? 0, page, pageSize });
  } catch (err) {
    console.error('[get-all-claims] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### `app/api/update-claim-status/route.ts`

Admin endpoint to update a claim's status:

```ts
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

const VALID_STATUSES = ['not_claimed', 'processing', 'completed', 'rejected'] as const;

export async function POST(request: NextRequest) {
  try {
    const { claimId, status } = await request.json();

    if (!claimId || !status) {
      return NextResponse.json({ error: 'Missing claimId or status' }, { status: 400 });
    }

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    const updateData: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('user_reward_claims')
      .update(updateData)
      .eq('id', claimId);

    if (error) {
      console.error('[update-claim-status] error:', error);
      return NextResponse.json({ error: 'Failed to update claim' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[update-claim-status] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### `app/api/get-dashboard-stats/route.ts`

Aggregate totals across all claims:

```ts
import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('user_reward_claims')
      .select('status, reward_usd');

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }

    const stats = {
      total: data.length,
      not_claimed: data.filter((c) => c.status === 'not_claimed').length,
      processing: data.filter((c) => c.status === 'processing').length,
      completed: data.filter((c) => c.status === 'completed').length,
      rejected: data.filter((c) => c.status === 'rejected').length,
      total_reward_usd: data
        .filter((c) => c.status === 'completed')
        .reduce((sum, c) => sum + (c.reward_usd ?? 0), 0),
    };

    return NextResponse.json(stats);
  } catch (err) {
    console.error('[get-dashboard-stats] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

---

## 13. Vercel Deployment

### Step-by-step

1. **Push your new project to GitHub** (create a new, separate repository — do not push into the VNCLC repo):

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   gh repo create reward-claim-tracker --private --source=. --push
   # or use the GitHub website to create the repo then:
   git remote add origin https://github.com/<your-username>/reward-claim-tracker.git
   git push -u origin main
   ```

2. **Create a new Vercel project**:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click **Import Git Repository**
   - Select the new `reward-claim-tracker` repository
   - **Project Name**: `reward-claim-tracker`
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `.` (root)
   - Click **Deploy** (it will fail on first deploy — this is expected until env vars are added)

3. **Add environment variables in Vercel**:
   - After the project is created, go to **Project Settings → Environment Variables**
   - Add all three variables from Section 6 for **Production**, **Preview**, and **Development** environments:

   | Variable | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://yctqvpgofipnaziqdxsz.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InljdHF2cGdvZmlwbmF6aXFkeHN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3NTYzMTYsImV4cCI6MjA4NDMzMjMxNn0.ucIKBlk_Egr8L6kXV0ZdC_EUAhqXUE8C8uJ5fYTIydI` |
   | `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InljdHF2cGdvZmlwbmF6aXFkeHN6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODc1NjMxNiwiZXhwIjoyMDg0MzMyMzE2fQ.mFmmX574tzbPRDWAOu3T6fcplqJDui505HRgOcjlbcE` |

4. **Redeploy**:
   - Go to the **Deployments** tab
   - Click the three-dot menu on the latest deployment → **Redeploy**
   - The build should succeed

5. **Custom domain** (optional):
   - Go to **Project Settings → Domains**
   - Add your desired domain

### Vercel CLI alternative

```bash
vercel                     # deploy to preview
vercel --prod              # deploy to production
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
```

---

## 14. Environment Variables Reference

| Variable | Required | Exposed to client | Purpose |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | ✅ Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | ✅ Yes | Public anon key (RLS-restricted reads) |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | ❌ No | Full DB access from API routes |

> **Security note:** `SUPABASE_SERVICE_ROLE_KEY` bypasses Row Level Security. It must only be used in server-side API routes (`app/api/`), never in client components. The `NEXT_PUBLIC_` prefix on the other two variables is safe because those keys are already rate-limited and RLS-protected in Supabase.

---

## 15. Relevant Database Tables

Below is a quick reference for the tables this dashboard interacts with. Full TypeScript types are generated via `npm run types:generate`.

### `user_reward_claims`

The core table for this dashboard.

| Column | Type | Description |
|---|---|---|
| `id` | uuid | Primary key |
| `user_id` | text | FK → `users.id` |
| `partner_id` | text | FK → `users.id` (partner) |
| `platform` | text | e.g. `"exness"`, `"lirunex"` |
| `level` | int | Reward level (1–10) |
| `reward_usd` | decimal | USD cash reward amount |
| `reward_text` | varchar | Optional physical prize description |
| `status` | text | `not_claimed` / `processing` / `completed` / `rejected` |
| `chosen_reward` | text | `"usd"` or `"text"` — what the user picked |
| `completed_at` | timestamp | When the claim was fulfilled |
| `created_at` | timestamp | When the claim was created |
| `updated_at` | timestamp | Last status change |

### `partner_reward_configs`

Read-only reference for partner reward level configuration.

| Column | Type | Description |
|---|---|---|
| `uuid` | uuid | Primary key |
| `partner_id` | text | FK → `users.id` |
| `platform` | text | Trading platform |
| `level` | int | 0–10 |
| `lot_volume` | decimal | Lots required to reach this level |
| `reward_usd` | decimal | Cash payout |
| `reward_text` | varchar | Physical prize description |
| `is_active` | bool | Level enabled by partner |
| `is_applied` | bool | Platform activated by partner |

### `user_reward_tracking`

Cached progress snapshot per user.

| Column | Type | Description |
|---|---|---|
| `uuid` | uuid | Primary key |
| `user_id` | text | FK → `users.id` |
| `partner_id` | text | FK → `users.id` |
| `current_level` | int | Highest achieved level |
| `current_lot_volume` | decimal | Latest cached lot count |
| `eligible_for_prize` | bool | Unclaimed prize available |
| `last_calculated` | timestamp | Last recalculation time |

---

## Quick Start Checklist

- [ ] Node.js ≥ 20 installed on new machine
- [ ] `npx create-next-app` with options from Section 3
- [ ] `npm install` dependencies from Section 4
- [ ] Config files replaced (`next.config.ts`, `tsconfig.json`, `middleware.ts`)
- [ ] `.env.local` created with Supabase keys from Section 6
- [ ] `npm run types:generate` run successfully
- [ ] `npm run dev` starts without errors on `http://localhost:3000`
- [ ] New GitHub repository created and code pushed
- [ ] New Vercel project created as `reward-claim-tracker`
- [ ] Environment variables added in Vercel dashboard
- [ ] Vercel redeploy succeeds

