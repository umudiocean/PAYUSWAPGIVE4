# 🚀 PAYUSWAP + PAYUGIVE Deployment Guide

## 📋 Ön Hazırlık

### 1. Gerekli Hesaplar
- ✅ [Vercel](https://vercel.com) hesabı
- ✅ GitHub repository
- ✅ MetaMask cüzdanı (BSC Mainnet)

### 2. Gerekli Bilgiler
- ✅ Reward wallet private key
- ✅ Admin panel şifresi
- ✅ Vercel KV Store credentials

---

## 🔧 Kurulum Adımları

### Adım 1: Repository Setup

```bash
# Projeyi GitHub'a push edin
git init
git add .
git commit -m "Initial commit: PAYUSWAP + PAYUGIVE integration"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/PAYUSWAP.git
git push -u origin main
```

### Adım 2: Vercel'e Deploy

1. **Vercel Dashboard'a gidin**: https://vercel.com/dashboard
2. **"Add New Project"** tıklayın
3. GitHub repository'nizi seçin
4. Framework Preset: **Next.js** (otomatik algılanır)
5. **"Deploy"** tıklayın

### Adım 3: Vercel KV Store Oluşturma

1. Vercel Dashboard'da **"Storage"** sekmesine gidin
2. **"Create Database"** → **"KV"** seçin
3. Database adı: `payugive-kv`
4. Region: **Washington, D.C., USA** (veya size en yakın)
5. **"Create"** tıklayın
6. **".env.local"** sekmesinden tüm KV credentials'ı kopyalayın

### Adım 4: Environment Variables Ayarlama

Vercel Dashboard → **Settings** → **Environment Variables**

Aşağıdaki değişkenleri ekleyin:

#### KV Store Variables (Adım 3'ten kopyalanan)
```env
KV_URL=your_kv_url_here
KV_REST_API_URL=your_kv_rest_api_url_here
KV_REST_API_TOKEN=your_kv_rest_api_token_here
KV_REST_API_READ_ONLY_TOKEN=your_kv_rest_api_read_only_token_here
```

#### Reward Wallet Configuration (Sends PAYU rewards)
```env
REWARD_WALLET_ADDRESS=0xfb2cC3797407Dc4147451BE31D1927ebd2403451
REWARD_WALLET_PRIVATE_KEY=[YOUR_PRIVATE_KEY_HERE]
```

⚠️ **ÖNEMLİ**: 
- Production'da farklı wallet kullanın!
- Bu cüzdan PAYU ödüllerini gönderir
- Yeterli PAYU ve BNB (gas) olmalı

#### Fee Recipient Configuration (Receives BNB fees)
```env
FEE_RECIPIENT_ADDRESS=0xd9C4b8436d2a235A1f7DB09E680b5928cFdA641a
```

ℹ️ **BİLGİ**:
- Bu cüzdan claim ücretlerini (BNB) alır
- Her ticket claim: 0.00030 BNB
- Reward wallet'tan ayrı tutulur

#### Admin Configuration
```env
ADMIN_PASSWORD=güçlü_şifreniz_buraya
```

#### Public Configuration
```env
NEXT_PUBLIC_PAYU_TOKEN=0x9AeB2E6DD8d55E14292ACFCFC4077e33106e4144
NEXT_PUBLIC_BSC_RPC=https://bsc-dataseed1.binance.org/
```

### Adım 5: Redeploy

Environment variables ekledikten sonra:

1. **Deployments** sekmesine gidin
2. En son deployment'ın yanındaki **"..."** → **"Redeploy"** tıklayın

---

## 🧪 Test Etme

### 1. Ana Sayfa Testi
```
https://your-app.vercel.app
```
- ✅ Swap interface görünüyor mu?
- ✅ PAYUGIVE card görünüyor mu?
- ✅ Wallet bağlanabiliyor mu?

### 2. Swap Testi
- ✅ Swap işlemi başarılı mı?
- ✅ Swap counter artıyor mu? (Backend'de kaydediliyor)

### 3. Ticket Sistemi Testi
- ✅ 3 swap sonrası 1 ticket kazanıldı mı?
- ✅ Claim butonu aktif oldu mu?

### 4. Claim Testi
- ✅ Claim modal açılıyor mu?
- ✅ Fee doğru hesaplanıyor mu? (0.00030 BNB)
- ✅ PAYU tokens transfer ediliyor mu?

### 5. Admin Panel Testi
```
https://your-app.vercel.app/admin
```
- ✅ Password ile giriş yapılabiliyor mu?
- ✅ İstatistikler görünüyor mu?

---

## 📊 Monitoring

### Vercel Analytics
Vercel Dashboard → **Analytics** → Kullanıcı istatistiklerini görün

### KV Store Data
Vercel Dashboard → **Storage** → **payugive-kv** → Data browser

### Logs
Vercel Dashboard → **Deployments** → Son deployment → **Logs**

---

## 🔒 Güvenlik Kontrolleri

### ✅ Yapılması Gerekenler:

1. **Private Key Güvenliği**
   - ❌ Asla GitHub'a push etmeyin
   - ✅ Sadece Vercel Environment Variables'da saklayın
   - ✅ Production için farklı wallet kullanın

2. **Admin Password**
   - ✅ Güçlü şifre kullanın (min 12 karakter)
   - ✅ Düzenli olarak değiştirin

3. **CORS & Rate Limiting**
   - ✅ Vercel otomatik koruma sağlar
   - ✅ Gerekirse API route'larına rate limiting ekleyin

4. **Database Backup**
   - ✅ Vercel KV otomatik backup yapar
   - ✅ Kritik data için manuel backup alın

---

## 🐛 Troubleshooting

### Problem: Swap tracking çalışmıyor
**Çözüm**: 
- KV credentials doğru mu kontrol edin
- Vercel logs'u kontrol edin
- `/api/track-swap` endpoint'ini test edin

### Problem: Claim işlemi başarısız
**Çözüm**:
- Reward wallet'da yeterli PAYU var mı?
- Private key doğru mu?
- BSC network fees yeterli mi?

### Problem: Admin panel açılmıyor
**Çözüm**:
- `ADMIN_PASSWORD` environment variable set edilmiş mi?
- Browser cache'i temizleyin

### Problem: "Module not found" hatası
**Çözüm**:
```bash
npm install
npm run build
```

---

## 📈 Production Optimizasyonları

### 1. Performans
```typescript
// next.config.js'e ekleyin:
module.exports = {
  compiler: {
    styledComponents: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['@vercel/kv']
  },
  images: {
    domains: ['tokens.pancakeswap.finance', 'raw.githubusercontent.com']
  }
}
```

### 2. Caching
```typescript
// API route'larına cache ekleyin:
export const revalidate = 60; // 60 saniye cache
```

### 3. Rate Limiting
```typescript
// lib/rate-limit.ts oluşturun
import { Ratelimit } from '@upstash/ratelimit'
import { kv } from '@vercel/kv'

export const ratelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
})
```

---

## 🔄 Güncelleme Yapma

### Kod Güncellemesi
```bash
git add .
git commit -m "Update: feature açıklaması"
git push origin main
```

Vercel otomatik olarak yeni versiyonu deploy eder!

### Environment Variables Güncelleme
1. Vercel Dashboard → Settings → Environment Variables
2. Değişkeni düzenle → Save
3. Redeploy yap

---

## 📞 Destek

### Hata Bildirimi
- GitHub Issues kullanın
- Vercel logs'u ekleyin
- Adımları detaylı açıklayın

### Dökümantasyon
- [Next.js Docs](https://nextjs.org/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Web3.js Docs](https://web3js.readthedocs.io/)

---

## ✅ Deploy Checklist

Deployment öncesi kontrol listesi:

- [ ] `.env.local` dosyası `.gitignore`'da
- [ ] Tüm environment variables Vercel'de set edildi
- [ ] Reward wallet'da yeterli PAYU token var
- [ ] Reward wallet'da yeterli BNB (gas için) var
- [ ] Admin password güçlü ve güvenli
- [ ] Test swap yapıldı
- [ ] Test claim yapıldı
- [ ] Admin panel test edildi
- [ ] Mobile responsive test edildi
- [ ] Production URL belirlendi

---

## 🎉 Deployment Tamamlandı!

Tebrikler! PAYUSWAP + PAYUGIVE sistemi başarıyla deploy edildi.

**Live URL**: `https://your-app.vercel.app`
**Admin Panel**: `https://your-app.vercel.app/admin`

Şimdi kullanıcılarınız:
1. ✅ Swap yapabilir
2. ✅ Her 3 swap'te 1 ticket kazanabilir
3. ✅ Ticket'larını 250M PAYU'ya çevirebilir!

**Başarılar! 🚀**

