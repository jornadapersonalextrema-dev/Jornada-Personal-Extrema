# Atualização — Bloco 2 CRM da Jornada Personal Extrema

Esta atualização inclui campos de acompanhamento no banco e na tela de leads:

- próximo contato;
- prioridade;
- observações internas;
- oferta entregue;
- data da última mensagem.

## 1. Aplicar arquivos

Na raiz do projeto:

```powershell
cd C:\Users\lacos\Documents\GitHub\jornada-personal-extrema
Expand-Archive -Path C:\Users\lacos\Downloads\jornada-personal-extrema-bloco-2-crm-atualizado.zip -DestinationPath . -Force
Remove-Item -Recurse -Force .\_exports -ErrorAction SilentlyContinue
```

## 2. Aplicar migration no Supabase

Abra o arquivo:

```txt
supabase/migrations/20260522_add_lead_crm_fields.sql
```

Copie o conteúdo e execute no Supabase em:

```txt
SQL Editor > New query > Run
```

O SQL é idempotente e usa `add column if not exists`, então pode ser executado com segurança mesmo se alguma coluna já existir.

## 3. Testar localmente

```powershell
npm run build
npm run lint
```

## 4. Validar no sistema

Acesse:

```txt
/admin/pesquisa-diego/leads?token=SEU_TOKEN
```

Teste em um lead:

1. alterar prioridade;
2. preencher próximo contato;
3. preencher observações internas;
4. marcar oferta entregue;
5. salvar acompanhamento;
6. atualizar a página e confirmar que os dados permaneceram.

Também teste:

```txt
/admin/pesquisa-diego?token=SEU_TOKEN
/api/admin/export?token=SEU_TOKEN
```

O CSV passa a incluir os campos novos.

## 5. Enviar para GitHub

```powershell
git add .
git commit -m "Inclui campos de CRM no acompanhamento de leads"
git push origin main
```

A Vercel deve iniciar novo deploy automaticamente.

## 6. Atenção

Antes de rodar `npm run build`, não deixe a pasta `_exports` dentro da raiz do projeto. Ela deve ficar ignorada no `.gitignore`.
