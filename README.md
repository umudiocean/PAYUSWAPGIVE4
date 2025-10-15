# PAYU SWAP + PAYUGIVE 🎁

Decentralized Exchange for PAYU token on BSC network with integrated giveaway system.

## Features

### 🔄 SWAP
- Swap PAYU and other BSC tokens
- Real-time price updates
- Modern PancakeSwap-inspired UI
- Fast and secure transactions
- Mobile-responsive design

### 🎁 PAYUGIVE (NEW!)
- **Automatic Rewards**: Make 3 swaps, earn 1 ticket
- **250M PAYU per ticket**: Instant reward delivery
- **Easy Claim**: One-click claim with 0.00030 BNB fee
- **Progress Tracking**: Real-time swap counter and ticket display
- **Admin Dashboard**: Monitor all activities at `/admin`

## Getting Started

### Installation

```bash
npm install
```

### Environment Setup

Create `.env.local` file in root directory:

```env
# See ENV_SETUP.md for complete guide

# Reward Wallet (Sends PAYU rewards)
REWARD_WALLET_ADDRESS=your_wallet_address
REWARD_WALLET_PRIVATE_KEY=your_private_key

# Fee Recipient (Receives BNB claim fees)
FEE_RECIPIENT_ADDRESS=0xd9C4b8436d2a235A1f7DB09E680b5928cFdA641a

# Admin & Public
ADMIN_PASSWORD=your_admin_password
NEXT_PUBLIC_PAYU_TOKEN=0x9AeB2E6DD8d55E14292ACFCFC4077e33106e4144
NEXT_PUBLIC_BSC_RPC=https://bsc-dataseed1.binance.org/
```

📖 **Full setup guide**: [ENV_SETUP.md](ENV_SETUP.md)

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build

```bash
npm run build
npm start
```

### Deploy to Vercel

📖 **Complete deployment guide**: [DEPLOYMENT.md](DEPLOYMENT.md)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/umudiocean/PAYUSWAP)

**Important**: Set environment variables in Vercel Dashboard before deploying!

## Tech Stack

- Next.js 14 (App Router)
- React 18
- TypeScript
- Web3.js 4.x
- Styled Components
- Vercel KV Store (Database)
- BSC (Binance Smart Chain)

## Smart Contracts

- **Router**: `0x669f9b0D21c15a608c5309e0B964c165FB428962`
- **PAYU Token**: `0x9AeB2E6DD8d55E14292ACFCFC4077e33106e4144`
- **Network**: BSC Mainnet (Chain ID: 56)
- **Platform Fee**: 0.00025 BNB per swap

## Project Structure

```
PAYUSWAP/
├── app/
│   ├── page.tsx              # Main swap interface
│   ├── admin/
│   │   └── page.tsx          # Admin dashboard
│   └── api/
│       ├── track-swap/       # Swap tracking endpoint
│       ├── user-stats/       # User statistics
│       ├── claim/            # Reward claim
│       └── admin/            # Admin stats
├── components/
│   ├── PayuGiveSystem.tsx    # Giveaway component
│   ├── ClaimModal.tsx        # Claim modal
│   └── AdminPanel.tsx        # Admin panel
├── lib/
│   └── kv.ts                 # Database helpers
└── Documentation/
    ├── DEPLOYMENT.md         # Deployment guide
    ├── ENV_SETUP.md          # Environment setup
    └── INTEGRATION_SUMMARY.md # Integration details
```

## How It Works

### 1. User Journey
```
1. Connect wallet (MetaMask)
2. Swap tokens (BNB ↔ PAYU, etc.)
3. Earn tickets (3 swaps = 1 ticket)
4. Claim rewards (250M PAYU per ticket)
5. Pay small fee (0.00030 BNB per claim)
```

### 2. Admin Dashboard
Access at `/admin` with password:
- View total swaps, tickets, claims
- Monitor active users
- Track performance metrics
- Real-time statistics

## Documentation

📖 **[Integration Summary](INTEGRATION_SUMMARY.md)** - Complete system overview  
📖 **[Deployment Guide](DEPLOYMENT.md)** - Step-by-step deployment  
📖 **[Environment Setup](ENV_SETUP.md)** - Configure variables  
📖 **[Wallet Setup](WALLET_SETUP.md)** - Wallet configuration & management

## Security

- ✅ Private keys stored in environment variables only
- ✅ Password-protected admin panel
- ✅ Address validation on all endpoints
- ✅ Rate limiting (Vercel built-in)
- ✅ No sensitive data in code

## Support

- 📧 Issues: [GitHub Issues](https://github.com/umudiocean/PAYUSWAP/issues)
- 📚 Docs: See documentation files above

## License

MIT

