# 🔐 Environment Variables Setup

## Local Development (.env.local)

Create a `.env.local` file in the root directory:

```env
# Vercel KV Store (Development mode uses in-memory store)
KV_URL=
KV_REST_API_URL=
KV_REST_API_TOKEN=
KV_REST_API_READ_ONLY_TOKEN=

# Reward Wallet Configuration
REWARD_WALLET_ADDRESS=0xfb2cC3797407Dc4147451BE31D1927ebd2403451
REWARD_WALLET_PRIVATE_KEY=63a74cb6838fc731ae46777be44c75d8df2b5b89142d4a0aaafa05247d9aefda

# Fee Recipient (Where claim fees go)
FEE_RECIPIENT_ADDRESS=0xfb2cC3797407Dc4147451BE31D1927ebd2403451

# Admin Panel Password
ADMIN_PASSWORD=admin123

# Public Configuration
NEXT_PUBLIC_PAYU_TOKEN=0x9AeB2E6DD8d55E14292ACFCFC4077e33106e4144
NEXT_PUBLIC_BSC_RPC=https://bsc-dataseed1.binance.org/
```

## Production (Vercel)

Set these in Vercel Dashboard → Settings → Environment Variables:

### 1. Vercel KV Store
```env
KV_URL=your_production_kv_url
KV_REST_API_URL=your_production_kv_rest_api_url
KV_REST_API_TOKEN=your_production_kv_token
KV_REST_API_READ_ONLY_TOKEN=your_production_kv_readonly_token
```

### 2. Reward Wallet
```env
REWARD_WALLET_ADDRESS=0xYourProductionWalletAddress
REWARD_WALLET_PRIVATE_KEY=your_production_private_key
FEE_RECIPIENT_ADDRESS=0xYourFeeRecipientAddress
```

⚠️ **IMPORTANT**: Use different wallet for production!

### 3. Admin
```env
ADMIN_PASSWORD=your_strong_admin_password
```

### 4. Public
```env
NEXT_PUBLIC_PAYU_TOKEN=0x9AeB2E6DD8d55E14292ACFCFC4077e33106e4144
NEXT_PUBLIC_BSC_RPC=https://bsc-dataseed1.binance.org/
```

## Security Notes

1. ❌ **NEVER commit** `.env.local` or `.env` files
2. ✅ **Always use** different credentials for production
3. ✅ **Store private keys** only in Vercel (never in code)
4. ✅ **Rotate passwords** regularly
5. ✅ **Use strong passwords** (min 12 characters)

## Getting Vercel KV Credentials

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to **Storage** tab
3. Click **Create Database** → **KV**
4. Name: `payugive-kv`
5. Create and copy all credentials from `.env.local` tab
6. Paste in Vercel Environment Variables

Done! ✅

