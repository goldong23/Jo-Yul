create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  supabase_user_id uuid not null unique references auth.users(id) on delete cascade,
  email text not null,
  nickname text not null unique,
  role text not null default 'member' check (role in ('member', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.members enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'members' and policyname = 'members are readable for nickname lookup'
  ) then
    create policy "members are readable for nickname lookup"
    on public.members
    for select
    to anon, authenticated
    using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'members' and policyname = 'users can insert own profile'
  ) then
    create policy "users can insert own profile"
    on public.members
    for insert
    to authenticated
    with check (auth.uid() = supabase_user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'members' and policyname = 'users can update own profile'
  ) then
    create policy "users can update own profile"
    on public.members
    for update
    to authenticated
    using (auth.uid() = supabase_user_id)
    with check (auth.uid() = supabase_user_id);
  end if;
end $$;

create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  team_id text not null,
  member_id uuid not null,
  nickname text not null,
  joined_at timestamptz not null default now()
);

alter table public.team_members enable row level security;

insert into storage.buckets (id, name, public)
values ('submissions', 'submissions', false)
on conflict (id) do nothing;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'authenticated users can upload submissions'
  ) then
    create policy "authenticated users can upload submissions"
    on storage.objects
    for insert
    to authenticated
    with check (bucket_id = 'submissions');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'authenticated users can read submissions'
  ) then
    create policy "authenticated users can read submissions"
    on storage.objects
    for select
    to authenticated
    using (bucket_id = 'submissions');
  end if;
end $$;
