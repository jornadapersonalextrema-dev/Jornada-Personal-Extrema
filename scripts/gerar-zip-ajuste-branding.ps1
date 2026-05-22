param(
  [string]$OutputName = "jornada-personal-extrema-ajuste-branding.zip"
)

$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent $PSScriptRoot
$OutputDir = Join-Path $ProjectRoot "_exports"
$TempDir = Join-Path $OutputDir "jornada-personal-extrema-ajuste-branding"
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
  "components/Header.tsx",
  "lib/survey-config.ts",
  "lib/deep-dive.ts",
  "package.json",
  "tsconfig.json",
  "next.config.ts",
  "postcss.config.mjs",
  "eslint.config.mjs",
  ".env.example"
)

$optionalFiles = @(
  "public/logo.png",
  "public/logo.svg",
  "public/diego.jpg",
  "public/diego.jpeg",
  "public/diego.png",
  "public/favicon.ico",
  "public/icon.png"
)

$allFiles = $files + $optionalFiles

foreach ($file in $allFiles) {
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