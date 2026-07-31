@echo off
cd /d "%~dp0"
start "TestFlight Build" powershell -NoExit -Command "Set-Location '%~dp0'; Write-Host 'Building iOS production app for TestFlight...' -ForegroundColor Cyan; Write-Host 'This takes about 15-30 minutes.' -ForegroundColor Yellow; Write-Host ''; npx.cmd eas-cli build --profile production --platform ios"
