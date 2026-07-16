create extension if not exists pgcrypto;

create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  plan text default 'starter',
  status text default 'active',
  created_at timestamptz default now()
);

create table if not exists roles (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  description text
);

create table if not exists organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  user_id uuid not null,
  role_id uuid references roles(id),
  status text default 'active',
  created_at timestamptz default now(),
  unique (organization_id, user_id)
);

create table if not exists permissions (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  description text
);

create table if not exists role_permissions (
  role_id uuid references roles(id) on delete cascade,
  permission_id uuid references permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

create table if not exists user_scopes (
  id uuid primary key default gen_random_uuid(),
  organization_member_id uuid references organization_members(id) on delete cascade,
  scope_type text not null,
  scope_value text not null,
  created_at timestamptz default now()
);

create table if not exists data_sources (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  name text not null,
  source_type text not null,
  source_ref text,
  owner_member_id uuid references organization_members(id),
  refresh_frequency text,
  quality_score numeric,
  last_synced_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists import_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  data_source_id uuid references data_sources(id),
  started_at timestamptz default now(),
  completed_at timestamptz,
  status text default 'running',
  files_checked integer default 0,
  rows_imported integer default 0
);

create table if not exists import_errors (
  id uuid primary key default gen_random_uuid(),
  import_run_id uuid references import_runs(id) on delete cascade,
  source_file text,
  sheet_name text,
  row_number integer,
  error_type text,
  error_message text,
  created_at timestamptz default now()
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  title text not null,
  description text,
  status text default 'open',
  priority text default 'normal',
  assigned_to_member_id uuid references organization_members(id),
  due_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  actor_user_id uuid,
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  plan text not null,
  status text default 'trialing',
  current_period_start date,
  current_period_end date,
  created_at timestamptz default now()
);

create table if not exists schools (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  school_name text not null,
  normalized_school_name text,
  county text,
  sub_county text,
  region text,
  nemis_kemis_number text,
  school_type text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists code_clubs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  school_id uuid references schools(id) on delete cascade,
  club_name text,
  club_status text,
  is_active boolean,
  active_learners integer,
  girls_participating integer,
  meeting_frequency text,
  portal_status text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists people (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  role_label text,
  school_id uuid references schools(id),
  county text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create or replace view dashboard_overview as
select
  o.id as organization_id,
  o.name as organization_name,
  count(distinct s.id) as schools_count,
  count(distinct c.id) as code_clubs_count,
  count(distinct c.id) filter (where c.is_active = true) as active_code_clubs_count,
  count(distinct p.id) as people_count
from organizations o
left join schools s on s.organization_id = o.id
left join code_clubs c on c.organization_id = o.id
left join people p on p.organization_id = o.id
group by o.id, o.name;

insert into roles (name, description) values
  ('Platform Owner', 'Manages all organizations, billing, plans, and global settings'),
  ('Organization Admin', 'Manages organization users, spaces, imports, and settings'),
  ('M&E Manager', 'Manages indicators, validates reports, and approves reporting'),
  ('Data Officer', 'Uploads data, cleans records, and resolves data quality issues'),
  ('Programme Lead', 'Views programme dashboards and delivery progress'),
  ('County Officer', 'Views and updates assigned county records'),
  ('Donor Viewer', 'Read-only access to approved dashboards and reports')
on conflict (name) do nothing;

insert into permissions (key, description) values
  ('dashboard.view', 'View dashboards'),
  ('data.import', 'Upload or sync data'),
  ('data.clean', 'Clean and edit imported records'),
  ('report.approve', 'Approve reporting outputs'),
  ('users.manage', 'Manage organization users and roles'),
  ('billing.manage', 'Manage subscription and billing'),
  ('tasks.manage', 'Create and update operational tasks')
on conflict (key) do nothing;

create index if not exists idx_members_org on organization_members(organization_id);
create index if not exists idx_sources_org on data_sources(organization_id);
create index if not exists idx_schools_org on schools(organization_id);
create index if not exists idx_clubs_org on code_clubs(organization_id);
create index if not exists idx_people_org on people(organization_id);
