create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  role text not null check (role in ('admin','designer','company')),
  is_approved boolean not null default false,
  rejection_reason text default '',
  first_name text,
  last_name text,
  experience_level text,
  company_name text,
  contact_person text,
  phone text,
  address text,
  industry text,
  website text,
  bio text,
  availability text default 'Available',
  skills text[] default '{}',
  profile_image text,
  cv_file text,
  portfolio_items jsonb not null default '[]'::jsonb,
  fashion_projects jsonb not null default '[]'::jsonb,
  experience_entries jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.client_requests (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.profiles(id) on delete cascade,
  project_title text not null,
  description text not null,
  required_designers int not null default 1,
  duration text not null default '1 month',
  budget numeric,
  required_skills text[] not null default '{}',
  preferred_experience text not null default 'Any',
  is_public boolean not null default false,
  status text not null default 'New',
  assigned_designers uuid[] not null default '{}',
  rejection_reason text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  client_request_id uuid references public.client_requests(id) on delete set null,
  company_id uuid not null references public.profiles(id) on delete cascade,
  project_title text not null,
  description text default '',
  status text not null default 'Pending',
  budget numeric,
  designer_ids uuid[] not null default '{}',
  participants uuid[] not null default '{}',
  chat_enabled boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid references public.profiles(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  message text not null default '',
  attachments jsonb not null default '[]'::jsonb,
  is_read boolean not null default false,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.job_vacancies (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  location text not null default 'Remote',
  employment_type text not null default 'Contract',
  compensation text default '',
  skills text[] not null default '{}',
  status text not null default 'Draft',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.client_requests enable row level security;
alter table public.projects enable row level security;
alter table public.messages enable row level security;
alter table public.job_vacancies enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
for select to authenticated
using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
for insert to authenticated
with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
for update to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "requests_select_own_company" on public.client_requests;
create policy "requests_select_own_company" on public.client_requests
for select to authenticated
using (company_id = auth.uid());

drop policy if exists "requests_insert_own_company" on public.client_requests;
create policy "requests_insert_own_company" on public.client_requests
for insert to authenticated
with check (company_id = auth.uid());

drop policy if exists "requests_update_own_company" on public.client_requests;
create policy "requests_update_own_company" on public.client_requests
for update to authenticated
using (company_id = auth.uid())
with check (company_id = auth.uid());

drop policy if exists "projects_select_participants" on public.projects;
create policy "projects_select_participants" on public.projects
for select to authenticated
using (
  company_id = auth.uid()
  or auth.uid() = any(designer_ids)
  or auth.uid() = any(participants)
);

drop policy if exists "messages_select_participants" on public.messages;
create policy "messages_select_participants" on public.messages
for select to authenticated
using (
  sender_id = auth.uid()
  or receiver_id = auth.uid()
  or (
    project_id is not null
    and exists (
      select 1 from public.projects p
      where p.id = messages.project_id
      and (
        p.company_id = auth.uid()
        or auth.uid() = any(p.designer_ids)
        or auth.uid() = any(p.participants)
      )
    )
  )
);

drop policy if exists "messages_insert_sender" on public.messages;
create policy "messages_insert_sender" on public.messages
for insert to authenticated
with check (sender_id = auth.uid());

drop policy if exists "vacancies_public_read" on public.job_vacancies;
create policy "vacancies_public_read" on public.job_vacancies
for select to anon, authenticated
using (status = 'Published');
