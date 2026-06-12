-- Supabase / PostgreSQL schema for FiberLink Pro
-- Run this in Supabase SQL Editor or your PostgreSQL client.

create table if not exists plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  speed text,
  upload text,
  price numeric(10,2) not null default 0,
  status text not null default 'active',
  clients int not null default 0,
  color text default '#2563eb',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  phone text,
  plan_id uuid references plans(id) on delete set null,
  plan_name text,
  status text not null default 'active',
  ip text,
  address text,
  joined date,
  last_payment date,
  balance numeric(10,2) not null default 0,
  avatar text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete set null,
  client_name text,
  amount numeric(10,2) not null default 0,
  method text,
  status text not null default 'pending',
  date date,
  invoice text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists contracts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete set null,
  client_name text,
  plan_id uuid references plans(id) on delete set null,
  plan_name text,
  start_date date,
  end_date date,
  status text not null default 'active',
  value numeric(10,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop table if exists users cascade;
create table users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password_hash text not null,
  role text not null default 'user',
  status text not null default 'active',
  avatar text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Optional: create a view for client summaries
drop view if exists client_summary;
create view client_summary as
select
  c.id,
  c.name,
  c.email,
  c.plan_name,
  c.status,
  c.ip,
  c.balance,
  c.joined,
  c.last_payment,
  count(p.*) as payments_count,
  sum(case when p.status = 'paid' then p.amount else 0 end) as total_paid
from clients c
left join payments p on p.client_id = c.id
group by c.id, c.name, c.email, c.plan_name, c.status, c.ip, c.balance, c.joined, c.last_payment;

-- Insert default admin user (password: admin123)
insert into users (name, email, password_hash, role, status)
values (
  'Admin User',
  'admin@fiberlink.local',
  'YWRtaW4xMjM=',
  'admin',
  'active'
) on conflict (email) do nothing;

-- Realtime policies: allow authenticated users to select/insert/update if using Supabase auth.
-- You can also enable row level security and create policies later.
