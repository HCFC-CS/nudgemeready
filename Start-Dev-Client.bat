@echo off
cd /d "%~dp0"
start "Nudge Dev Server" powershell -NoExit -Command "Set-Location '%~dp0'; Write-Host 'Clearing cache and starting dev server...' -ForegroundColor Cyan; npx.cmd expo start --dev-client --clear"
