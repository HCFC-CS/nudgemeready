@echo off
cd /d "%~dp0"
start "Submit v2 to TestFlight" powershell -NoExit -Command "Set-Location '%~dp0'; Write-Host 'Submitting the latest production-profile iOS build.' -ForegroundColor Cyan; Write-Host 'That profile is v2, the original Nudge me Ready app.' -ForegroundColor Yellow; Write-Host 'For v4, use Submit-TestFlight-v4.bat with the v4 EAS build ID.' -ForegroundColor Yellow; Write-Host ''; npx.cmd eas-cli submit --platform ios --latest --profile production"
