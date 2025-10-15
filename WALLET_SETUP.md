# 💼 Wallet Configuration Guide

## 🎯 İki Ayrı Cüzdan Sistemi

PAYUGIVE sistemi **2 farklı cüzdan** kullanır:

### 1️⃣ Reward Wallet (PAYU Gönderen)
**Amaç**: Kullanıcılara PAYU token ödüllerini göndermek

```env
REWARD_WALLET_ADDRESS=0x8fba3cdBCaA2Bb8D98de58B1f079F44ccD6d6311
REWARD_WALLET_PRIVATE_KEY=[YOUR_PRIVATE_KEY_HERE]
```

#### ✅ Gereksinimler:
- **PAYU Token**: Minimum 10 milyar PAYU
  - Her ticket = 250M PAYU
  - 40 ticket dağıtabilir
- **BNB (Gas)**: Minimum 0.1 BNB
  - Her transfer ~0.001 BNB gas
  - 100 transfer yapabilir

#### 🔒 Güvenlik:
- ⚠️ **Private key çok önemli!**
- ❌ Asla GitHub'a push etmeyin
- ✅ Sadece environment variables'da saklayın
- ✅ Production için farklı wallet kullanın

---

### 2️⃣ Fee Recipient (BNB Alan)
**Amaç**: Claim ücretlerini (BNB) toplamak

```env
FEE_RECIPIENT_ADDRESS=0xd9C4b8436d2a235A1f7DB09E680b5928cFdA641a
```

#### ✅ Özellikler:
- **Sadece adres** yeterli (private key gerekmez)
- Her ticket claim'de **0.00030 BNB** alır
- Platform geliri buraya gelir

#### 💰 Gelir Hesaplaması:
```
100 ticket claim = 0.030 BNB (~$10)
1,000 ticket claim = 0.300 BNB (~$100)
10,000 ticket claim = 3.000 BNB (~$1,000)
```

---

## 🔄 İşleyiş Akışı

### Ticket Claim Süreci:

```
User Claim Butonuna Tıklar
         ↓
┌────────────────────────────┐
│  1. User → Fee Recipient   │
│     0.00030 BNB            │ ← Fee Recipient'a gider
└────────────────────────────┘
         ↓
┌────────────────────────────┐
│  2. Reward Wallet → User   │
│     250M PAYU              │ ← Reward Wallet'tan gider
└────────────────────────────┘
         ↓
    ✅ SUCCESS!
```

---

## 📊 Wallet Yönetimi

### Reward Wallet Kontrolü

```typescript
// Bakiye kontrolü
const web3 = new Web3('https://bsc-dataseed1.binance.org/');
const payuContract = new web3.eth.Contract(ERC20_ABI, PAYU_TOKEN);

// PAYU balance
const balance = await payuContract.methods.balanceOf(REWARD_WALLET_ADDRESS).call();
console.log('PAYU Balance:', web3.utils.fromWei(balance, 'ether'));

// BNB balance
const bnbBalance = await web3.eth.getBalance(REWARD_WALLET_ADDRESS);
console.log('BNB Balance:', web3.utils.fromWei(bnbBalance, 'ether'));
```

### Fee Recipient Kontrolü

```typescript
// BNB gelir kontrolü
const feeBalance = await web3.eth.getBalance(FEE_RECIPIENT_ADDRESS);
console.log('Total Fees Collected:', web3.utils.fromWei(feeBalance, 'ether'), 'BNB');
```

---

## ⚙️ Configuration Dosyası

### Local Development (.env.local)

```env
# Reward Wallet (PAYU gönderen)
REWARD_WALLET_ADDRESS=0x8fba3cdBCaA2Bb8D98de58B1f079F44ccD6d6311
REWARD_WALLET_PRIVATE_KEY=[YOUR_PRIVATE_KEY_HERE]

# Fee Recipient (BNB alan)
FEE_RECIPIENT_ADDRESS=0xd9C4b8436d2a235A1f7DB09E680b5928cFdA641a

# Admin & Public
ADMIN_PASSWORD=admin123
NEXT_PUBLIC_PAYU_TOKEN=0x9AeB2E6DD8d55E14292ACFCFC4077e33106e4144
NEXT_PUBLIC_BSC_RPC=https://bsc-dataseed1.binance.org/
```

### Production (Vercel)

⚠️ **DEĞİŞTİRİN**:
```env
# Farklı wallet kullanın!
REWARD_WALLET_ADDRESS=0xYourProductionWallet
REWARD_WALLET_PRIVATE_KEY=your_production_key

# Fee recipient aynı kalabilir veya değiştirin
FEE_RECIPIENT_ADDRESS=0xd9C4b8436d2a235A1f7DB09E680b5928cFdA641a
```

---

## 🛡️ Güvenlik Best Practices

### ✅ Yapılması Gerekenler:

1. **Ayrı Cüzdanlar**
   - Test için bir set
   - Production için başka set

2. **Private Key Güvenliği**
   - Asla code'a yazmayın
   - Sadece env variables
   - Güvenli yedek alın

3. **Bakiye Monitoring**
   - PAYU azaldığında uyarı
   - BNB biterse transaction fail olur
   - Otomatik alert sistemi kurun

4. **Fee Recipient**
   - Private key gerekmez
   - Cold wallet olabilir
   - Güvenli adres kullanın

### ❌ Yapılmaması Gerekenler:

1. ❌ Private key'i GitHub'a push
2. ❌ Test wallet'ı production'da kullanma
3. ❌ Reward wallet'ı başka işler için kullanma
4. ❌ Fee recipient private key'i sisteme ekleme (gerekmez)

---

## 📈 Bakiye Önerileri

### Başlangıç İçin:

| Wallet | Asset | Minimum | Önerilen |
|--------|-------|---------|----------|
| Reward | PAYU | 1B | 10B+ |
| Reward | BNB | 0.05 | 0.2+ |
| Fee Recipient | - | - | - |

### Büyüme Hedefi:

| Kullanıcı | Ticket/Gün | PAYU Gereksinimi | BNB Gas |
|-----------|------------|------------------|---------|
| 100 | 10 | 2.5B/gün | 0.01 BNB/gün |
| 1,000 | 100 | 25B/gün | 0.10 BNB/gün |
| 10,000 | 1,000 | 250B/gün | 1.00 BNB/gün |

---

## 🔔 Alert Sistemi (Öneri)

### Bakiye Uyarıları:

```typescript
// Örnek alert sistemi
async function checkBalances() {
  const payuBalance = await getPayuBalance(REWARD_WALLET);
  const bnbBalance = await getBnbBalance(REWARD_WALLET);
  
  // PAYU düşükse uyar
  if (payuBalance < 1_000_000_000) {
    sendAlert('PAYU balance low! Less than 1B');
  }
  
  // BNB düşükse uyar
  if (bnbBalance < 0.05) {
    sendAlert('BNB balance low! Less than 0.05');
  }
}

// Her saat kontrol et
setInterval(checkBalances, 3600000);
```

---

## 💡 Sık Sorulan Sorular

### Q: Fee Recipient için private key gerekli mi?
**A**: Hayır! Sadece BNB alan adres, private key gerekmez.

### Q: İki cüzdan aynı olabilir mi?
**A**: Evet ama önerilmez. Ayrı tutmak muhasebe için daha iyi.

### Q: Fee'leri nasıl çekerim?
**A**: Fee Recipient adresinin private key'i ile normal transfer yapın.

### Q: Reward wallet boşalırsa ne olur?
**A**: Claim işlemleri fail olur, kullanıcılar ödül alamaz.

### Q: BNB bittiyse ne olur?
**A**: Transaction gönderemez, reward transfer edilemez.

---

## 📞 Destek

Wallet setup ile ilgili sorularınız için:
- 📧 GitHub Issues
- 📚 DEPLOYMENT.md
- 📖 ENV_SETUP.md

---

**Güvenli ve karlı işletmeler! 💼🚀**

