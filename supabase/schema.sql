create extension if not exists pgcrypto;

create table if not exists public.survey_responses (
  id uuid primary key default gen_random_uuid(),
  audience_slug text not null,
  name text not null,
  whatsapp text not null,
  email text,
  age_range text,
  city text,
  source text,
  detected_profile text,
  interest_level text,
  urgency_score integer default 0,
  lead_status text default 'Novo',
  priority text default 'media',
  next_contact_at timestamptz,
  internal_notes text,
  delivered_offer text,
  last_message_at timestamptz,
  converted_at timestamptz,
  conversion_status text default 'lead',
  program_suggested text,
  followup_count integer default 0,
  last_followup_suggestion text,
  weekly_report_bucket text,
  lost_reason text,
  created_at timestamptz not null default now()
);

create table if not exists public.survey_answers (
  id uuid primary key default gen_random_uuid(),
  response_id uuid not null references public.survey_responses(id) on delete cascade,
  question_key text not null,
  answer_value text,
  answer_values jsonb,
  comment text,
  created_at timestamptz not null default now()
);

create table if not exists public.survey_generated_messages (
  id uuid primary key default gen_random_uuid(),
  response_id uuid not null references public.survey_responses(id) on delete cascade,
  message_type text not null default 'whatsapp_deep_dive',
  headline text,
  whatsapp_text text,
  deep_dive_summary text,
  free_offer_suggestion text,
  next_step_suggestion text,
  created_at timestamptz not null default now()
);

create table if not exists public.lead_notes (
  id uuid primary key default gen_random_uuid(),
  response_id uuid not null references public.survey_responses(id) on delete cascade,
  note text not null,
  created_at timestamptz not null default now()
);

alter table public.survey_responses add column if not exists priority text default 'media';
alter table public.survey_responses add column if not exists next_contact_at timestamptz;
alter table public.survey_responses add column if not exists internal_notes text;
alter table public.survey_responses add column if not exists delivered_offer text;
alter table public.survey_responses add column if not exists last_message_at timestamptz;
alter table public.survey_responses add column if not exists converted_at timestamptz;
alter table public.survey_responses add column if not exists conversion_status text default 'lead';
alter table public.survey_responses add column if not exists program_suggested text;
alter table public.survey_responses add column if not exists followup_count integer default 0;
alter table public.survey_responses add column if not exists last_followup_suggestion text;
alter table public.survey_responses add column if not exists weekly_report_bucket text;
alter table public.survey_responses add column if not exists lost_reason text;

update public.survey_responses
set priority = 'media'
where priority is null;

update public.survey_responses
set conversion_status = case
  when lead_status = 'Mensagem enviada' then 'contacted'
  when lead_status = 'Diagnóstico agendado' then 'diagnostic_scheduled'
  when lead_status = 'Piloto oferecido' then 'pilot_offered'
  when lead_status = 'Virou aluno' then 'converted'
  when lead_status = 'Sem interesse agora' then 'lost'
  when lead_status = 'Parceiro potencial' then 'partner'
  when lead_status = 'Arquivado' then 'archived'
  else 'lead'
end
where conversion_status is null;

update public.survey_responses
set followup_count = 0
where followup_count is null;

alter table public.survey_responses enable row level security;
alter table public.survey_answers enable row level security;
alter table public.survey_generated_messages enable row level security;
alter table public.lead_notes enable row level security;

-- MVP: as escritas públicas são feitas pela API com service role.
-- A leitura administrativa também é feita pela API com service role.
-- Portanto, não criamos políticas públicas de select.
