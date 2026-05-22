# Atualização — Bloco 3 Automação Assistida

Esta atualização adiciona recursos para o Diego acompanhar a Jornada Personal Extrema com mais inteligência operacional:

- lembretes e follow-ups assistidos;
- mensagens de follow-up sugeridas;
- dashboard semanal;
- funil de conversão;
- relatório de quais públicos convertem melhor;
- rota opcional de cron para preparar follow-ups.

## 1. Arquivos incluídos/alterados

Arquivos alterados:

- app/admin/pesquisa-diego/page.tsx
- app/admin/pesquisa-diego/leads/page.tsx
- app/api/admin/summary/route.ts
- app/api/admin/export/route.ts
- app/api/admin/leads/status/route.ts
- lib/types.ts
- supabase/schema.sql
- .env.example

Arquivos novos:

- app/admin/pesquisa-diego/dashboard/page.tsx
- app/api/admin/dashboard/route.ts
- app/api/admin/followups/route.ts
- app/api/cron/daily-followups/route.ts
- lib/automation-rules.ts
- lib/funnel.ts
- supabase/migrations/20260522_add_automation_fields.sql

## 2. Aplicar arquivos

Na raiz do projeto:

```powershell
cd C:\Users\lacos\Documents\GitHub\jornada-personal-extrema
```

Faça backup:

```powershell
Compress-Archive -Path .\app,.\lib,.\supabase -DestinationPath .\backup-antes-bloco-3-automacao.zip -Force
```

Extraia o ZIP por cima do projeto:

```powershell
Expand-Archive -Path C:\Users\lacos\Downloads\jornada-personal-extrema-bloco-3-automacao-atualizado.zip -DestinationPath . -Force
```

Remova a pasta de export local antes de buildar:

```powershell
Remove-Item -Recurse -Force .\_exports -ErrorAction SilentlyContinue
```

## 3. Aplicar SQL no Supabase

Abra o arquivo:

```txt
supabase/migrations/20260522_add_automation_fields.sql
```

Copie o conteúdo e execute em:

```txt
Supabase > SQL Editor > New query > Run
```

Este SQL adiciona os campos:

- converted_at
- conversion_status
- program_suggested
- followup_count
- last_followup_suggestion
- weekly_report_bucket
- lost_reason

Ele usa `add column if not exists`, portanto pode ser reexecutado com segurança.

## 4. Atualizar variáveis de ambiente

No `.env.local`, adicione:

```env
CRON_SECRET=troque-por-um-token-grande-e-seguro-para-cron
```

Na Vercel, adicione a mesma variável em:

```txt
Project > Settings > Environment Variables
```

A rota de cron é opcional. A automação assistida funciona sem cron, usando os botões do CRM.

## 5. Testar localmente

```powershell
npm run build
npm run lint
```

Depois rode:

```powershell
npm run dev
```

Teste as telas:

```txt
/admin/pesquisa-diego?token=SEU_TOKEN
/admin/pesquisa-diego/leads?token=SEU_TOKEN
/admin/pesquisa-diego/dashboard?token=SEU_TOKEN
```

## 6. Testes funcionais

Na tela de leads:

1. Filtre por "Follow-up vencido".
2. Clique em "Gerar follow-up".
3. Clique em "Copiar follow-up".
4. Clique em "Marcar mensagem hoje".
5. Defina "Próximo contato".
6. Preencha "Programa sugerido".
7. Salve acompanhamento.
8. Atualize a tela e confirme se salvou.

Na tela de dashboard:

1. Confira funil de conversão.
2. Confira conversão por público.
3. Confira "Quem chamar hoje".
4. Confira "Leads parados".

## 7. Rota opcional de cron

A rota criada é:

```txt
/api/cron/daily-followups?token=SEU_CRON_SECRET
```

Ela não envia WhatsApp automaticamente. Ela apenas prepara sugestões de follow-up e atualiza prioridade/bucket de acompanhamento para leads vencidos ou parados.

## 8. Commit e deploy

Se build e lint passarem:

```powershell
git add .
git commit -m "Inclui automação assistida e dashboard de conversão"
git push origin main
```

A Vercel deve iniciar o deploy automaticamente.

## 9. Como o Diego deve usar

Rotina diária:

1. Entrar em "Leads".
2. Filtrar por follow-up vencido.
3. Gerar follow-up.
4. Copiar mensagem.
5. Abrir WhatsApp.
6. Marcar mensagem enviada hoje.
7. Definir próximo contato.

Rotina semanal:

1. Entrar no "Dashboard semanal".
2. Ver público com melhor conversão.
3. Ver gargalo do funil.
4. Definir prioridade de conteúdo/oferta gratuita.
5. Ajustar abordagem para manter Oceano Azul.
