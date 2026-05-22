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

alter table public.survey_responses enable row level security;
alter table public.survey_answers enable row level security;
alter table public.survey_generated_messages enable row level security;
alter table public.lead_notes enable row level security;

-- MVP: as escritas públicas são feitas pela API com service role.
-- A leitura administrativa também é feita pela API com service role.
-- Portanto, não criamos políticas públicas de select.
