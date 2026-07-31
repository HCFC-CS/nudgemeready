@echo off
cd /d "%~dp0"
start "Nudge Dev Server (Tunnel)" powershell -NoExit -Command "Set-Location '%~dp0'; Write-Host 'Clearing cache and starting TUNNEL dev server...' -ForegroundColor Cyan; npx.cmd expo start --dev-client --tunnel --clear"
