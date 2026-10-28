@echo off
cd /d "%~dp0"
start "Choose a TestFlight build" powershell -NoExit -Command "Write-Host 'Build-TestFlight.bat no longer starts a build.' -ForegroundColor Yellow; Write-Host ''; Write-Host 'v4 binary: Build-TestFlight-v4.bat' -ForegroundColor Cyan; Write-Host 'v4 JavaScript update: Update-iOS-v4.bat'; Write-Host 'v2 production profile: Build-TestFlight-v2.bat'; Write-Host 'v3: npm run build:ios:v3'"
exit /b 1
