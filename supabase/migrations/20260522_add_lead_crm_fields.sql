-- Bloco 2 — Campos de acompanhamento CRM da Jornada Personal Extrema.
-- Execute este SQL uma única vez no Supabase SQL Editor.
-- Ele é idempotente: pode ser executado novamente sem recriar colunas.

alter table public.survey_responses add column if not exists priority text default 'media';
alter table public.survey_responses add column if not exists next_contact_at timestamptz;
alter table public.survey_responses add column if not exists internal_notes text;
alter table public.survey_responses add column if not exists delivered_offer text;
alter table public.survey_responses add column if not exists last_message_at timestamptz;

update public.survey_responses
set priority = 'media'
where priority is null;

comment on column public.survey_responses.priority is 'Prioridade comercial/manual do lead: alta, media ou baixa.';
comment on column public.survey_responses.next_contact_at is 'Data e hora sugerida para o próximo contato com o lead.';
comment on column public.survey_responses.internal_notes is 'Observações internas do Diego sobre contexto, dores, objeções e próximos passos.';
comment on column public.survey_responses.delivered_offer is 'Oferta gratuita/material já entregue para o lead.';
comment on column public.survey_responses.last_message_at is 'Data e hora da última mensagem enviada ao lead.';
