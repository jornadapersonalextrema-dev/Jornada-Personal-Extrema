# Atualização - Alunos atuais, memória narrada e importação CSV

## Objetivo

Esta atualização cria o módulo de alunos atuais da Jornada Personal Extrema, permitindo cadastrar alunos por:

1. dados básicos manuais;
2. narrativa/memória do Diego;
3. transcrição de áudio colada no cadastro;
4. importação de planilha CSV.

O objetivo é começar pelos alunos atuais, estruturar o que Diego já sabe e só depois enviar uma pesquisa personalizada curta para atualizar objetivos e próxima etapa.

## Arquivos novos principais

- `app/admin/pesquisa-diego/alunos/page.tsx`
- `app/admin/pesquisa-diego/alunos/novo/page.tsx`
- `app/admin/pesquisa-diego/alunos/[studentId]/page.tsx`
- `app/api/admin/students/route.ts`
- `app/api/admin/students/[studentId]/route.ts`
- `app/api/admin/students/[studentId]/memory/route.ts`
- `app/api/admin/students/import/route.ts`
- `lib/student-journey.ts`
- `lib/audio-memory-prompts.ts`
- `supabase/migrations/20260522_add_journey_clients.sql`

## Arquivos atualizados

- `components/Header.tsx`
- `app/admin/pesquisa-diego/page.tsx`
- `lib/types.ts`
- `supabase/schema.sql`

## Passo a passo

### 1. Fazer backup

```powershell
cd C:\Users\lacos\Documents\GitHub\jornada-personal-extrema
Compress-Archive -Path .\app,.\components,.\lib,.\supabase -DestinationPath .\backup-antes-alunos-atuais.zip -Force
```

### 2. Extrair o ZIP por cima do projeto

```powershell
Expand-Archive -Path C:\Users\lacos\Downloads\jornada-personal-extrema-alunos-atuais-memoria-atualizado.zip -DestinationPath . -Force
```

### 3. Remover exports locais antes do build

```powershell
Remove-Item -Recurse -Force .\_exports -ErrorAction SilentlyContinue
```

### 4. Aplicar SQL no Supabase

Abra o arquivo abaixo e execute no SQL Editor do Supabase:

```txt
supabase/migrations/20260522_add_journey_clients.sql
```

Ele cria a tabela `journey_clients` para alunos atuais, leads convertidos, ex-alunos e parceiros.

### 5. Testar localmente

```powershell
npm run build
npm run lint
```

### 6. Testar telas

Acesse:

```txt
/admin/pesquisa-diego/alunos
/admin/pesquisa-diego/alunos/novo
```

Teste:

- cadastrar aluno manualmente;
- colar narrativa/memória do Diego;
- copiar prompt para áudio;
- salvar ficha;
- editar aluno;
- colar CSV e importar.

### 7. Formato de CSV recomendado

Exemplo:

```csv
nome,whatsapp,email,cidade,bairro,objetivo_principal,frequencia_semanal,dias_habituais,horario_habitual,local_treino,narrativa,limitacoes,observacoes_saude
Maria Silva,19999999999,maria@email.com,Campinas,Cambui,Força e disposição,3x,Seg/Qua/Sex,07:00,Academia,"Treina há 2 anos, evoluiu bem, mas perde constância em viagens.",Dor eventual no joelho,"Sem observação nova"
```

### 8. Commit e deploy

```powershell
git add .
git commit -m "Inclui módulo de alunos atuais e memória narrada"
git push origin main
```

A Vercel deve fazer novo deploy automaticamente.

## Uso recomendado com Diego

1. Escolher 5 a 10 alunos atuais para cadastrar primeiro.
2. Cadastrar dados básicos e agenda.
3. Diego grava ou dita a memória sobre cada aluno.
4. Usar o prompt do sistema no ChatGPT para transformar a narrativa em resumo estruturado.
5. Colar resumo no sistema.
6. Definir próxima etapa da Jornada.
7. Enviar pesquisa curta e personalizada somente depois.
