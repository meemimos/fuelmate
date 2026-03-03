create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz default now()
);

create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz default now()
);

create table if not exists public.group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz default now()
);

create table if not exists public.price_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  fuel_type text not null check (fuel_type in ('Unleaded', 'Premium', 'Diesel', 'E10')),
  threshold_cents numeric not null,
  station_name text,
  is_active boolean not null default true,
  last_triggered_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists public.fill_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  group_id uuid references public.groups (id) on delete set null,
  station_name text not null,
  fuel_type text not null check (fuel_type in ('Unleaded', 'Premium', 'Diesel', 'E10')),
  locked_price_cents numeric not null,
  pump_price_cents numeric not null,
  litres numeric not null,
  saved_dollars numeric generated always as (
    greatest(
      0,
      least(
        ((pump_price_cents - locked_price_cents) / 100.0) * litres,
        0.25 * litres
      )
    )
  ) stored,
  filled_at date not null,
  created_at timestamptz default now()
);

create table if not exists public.station_prices (
  id uuid primary key default gen_random_uuid(),
  station_name text not null,
  brand text,
  address text,
  lat numeric,
  lng numeric,
  fuel_type text not null,
  price_cents numeric not null,
  last_updated timestamptz
);

alter table public.profiles enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.price_alerts enable row level security;
alter table public.fill_records enable row level security;
alter table public.station_prices enable row level security;

create policy "profiles read own"
  on public.profiles
  for select
  using (auth.uid() = id);

create policy "profiles update own"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "groups read memberships"
  on public.groups
  for select
  using (
    owner_id = auth.uid()
    or exists (
      select 1
      from public.group_members gm
      where gm.group_id = groups.id
        and gm.user_id = auth.uid()
    )
  );

create policy "groups insert owner"
  on public.groups
  for insert
  with check (owner_id = auth.uid());

create policy "groups update owner"
  on public.groups
  for update
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "groups delete owner"
  on public.groups
  for delete
  using (owner_id = auth.uid());

create policy "group_members read own"
  on public.group_members
  for select
  using (user_id = auth.uid());

create policy "price_alerts select own"
  on public.price_alerts
  for select
  using (user_id = auth.uid());

create policy "price_alerts insert own"
  on public.price_alerts
  for insert
  with check (user_id = auth.uid());

create policy "price_alerts update own"
  on public.price_alerts
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "price_alerts delete own"
  on public.price_alerts
  for delete
  using (user_id = auth.uid());

create policy "fill_records select own_or_group"
  on public.fill_records
  for select
  using (
    user_id = auth.uid()
    or (
      group_id is not null
      and exists (
        select 1
        from public.group_members gm
        where gm.group_id = fill_records.group_id
          and gm.user_id = auth.uid()
      )
    )
  );

create policy "fill_records insert own"
  on public.fill_records
  for insert
  with check (user_id = auth.uid());

create policy "station_prices public read"
  on public.station_prices
  for select
  using (true);

create policy "station_prices service write"
  on public.station_prices
  for insert
  with check (auth.role() = 'service_role');

create policy "station_prices service update"
  on public.station_prices
  for update
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "station_prices service delete"
  on public.station_prices
  for delete
  using (auth.role() = 'service_role');
