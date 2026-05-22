create extension if not exists pgcrypto;

create table if not exists public.journey_clients (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  whatsapp text,
  email text,
  birth_date date,
  age_range text,
  city text,
  neighborhood text,
  current_status text default 'ativo',
  client_type text default 'aluno_atual',
  training_location text,
  weekly_frequency text,
  usual_days text,
  usual_time text,
  main_goal text,
  secondary_goals text,
  known_limitations text,
  health_notes text,
  training_history text,
  diego_memory_notes text,
  audio_transcription text,
  structured_summary text,
  next_journey_step text,
  suggested_program text,
  tech_opportunities text,
  personalized_survey_status text default 'nao_enviada',
  personalized_survey_link text,
  last_contact_at timestamptz,
  next_contact_at timestamptz,
  priority text default 'media',
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.journey_clients add column if not exists whatsapp text;
alter table public.journey_clients add column if not exists email text;
alter table public.journey_clients add column if not exists birth_date date;
alter table public.journey_clients add column if not exists age_range text;
alter table public.journey_clients add column if not exists city text;
alter table public.journey_clients add column if not exists neighborhood text;
alter table public.journey_clients add column if not exists current_status text default 'ativo';
alter table public.journey_clients add column if not exists client_type text default 'aluno_atual';
alter table public.journey_clients add column if not exists training_location text;
alter table public.journey_clients add column if not exists weekly_frequency text;
alter table public.journey_clients add column if not exists usual_days text;
alter table public.journey_clients add column if not exists usual_time text;
alter table public.journey_clients add column if not exists main_goal text;
alter table public.journey_clients add column if not exists secondary_goals text;
alter table public.journey_clients add column if not exists known_limitations text;
alter table public.journey_clients add column if not exists health_notes text;
alter table public.journey_clients add column if not exists training_history text;
alter table public.journey_clients add column if not exists diego_memory_notes text;
alter table public.journey_clients add column if not exists audio_transcription text;
alter table public.journey_clients add column if not exists structured_summary text;
alter table public.journey_clients add column if not exists next_journey_step text;
alter table public.journey_clients add column if not exists suggested_program text;
alter table public.journey_clients add column if not exists tech_opportunities text;
alter table public.journey_clients add column if not exists personalized_survey_status text default 'nao_enviada';
alter table public.journey_clients add column if not exists personalized_survey_link text;
alter table public.journey_clients add column if not exists last_contact_at timestamptz;
alter table public.journey_clients add column if not exists next_contact_at timestamptz;
alter table public.journey_clients add column if not exists priority text default 'media';
alter table public.journey_clients add column if not exists internal_notes text;
alter table public.journey_clients add column if not exists created_at timestamptz not null default now();
alter table public.journey_clients add column if not exists updated_at timestamptz not null default now();

update public.journey_clients set current_status = 'ativo' where current_status is null;
update public.journey_clients set client_type = 'aluno_atual' where client_type is null;
update public.journey_clients set personalized_survey_status = 'nao_enviada' where personalized_survey_status is null;
update public.journey_clients set priority = 'media' where priority is null;

alter table public.journey_clients enable row level security;

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_journey_clients_updated_at on public.journey_clients;
create trigger trg_journey_clients_updated_at
before update on public.journey_clients
for each row execute function public.set_updated_at();
