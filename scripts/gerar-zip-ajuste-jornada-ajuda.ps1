param(
  [string]$OutputName = "jornada-personal-extrema-ajuste-jornada-ajuda.zip"
)

$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent $PSScriptRoot
$OutputDir = Join-Path $ProjectRoot "_exports"
$TempDir = Join-Path $OutputDir "jornada-personal-extrema-ajuste-jornada-ajuda"
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
  "app/pesquisa/page.tsx",
  "app/pesquisa/[publico]/page.tsx",
  "app/pesquisa/obrigado/page.tsx",
  "app/admin/pesquisa-diego/page.tsx",
  "app/admin/pesquisa-diego/leads/page.tsx",
  "app/api/admin/summary/route.ts",
  "app/api/admin/export/route.ts",
  "app/api/admin/leads/status/route.ts",
  "app/api/survey/submit/route.ts",
  "components/Header.tsx",
  "lib/survey-config.ts",
  "lib/deep-dive.ts",
  "lib/types.ts",
  "lib/supabase.ts",
  "supabase/schema.sql",
  "public/logo-jpe.png",
  "public/diego-montagnini.jpg",
  "package.json",
  "tsconfig.json",
  "next.config.ts",
  "postcss.config.mjs",
  "eslint.config.mjs",
  ".env.example",
  ".gitignore"
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
    Write-Host "Não encontrado/opcional: $file" -ForegroundColor Yellow
  }
}

if (Test-Path $ZipPath) {
  Remove-Item -Force $ZipPath
}

Compress-Archive -Path (Join-Path $TempDir "*") -DestinationPath $ZipPath -Force

Write-Host ""
Write-Host "ZIP gerado com sucesso:" -ForegroundColor Green
Write-Host $ZipPath -ForegroundColor Cyan