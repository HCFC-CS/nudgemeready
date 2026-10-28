@echo off
cd /d "%~dp0"
start "Choose a TestFlight submit" powershell -NoExit -Command "Write-Host 'Submit-TestFlight.bat no longer submits a build.' -ForegroundColor Yellow; Write-Host ''; Write-Host 'v4: Submit-TestFlight-v4.bat and the EAS build ID from the v4 build' -ForegroundColor Cyan; Write-Host 'v2 production profile: Submit-TestFlight-v2.bat'; Write-Host 'v3: npm run submit:ios:v3'"
exit /b 1
