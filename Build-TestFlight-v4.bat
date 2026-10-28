@echo off
cd /d "%~dp0"
start "Build v4 for TestFlight" powershell -NoExit -Command "Set-Location '%~dp0'; Write-Host 'Building Nudge me Ready v4 for TestFlight.' -ForegroundColor Cyan; Write-Host 'Profile v4. This is a new binary, not a JavaScript update.' -ForegroundColor Yellow; Write-Host ''; npm.cmd run build:ios:v4"
