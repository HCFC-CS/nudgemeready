@echo off
cd /d "%~dp0"
start "Submit to TestFlight" powershell -NoExit -Command "Set-Location '%~dp0'; Write-Host 'Submitting latest iOS build to App Store Connect / TestFlight...' -ForegroundColor Cyan; Write-Host ''; npx.cmd eas-cli submit --platform ios --latest --profile production"
