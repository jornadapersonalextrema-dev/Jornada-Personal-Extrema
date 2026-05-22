# Atualização: login mais simples, cabeçalho e página de pesquisa

## Arquivos alterados

- `app/login/page.tsx`
- `app/pesquisa/page.tsx`
- `components/Header.tsx`

## O que mudou

1. Removido o card redundante com logo na página `/pesquisa`, pois a marca já aparece no cabeçalho.
2. A tela `/login` ficou mais simples, centralizada e próxima ao modelo de acesso administrativo.
3. O texto da tela de login foi ajustado para:

> Faça o login e acesse leads, dashboard, follow-ups, agenda e próximos passos de cada aluno ou potencial cliente.

4. Removido o texto técnico sobre Supabase/ADMIN_ALLOWED_EMAILS da tela pública de login.
5. No cabeçalho, a página `/login` não mostra mais o botão “Entrar” apontando para ela mesma.
6. O botão principal da tela de login agora é “Entrar na Gestão”. O link mágico ficou como opção secundária.
7. Mensagens de erro de autenticação foram traduzidas para instruções mais claras.

## Passo a passo para aplicar

Na raiz do projeto:

```powershell
cd C:\Users\lacos\Documents\GitHub\jornada-personal-extrema
```

Faça backup:

```powershell
Compress-Archive -Path .\app, .\components -DestinationPath .\backup-antes-ajuste-login-header.zip -Force
```

Extraia o ZIP atualizado por cima do projeto:

```powershell
Expand-Archive -Path C:\Users\lacos\Downloads\jornada-personal-extrema-login-header-ajustado.zip -DestinationPath . -Force
```

Remova a pasta `_exports`, se existir:

```powershell
Remove-Item -Recurse -Force .\_exports -ErrorAction SilentlyContinue
```

Teste:

```powershell
npm run build
npm run lint
```

Se passar:

```powershell
git add .
git commit -m "Ajusta login, cabeçalho e página de pesquisa"
git push origin main
```

## Checklist de configuração do Supabase Auth

Se o login por senha com `jornadapersonalextrema@gmail.com` não funcionar, confira:

1. O usuário foi criado no mesmo projeto Supabase apontado por `NEXT_PUBLIC_SUPABASE_URL`.
2. Em `Authentication > Providers > Email`, o login por e-mail/senha está habilitado.
3. Em `Authentication > Users`, o usuário está confirmado. Se estiver como pendente, confirme manualmente ou desative a confirmação obrigatória em `Authentication > Providers > Email > Confirm email` para o MVP.
4. A senha foi definida no usuário. Se necessário, use “Send password recovery” ou recrie a senha.
5. A variável `ADMIN_ALLOWED_EMAILS=jornadapersonalextrema@gmail.com` foi configurada também na Vercel, não apenas no `.env.local`.
6. Depois de alterar variável na Vercel, faça novo deploy.
7. Para link mágico, configure em `Authentication > URL Configuration`:

```txt
Site URL: https://jornada-personal-extrema.vercel.app
Redirect URLs:
https://jornada-personal-extrema.vercel.app/**
http://localhost:3000/**
```

## Observação importante

Não envie `.env.local` para o GitHub. Use `.env.example` como referência e configure as variáveis reais no ambiente local e na Vercel.
