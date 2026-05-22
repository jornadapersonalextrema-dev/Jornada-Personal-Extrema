alter table public.survey_responses add column if not exists converted_at timestamptz;
alter table public.survey_responses add column if not exists conversion_status text default 'lead';
alter table public.survey_responses add column if not exists program_suggested text;
alter table public.survey_responses add column if not exists followup_count integer default 0;
alter table public.survey_responses add column if not exists last_followup_suggestion text;
alter table public.survey_responses add column if not exists weekly_report_bucket text;
alter table public.survey_responses add column if not exists lost_reason text;

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

update public.survey_responses
set converted_at = coalesce(converted_at, now())
where lead_status = 'Virou aluno'
  and converted_at is null;
