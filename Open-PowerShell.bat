@echo off
cd /d "%~dp0"
start "Nudge me Ready" powershell -NoExit -Command "Set-Location '%~dp0'; Write-Host 'Project folder:' (Get-Location) -ForegroundColor Green; Write-Host ''; Write-Host 'Common commands:' -ForegroundColor Cyan; Write-Host '  npx.cmd expo start --dev-client'; Write-Host '  npx.cmd eas-cli login'; Write-Host '  npx.cmd eas-cli build --profile development --platform ios'; Write-Host '  npx.cmd expo run:android'; Write-Host ''"
