@echo off
cd /d "%~dp0"
start "Build v2 for TestFlight" powershell -NoExit -Command "Set-Location '%~dp0'; Write-Host 'Building Nudge me Ready v2 for TestFlight.' -ForegroundColor Cyan; Write-Host 'This is the production profile, the same one as npm run build:ios:v2.' -ForegroundColor Yellow; Write-Host 'It is the original app. v4 is Build-TestFlight-v4.bat.' -ForegroundColor Yellow; Write-Host ''; npx.cmd eas-cli build --profile production --platform ios"
