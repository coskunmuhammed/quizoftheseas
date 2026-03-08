# Quiz of the Seas - Offline EXE Hazırlama Sihirbazı
# Bu script, uygulamanın en güncel halini ve sorularını içeren tek bir EXE dosyası oluşturur.

$ErrorActionPreference = "Stop"

Write-Host "--------------------------------------------------" -ForegroundColor Cyan
Write-Host "  QUIZ OF THE SEAS - OFFLINE EXE HAZIRLAYICI" -ForegroundColor Cyan
Write-Host "--------------------------------------------------" -ForegroundColor Cyan

# 1. Frontend Build
Write-Host "`n[1/4] Frontend dosyaları hazırlanıyor (React build)..." -ForegroundColor Yellow
cd frontend
npm install
npm run build
cd ..

# 2. Backend Hazırlığı
Write-Host "`n[2/4] Sunucu bileşenleri hazırlanıyor..." -ForegroundColor Yellow
cd backend
npm install
# Kompile etmek için gerekli paketler
npm install -g npx

# 3. Veri Senkronizasyonu
Write-Host "`n[3/4] Sorular ve görseller Supabase'den çekiliyor..." -ForegroundColor Yellow
# ts-node kullanarak sync scriptini çalıştır
npx ts-node src/sync_data.ts
cd ..

# 4. EXE Paketleme (PKG kullanarak)
Write-Host "`n[4/4] Uygulama EXE olarak paketleniyor..." -ForegroundColor Yellow
# pkg komutu ile backend/src/portable_server.ts dosyasını Windows EXE'ye dönüştür
# Not: SQLite3 binary dosyalarını düzgün dahil etmek için yapılandırma kullanıyoruz
npx pkg backend/package.json --targets node18-win-x64 --output quizoftheseas_offline.exe

Write-Host "`n--------------------------------------------------" -ForegroundColor Green
Write-Host "  BAŞARILI! 'quizoftheseas_offline.exe' hazır." -ForegroundColor Green
Write-Host "  Bu dosyayı istediğiniz bilgisayara kopyalayıp"
Write-Host "  offline olarak kullanabilirsiniz."
Write-Host "--------------------------------------------------" -ForegroundColor Green

Pause
