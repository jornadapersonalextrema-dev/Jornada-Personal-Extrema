-- Campos para registrar a memória narrada do Diego sobre alunos atuais ou leads.
-- Reexecutável com segurança.
alter table public.survey_responses add column if not exists narrated_context text;
alter table public.survey_responses add column if not exists known_history_summary text;
alter table public.survey_responses add column if not exists next_journey_step text;
