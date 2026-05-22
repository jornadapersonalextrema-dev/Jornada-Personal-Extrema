cd C:\Users\lacos\Documents\GitHub\jornada-personal-extrema
Write-Host "PWD:" -ForegroundColor Cyan
pwd
Write-Host "Arquivos principais:" -ForegroundColor Cyan
dir
Write-Host "Arquivos TSX/TS/SQL:" -ForegroundColor Cyan
Get-ChildItem -Recurse -Include *.tsx,*.ts,*.sql | Select-Object FullName
Write-Host "Git status:" -ForegroundColor Cyan
git status -uall
