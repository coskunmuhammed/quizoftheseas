# Quiz of the Seas - Offline EXE Hazırlama Sihirbazı
# Bu script, uygulamanın en güncel halini ve sorularını içeren tek bir EXE dosyası oluşturur.

$ErrorActionPreference = "Continue" 
$OriginalLocation = $PSScriptRoot

Write-Host "--------------------------------------------------" -ForegroundColor Cyan
Write-Host "  QUIZ OF THE SEAS - OFFLINE EXE HAZIRLAYICI" -ForegroundColor Cyan
Write-Host "--------------------------------------------------" -ForegroundColor Cyan

try {
    if (-not (Test-Path "frontend") -or -not (Test-Path "backend")) {
        Write-Host "`nHATA: Bu scripti ana proje klasörüne atmalısınız!" -ForegroundColor Red
        throw "Yanlış klasör konumu."
    }

    Write-Host "`n[1/4] Frontend dosyaları hazırlanıyor..." -ForegroundColor Yellow
    Set-Location "frontend"
    npm install
    npm run build
    Set-Location ..

    Write-Host "`n[2/4] Sunucu bileşenleri hazırlanıyor..." -ForegroundColor Yellow
    Set-Location "backend"
    npm install
    npm install -g npx

    Write-Host "`n[3/4] Sorular ve görseller Supabase'den çekiliyor..." -ForegroundColor Yellow
    npx ts-node src/sync_data.ts
    Set-Location ..

    Write-Host "`n[4/4] Uygulama EXE olarak paketleniyor..." -ForegroundColor Yellow
    npx pkg backend/package.json --targets node18-win-x64 --output quizoftheseas_offline.exe

    Write-Host "`n--------------------------------------------------" -ForegroundColor Green
    Write-Host "  BAŞARILI! 'quizoftheseas_offline.exe' hazır." -ForegroundColor Green
    Write-Host "--------------------------------------------------" -ForegroundColor Green
}
catch {
    Write-Host "`n--------------------------------------------------" -ForegroundColor Red
    Write-Host "  BİR HATA OLUŞTU!" -ForegroundColor Red
    Write-Host "  Hata Mesajı: $_" -ForegroundColor Gray
    Write-Host "--------------------------------------------------" -ForegroundColor Red
}

Write-Host "`nPencereyi kapatmak için Enter tuşuna basın..."
Read-Host