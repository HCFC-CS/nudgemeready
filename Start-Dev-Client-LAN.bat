@echo off
cd /d "%~dp0"
start "Nudge Dev Server (LAN)" powershell -NoExit -Command ^
  "Set-Location '%~dp0';" ^
  "$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notmatch 'Loopback|vEthernet|WSL' -and $_.IPAddress -notmatch '^169\.' } | Select-Object -First 1).IPAddress;" ^
  "Write-Host '';" ^
  "Write-Host '========================================' -ForegroundColor Cyan;" ^
  "Write-Host '  Nudge me Ready - Dev Server (LAN)' -ForegroundColor Cyan;" ^
  "Write-Host '========================================' -ForegroundColor Cyan;" ^
  "Write-Host '';" ^
  "Write-Host 'Your PC IP address:' -ForegroundColor Yellow;" ^
  "Write-Host \"  $ip\" -ForegroundColor White;" ^
  "Write-Host '';" ^
  "Write-Host 'On iPhone (same Wi-Fi as this PC):' -ForegroundColor Yellow;" ^
  "Write-Host '  1. Open Nudge me Ready dev app' -ForegroundColor White;" ^
  "Write-Host '  2. Scan the QR code below, OR' -ForegroundColor White;" ^
  "Write-Host \"  3. Enter URL manually: http://${ip}:8081\" -ForegroundColor Green;" ^
  "Write-Host '';" ^
  "Write-Host 'If connection fails: allow Node.js through Windows Firewall.' -ForegroundColor DarkYellow;" ^
  "Write-Host '';" ^
  "npx.cmd expo start --dev-client --clear --lan"
