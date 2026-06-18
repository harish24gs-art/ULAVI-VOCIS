create extension if not exists "pgcrypto";

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  reference_number text unique not null,
  service_type text not null,
  name text,
  email text,
  phone text,
  language text,
  summary text,
  status text not null default 'new',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  message text not null,
  created_at timestamptz not null default now()
);

create index if not exists leads_status_created_at_idx on public.leads(status, created_at desc);
create index if not exists leads_service_type_idx on public.leads(service_type);
create index if not exists messages_lead_id_created_at_idx on public.messages(lead_id, created_at);

alter table public.leads enable row level security;
alter table public.messages enable row level security;

drop policy if exists "ulavi_leads_insert" on public.leads;
drop policy if exists "ulavi_leads_select" on public.leads;
drop policy if exists "ulavi_messages_insert" on public.messages;
drop policy if exists "ulavi_messages_select" on public.messages;

create policy "ulavi_leads_insert"
on public.leads
for insert
to anon, authenticated
with check (true);

create policy "ulavi_leads_select"
on public.leads
for select
to anon, authenticated
using (true);

create policy "ulavi_messages_insert"
on public.messages
for insert
to anon, authenticated
with check (true);

create policy "ulavi_messages_select"
on public.messages
for select
to anon, authenticated
using (true);

-- Fresh project setup:
-- 1. Open Supabase Dashboard -> SQL Editor.
-- 2. Paste this whole file and run it.
-- 3. Restart the backend so it picks up the new SUPABASE_URL and key.
--
-- The current backend can run with SUPABASE_PUBLISHABLE_KEY for lead submission.
-- For production, prefer a real service-role key on the backend and replace these
-- broad anon select policies with reference-scoped RPC access.
