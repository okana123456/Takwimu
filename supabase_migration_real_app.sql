create extension if not exists pgcrypto;

create table if not exists programmes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  created_at timestamptz default now(),
  unique (organization_id, slug)
);

create table if not exists programme_drive_folders (
  id uuid primary key default gen_random_uuid(),
  programme_id uuid references programmes(id) on delete cascade,
  drive_folder_id text not null,
  drive_folder_url text not null,
  folder_name text,
  sync_status text default 'pending',
  last_synced_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists programme_files (
  id uuid primary key default gen_random_uuid(),
  programme_id uuid references programmes(id) on delete cascade,
  drive_folder_id uuid references programme_drive_folders(id) on delete set null,
  file_name text not null,
  file_type text,
  mime_type text,
  drive_file_id text,
  drive_url text,
  category text not null default 'data_file',
  imported_rows integer default 0,
  imported_sheets integer default 0,
  analysis_status text default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists programme_resources (
  id uuid primary key default gen_random_uuid(),
  programme_id uuid references programmes(id) on delete cascade,
  title text not null,
  resource_type text not null,
  resource_url text,
  storage_path text,
  description text,
  reporting_period text,
  uploaded_by uuid,
  created_at timestamptz default now()
);

create table if not exists programme_indicators (
  id uuid primary key default gen_random_uuid(),
  programme_id uuid references programmes(id) on delete cascade,
  indicator_name text not null,
  target_value numeric,
  actual_value numeric,
  unit text,
  reporting_period text,
  created_at timestamptz default now()
);

create table if not exists programme_audit_logs (
  id uuid primary key default gen_random_uuid(),
  programme_id uuid references programmes(id) on delete cascade,
  actor_user_id uuid,
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

insert into programmes (organization_id, name, slug, description)
select id, 'Canva', 'canva', 'Verified schools, champion applications, training assets, posters, reports, and evidence.'
from organizations
on conflict (organization_id, slug) do nothing;

insert into programmes (organization_id, name, slug, description)
select id, 'Code Clubs', 'code-clubs', 'Registered clubs, active clubs, learners, mentorship, reports, and verification.'
from organizations
on conflict (organization_id, slug) do nothing;

insert into programmes (organization_id, name, slug, description)
select id, 'AI Skilling', 'ai-skilling', 'Training registration, attendance, completion, reporting, and proof of execution.'
from organizations
on conflict (organization_id, slug) do nothing;

insert into programmes (organization_id, name, slug, description)
select id, 'Experience AI', 'experience-ai', 'Teacher sessions, participation data, resources, recordings, posters, reports, and evidence.'
from organizations
on conflict (organization_id, slug) do nothing;

insert into programmes (organization_id, name, slug, description)
select id, 'SIA', 'sia', 'STEAMLabs Innovation Academy enrolment, learner data, payments, classes, posters, and reports.'
from organizations
on conflict (organization_id, slug) do nothing;

create index if not exists idx_programmes_org on programmes(organization_id);
create index if not exists idx_programme_files_programme on programme_files(programme_id);
create index if not exists idx_programme_files_category on programme_files(category);
create index if not exists idx_programme_resources_programme on programme_resources(programme_id);
create index if not exists idx_programme_resources_type on programme_resources(resource_type);
