# Atualização - Autenticação, cabeçalho fixo, agenda e memória narrada

## O que esta atualização inclui

- Cabeçalho global fixo e contextual.
- Botão Gestão no cabeçalho.
- Troca de Painel admin por Gestão na home.
- Login por e-mail via Supabase Auth.
- Botão Sair na área restrita.
- Proteção das telas administrativas por sessão autenticada.
- Fallback técnico por token antigo, se ainda necessário.
- Nova tela Agenda prática do Diego.
- Campos de memória narrada para alunos atuais/leads.
- Prompt para usar transcrição de áudio no ChatGPT e atualizar o cadastro.
- Novos campos no banco para histórico conhecido e próxima etapa da jornada.

## 1. Aplicar os arquivos

Na raiz do projeto:

```powershell
cd C:\Users\lacos\Documents\GitHub\jornada-personal-extrema
```

Faça backup:

```powershell
Compress-Archive -Path .\app,.\components,.\lib,.\supabase -DestinationPath .\backup-antes-auth-audio.zip -Force
```

Extraia o ZIP desta entrega por cima do projeto:

```powershell
Expand-Archive -Path C:\Users\lacos\Downloads\jornada-personal-extrema-auth-audio-doc-atualizado.zip -DestinationPath . -Force
```

Remova a pasta de exportações, se existir:

```powershell
Remove-Item -Recurse -Force .\_exports -ErrorAction SilentlyContinue
```

## 2. Aplicar SQL no Supabase

No Supabase, execute o arquivo:

```txt
supabase/migrations/20260522_add_audio_context_fields.sql
```

Ele adiciona os campos:

```txt
narrated_context
known_history_summary
next_journey_step
```

Também confirme que o `supabase/schema.sql` base já foi executado antes.

## 3. Configurar Supabase Auth

No Supabase:

1. Abra Authentication > Providers.
2. Ative Email.
3. Em URL Configuration, configure a URL do site em produção.
4. Cadastre o Diego como usuário, se preferir controlar manualmente.
5. Opcionalmente, restrinja os e-mails pela variável `ADMIN_ALLOWED_EMAILS`.

## 4. Atualizar .env.local

Adicione:

```env
ADMIN_ALLOWED_EMAILS=diego@email.com,gabriel@email.com
```

Troque pelos e-mails reais autorizados.

Se deixar vazio, qualquer usuário autenticado no Supabase do projeto conseguirá acessar a Gestão.

## 5. Atualizar variáveis na Vercel

Na Vercel:

```txt
Project > Settings > Environment Variables
```

Inclua:

```env
ADMIN_ALLOWED_EMAILS=diego@email.com,gabriel@email.com
```

Também confira:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_SURVEY_TOKEN=
CRON_SECRET=
```

## 6. Testar localmente

```powershell
npm run build
npm run lint
```

Depois rode:

```powershell
npm run dev
```

Teste:

```txt
/login
/admin/pesquisa-diego
/admin/pesquisa-diego/leads
/admin/pesquisa-diego/dashboard
/admin/pesquisa-diego/agenda
```

## 7. Testar memória narrada

Na tela de Leads:

1. Abra um lead/aluno.
2. Clique em Prompt para áudio.
3. Cole o prompt no ChatGPT junto com a transcrição do áudio do Diego.
4. Copie o resumo gerado.
5. Preencha:
   - Registro narrado/transcrito pelo Diego.
   - Síntese do histórico conhecido.
   - Próxima etapa sugerida da Jornada.
6. Clique em Salvar acompanhamento.

## 8. Commit e deploy

```powershell
git add .
git commit -m "Inclui autenticação, agenda e memória narrada da jornada"
git push origin main
```

A Vercel deve fazer novo deploy automaticamente.

## Observação importante

Esta atualização ainda não faz upload/transcrição automática de áudio. Ela cria a etapa profissional e segura: Diego grava, transcreve/resume com apoio do ChatGPT, revisa e salva no cadastro. A automação completa de upload/transcrição pode vir depois.
