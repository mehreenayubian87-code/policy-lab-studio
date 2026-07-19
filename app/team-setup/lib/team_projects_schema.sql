create table if not exists public.team_projects (
  project_number text primary key,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  password_hash text not null,
  project_id text not null,
  group_number text,
  course_name text,
  professor_name text,
  project_state jsonb not null
);

create index if not exists team_projects_updated_at_idx
  on public.team_projects (updated_at desc);

alter table public.team_projects enable row level security;

drop policy if exists "Service role can manage team projects"
  on public.team_projects;

create policy "Service role can manage team projects"
  on public.team_projects
  for all
  to service_role
  using (true)
  with check (true);
