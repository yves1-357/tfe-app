# Script pour lancer Backend + Frontend ensemble
Write-Host "Demarrage de TFE Route App..." -ForegroundColor Cyan
Write-Host ""

# Lancer le Backend
Write-Host "[BACKEND] Demarrage du serveur FastAPI..." -ForegroundColor Blue
$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD\backend
    & .\venv\Scripts\Activate.ps1
    uvicorn main:app --reload
}

Start-Sleep -Seconds 2

# Lancer le Frontend
Write-Host "[FRONTEND] Demarrage du serveur Next.js..." -ForegroundColor Magenta
$frontendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD\frontend
    npm run dev
}

Write-Host ""
Write-Host "Les deux serveurs sont lances!" -ForegroundColor Green
Write-Host "   Backend:  http://localhost:8000" -ForegroundColor Blue
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor Magenta
Write-Host ""
Write-Host "Appuyez sur Ctrl+C pour arreter les serveurs" -ForegroundColor Yellow
Write-Host ""

# Afficher les logs en temps réel
try {
    while ($true) {
        $backendOutput = Receive-Job -Job $backendJob
        if ($backendOutput) {
            Write-Host "[BACKEND] $backendOutput" -ForegroundColor Blue
        }
        
        $frontendOutput = Receive-Job -Job $frontendJob
        if ($frontendOutput) {
            Write-Host "[FRONTEND] $frontendOutput" -ForegroundColor Magenta
        }
        
        Start-Sleep -Milliseconds 100
    }
} finally {
    Write-Host "`nArret des serveurs..." -ForegroundColor Yellow
    Get-Job | Stop-Job
    Get-Job | Remove-Job
}
