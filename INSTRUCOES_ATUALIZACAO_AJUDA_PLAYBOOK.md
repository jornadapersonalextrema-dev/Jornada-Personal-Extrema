# Atualização — Ajuda da Jornada Personal Extrema

## Arquivos atualizados/novos

- `app/admin/pesquisa-diego/page.tsx`
- `app/admin/pesquisa-diego/leads/page.tsx`
- `app/globals.css`
- `lib/journey-playbook.ts` **novo**

## O que entrou nesta versão

1. Pop-up "Como usar esta tela?" no painel administrativo.
2. Pop-up "Como abordar leads?" na tela de leads.
3. Fluxograma visual da jornada do lead.
4. Playbook por público.
5. Próxima ação recomendada por status.
6. Botão para copiar mensagem.
7. Botão para abrir WhatsApp com mensagem pronta.
8. Filtros de status e público na tela de leads.
9. Melhorias mobile friendly para cards, botões e fluxo.
10. Reforço de posicionamento de Oceano Azul: diagnóstico antes de treino, oferta gratuita específica e venda consultiva.

## Passo a passo

Na raiz do projeto:

```powershell
cd C:\Users\lacos\Documents\GitHub\jornada-personal-extrema
```

Faça backup:

```powershell
Compress-Archive -Path .\app,.\lib,.\components -DestinationPath .\backup-antes-ajuda-jornada.zip -Force
```

Extraia este ZIP por cima do projeto:

```powershell
Expand-Archive -Path C:\Users\lacos\Downloads\jornada-personal-extrema-ajuda-playbook-atualizado.zip -DestinationPath . -Force
```

Remova `_exports`, se existir:

```powershell
Remove-Item -Recurse -Force .\_exports -ErrorAction SilentlyContinue
```

Rode os testes:

```powershell
npm run build
npm run lint
```

Se passar:

```powershell
git add .
git commit -m "Inclui ajuda da jornada e playbook de leads"
git push origin main
```

A Vercel deve fazer o deploy automaticamente.

## Como validar

1. Acesse `/admin/pesquisa-diego?token=SEU_TOKEN`.
2. Clique em "Como usar esta tela?".
3. Confira o fluxograma e o playbook por público.
4. Acesse `/admin/pesquisa-diego/leads?token=SEU_TOKEN`.
5. Teste filtros por status e público.
6. Clique em "Copiar mensagem".
7. Clique em "Abrir WhatsApp".
8. Mude o status de um lead e veja a próxima ação recomendada mudar.
