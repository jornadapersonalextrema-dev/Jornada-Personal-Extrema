param(
  [string]$OutputName = "jornada-personal-extrema-alunos-atuais-memoria.zip"
)

$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent $PSScriptRoot
$OutputDir = Join-Path $ProjectRoot "_exports"
$TempDir = Join-Path $OutputDir "jornada-personal-extrema-alunos-atuais-memoria"
$ZipPath = Join-Path $OutputDir $OutputName

Write-Host "Projeto: $ProjectRoot" -ForegroundColor Cyan

if (Test-Path $TempDir) {
  Remove-Item -Recurse -Force $TempDir
}

New-Item -ItemType Directory -Force -Path $TempDir | Out-Null
New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

$files = @(
  "app/globals.css",
  "app/layout.tsx",
  "app/page.tsx",
  "app/login/page.tsx",

  "components/Header.tsx",
  "components/AdminAuthGuard.tsx",

  "app/admin/pesquisa-diego/page.tsx",
  "app/admin/pesquisa-diego/leads/page.tsx",
  "app/admin/pesquisa-diego/dashboard/page.tsx",
  "app/admin/pesquisa-diego/agenda/page.tsx",

  "app/api/admin/summary/route.ts",
  "app/api/admin/dashboard/route.ts",
  "app/api/admin/followups/route.ts",
  "app/api/admin/leads/status/route.ts",
  "app/api/admin/export/route.ts",

  "lib/types.ts",
  "lib/supabase.ts",
  "lib/supabase-browser.ts",
  "lib/client-admin.ts",
  "lib/journey-playbook.ts",
  "lib/automation-rules.ts",
  "lib/funnel.ts",
  "lib/deep-dive.ts",
  "lib/survey-config.ts",

  "supabase/schema.sql",

  ".env.example",
  ".gitignore",
  "package.json",
  "tsconfig.json",
  "next.config.ts",
  "postcss.config.mjs",
  "eslint.config.mjs",

  "public/logo-jpe.png",
  "public/diego-montagnini.jpg"
)

$optionalItems = @(
  "supabase/migrations",
  "app/api/cron/daily-followups/route.ts",

  "app/admin/pesquisa-diego/alunos/page.tsx",
  "app/admin/pesquisa-diego/alunos/novo/page.tsx",
  "app/admin/pesquisa-diego/alunos/[studentId]/page.tsx",

  "app/api/admin/students/route.ts",
  "app/api/admin/students/[studentId]/route.ts",
  "app/api/admin/students/[studentId]/memory/route.ts",

  "lib/student-journey.ts",
  "lib/audio-memory-prompts.ts"
)

foreach ($file in $files) {
  $source = Join-Path $ProjectRoot $file

  if (Test-Path -LiteralPath $source) {
    $destination = Join-Path $TempDir $file
    $destinationDir = Split-Path -Parent $destination

    New-Item -ItemType Directory -Force -Path $destinationDir | Out-Null
    Copy-Item -LiteralPath $source -Destination $destination -Force

    Write-Host "Incluído: $file" -ForegroundColor Green
  } else {
    Write-Host "Não encontrado: $file" -ForegroundColor Yellow
  }
}

foreach ($item in $optionalItems) {
  $source = Join-Path $ProjectRoot $item

  if (Test-Path -LiteralPath $source) {
    $destination = Join-Path $TempDir $item
    $destinationDir = Split-Path -Parent $destination

    New-Item -ItemType Directory -Force -Path $destinationDir | Out-Null

    if ((Get-Item -LiteralPath $source).PSIsContainer) {
      Copy-Item -LiteralPath $source -Destination $destinationDir -Recurse -Force
    } else {
      Copy-Item -LiteralPath $source -Destination $destination -Force
    }

    Write-Host "Incluído opcional: $item" -ForegroundColor Green
  } else {
    Write-Host "Opcional não encontrado: $item" -ForegroundColor DarkYellow
  }
}

if (Test-Path $ZipPath) {
  Remove-Item -Force $ZipPath
}

Compress-Archive -Path (Join-Path $TempDir "*") -DestinationPath $ZipPath -Force

Write-Host ""
Write-Host "ZIP gerado com sucesso:" -ForegroundColor Green
Write-Host $ZipPath -ForegroundColor Cyan
Write-Host ""
Write-Host "Depois de anexar o ZIP aqui, remova _exports antes de rodar build:" -ForegroundColor Yellow
Write-Host "Remove-Item -Recurse -Force .\_exports -ErrorAction SilentlyContinue" -ForegroundColor Yellow