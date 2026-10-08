@echo off
cd /d "%~dp0"
start "EAS Login" powershell -NoExit -Command "Set-Location '%~dp0'; npx.cmd eas-cli login"
