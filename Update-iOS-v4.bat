@echo off
cd /d "%~dp0"
if "%~1"=="" goto needargs
if "%~2"=="" goto needargs
set "NMR_V4_UPDATE_SHA=%~1"
set "NMR_V4_UPDATE_MESSAGE=%~2"
set "APP_VARIANT=v4"
set "NMR_V4_DRY_RUN="
if /I "%~3"=="dry-run" set "NMR_V4_DRY_RUN=--dry-run"
start "Publish v4 JavaScript update" powershell -NoExit -Command "Set-Location '%~dp0'; $env:APP_VARIANT = 'v4'; Write-Host 'Checking this commit before a v4 JavaScript update.' -ForegroundColor Cyan; Write-Host 'This does not build a new TestFlight binary.' -ForegroundColor Yellow; Write-Host ''; npm.cmd run update:ios:v4 -- --sha $env:NMR_V4_UPDATE_SHA --channel v4 --platform ios --message ""$env:NMR_V4_UPDATE_MESSAGE"" %NMR_V4_DRY_RUN%"
exit /b 0

:needargs
start "Publish v4 JavaScript update" powershell -NoExit -Command "Write-Host 'This publishes a JavaScript update for Nudge me Ready v4.'; Write-Host 'It does not build a new TestFlight app.'; Write-Host ''; Write-Host 'It checks the commit and the v4 app before it publishes.'; Write-Host 'From this folder, run Update-iOS-v4.bat with the full commit SHA and a short note.'"
exit /b 1
