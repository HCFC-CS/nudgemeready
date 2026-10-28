@echo off
cd /d "%~dp0"
if "%~1"=="" goto needid
start "Submit v4 to TestFlight" powershell -NoExit -Command "Set-Location '%~dp0'; Write-Host 'Submitting one v4 iOS build to TestFlight.' -ForegroundColor Cyan; Write-Host 'Build ID: %~1' -ForegroundColor Cyan; Write-Host 'The script checks that this ID is the v4 app before it submits.' -ForegroundColor Yellow; Write-Host ''; npm.cmd run submit:ios:v4 -- '%~1'"
exit /b 0

:needid
start "Submit v4 to TestFlight" powershell -NoExit -Command "Set-Location '%~dp0'; npm.cmd run submit:ios:v4"
exit /b 1
