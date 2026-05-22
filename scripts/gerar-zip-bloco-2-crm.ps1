param(
  [string]$OutputName = "jornada-personal-extrema-bloco-2-crm.zip"
)

$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent $PSScriptRoot
$OutputDir = Join-Path $ProjectRoot "_exports"
$TempDir = Join-Path $OutputDir "jornada-personal-extrema-bloco-2-crm"
$ZipPath = Join-Path $OutputDir $OutputName

Write-Host "Projeto: $ProjectRoot" -ForegroundColor Cyan

if (Test-Path $TempDir) {
  Remove-Item -Recurse -Force $TempDir
}

New-Item -ItemType Directory -Force -Path $TempDir | Out-Null
New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

$files = @(
  "app/admin/pesquisa-diego/leads/page.tsx",
  "app/admin/pesquisa-diego/page.tsx",
  "app/api/admin/summary/route.ts",
  "app/api/admin/export/route.ts",
  "app/api/admin/leads/status/route.ts",
  "app/api/survey/submit/route.ts",
  "app/globals.css",
  "lib/types.ts",
  "lib/supabase.ts",
  "lib/journey-playbook.ts",
  "lib/deep-dive.ts",
  "lib/survey-config.ts",
  "supabase/schema.sql",
  "package.json",
  "tsconfig.json",
  "next.config.ts",
  ".env.example",
  ".gitignore"
)

$optionalFiles = @(
  "supabase/migrations",
  "public/logo-jpe.png",
  "public/diego-montagnini.jpg"
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

foreach ($item in $optionalFiles) {
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
Write-Host "Importante: antes de rodar npm run build, remova a pasta _exports:" -ForegroundColor Yellow
Write-Host "Remove-Item -Recurse -Force .\_exports -ErrorAction SilentlyContinue" -ForegroundColor Yellow