@echo off
cd /d "%~dp0"
start "EAS iOS Build" powershell -NoExit -Command "Set-Location '%~dp0'; npx.cmd eas-cli build --profile development --platform ios"
