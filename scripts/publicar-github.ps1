param(
  [string]$RepoUrl = "https://github.com/jornadapersonalextrema-dev/Jornada-Personal-Extrema.git"
)

cd C:\Users\lacos\Documents\GitHub\jornada-personal-extrema

git remote set-url origin $RepoUrl

git add -A
git status -uall
git commit -m "Inclui estrutura completa do MVP Jornada Personal Extrema"
git push origin main
