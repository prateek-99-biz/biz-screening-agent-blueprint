-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- roles table
-- ============================================================
create table public.roles (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  company_name text default 'Biz Group',
  hiring_manager_email text,
  job_description text,
  call_duration_min int default 10,
  call_duration_max int default 12,
  call_hard_limit_minutes int default 15,
  notice_period_threshold_weeks int default 2,
  language_requirements text,
  capture_arabic_capability boolean default false,
  scenario_questions jsonb,
  logic_question jsonb,
  feedback_question text,
  feedback_probe text,
  culture_intro text,
  culture_statements jsonb,
  scoring_rubric jsonb,
  voice_id text not null,
  elevenlabs_agent_id text,
  shareable_link text,
  status text default 'draft',
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_roles_updated
  before update on public.roles
  for each row
  execute function public.handle_updated_at();

-- ============================================================
-- candidates table
-- ============================================================
create table public.candidates (
  id uuid primary key default uuid_generate_v4(),
  role_id uuid references public.roles(id) not null,
  elevenlabs_conversation_id text unique,
  candidate_name text,
  candidate_email text,
  candidate_phone text,
  notice_period text,
  language_profile text,
  arabic_capability boolean,
  scenario_responses jsonb,
  logic_answer text,
  logic_correct boolean,
  feedback_response text,
  culture_ratings jsonb,
  call_outcome text,
  call_duration_seconds int,
  transcript jsonb,
  triage_decision text,
  triage_confidence numeric(3,2),
  triage_reasoning text,
  triage_concerns text[],
  triage_scores jsonb,
  hr_action text,
  hr_notes text,
  hr_action_at timestamptz,
  hr_action_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- ============================================================
-- RLS
-- ============================================================
alter table public.roles enable row level security;
alter table public.candidates enable row level security;

-- Roles policies: authenticated users can do everything
create policy "Authenticated users can select roles"
  on public.roles for select
  to authenticated
  using (true);

create policy "Authenticated users can insert roles"
  on public.roles for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update roles"
  on public.roles for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated users can delete roles"
  on public.roles for delete
  to authenticated
  using (true);

-- Candidates policies: authenticated users can do everything
create policy "Authenticated users can select candidates"
  on public.candidates for select
  to authenticated
  using (true);

create policy "Authenticated users can insert candidates"
  on public.candidates for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update candidates"
  on public.candidates for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated users can delete candidates"
  on public.candidates for delete
  to authenticated
  using (true);
