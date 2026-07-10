@echo off
cd /d "%~dp0"
start "Nudge Dev Server" powershell -NoExit -Command "Set-Location '%~dp0'; npx.cmd expo start --dev-client"
