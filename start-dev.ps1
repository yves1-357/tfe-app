# Lance le backend FastAPI dans une nouvelle fenetre PowerShell, puis le frontend ici.
$root    = $PSScriptRoot
$uvicorn = "$root\backend\venv\Scripts\uvicorn.exe"

Write-Host ""
Write-Host "  NextStop — dev mode" -ForegroundColor Cyan
Write-Host "  Backend  -> http://localhost:8000" -ForegroundColor Blue
Write-Host "  Frontend -> http://localhost:3000" -ForegroundColor Magenta
Write-Host ""

# Ouvre le backend dans une fenetre separee (reste visible, logs propres)
Start-Process powershell -ArgumentList "-NoExit", "-Command", `
  "Push-Location '$root\backend'; & '$uvicorn' main:app --reload"

Write-Host "[BACKEND] fenetre ouverte" -ForegroundColor Blue
Start-Sleep -Seconds 1

# Lance le frontend dans ce terminal
Write-Host "[FRONTEND] demarrage de Next.js..." -ForegroundColor Magenta
Push-Location "$root\frontend"
npm run dev
