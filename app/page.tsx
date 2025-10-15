'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Web3 from 'web3';
import styled from 'styled-components';
import { PayuGiveSystem } from '@/components/PayuGiveSystem';

// Smart Contract Configuration
const PAYPAYU_ROUTER = "0x669f9b0D21c15a608c5309e0B964c165FB428962";
const WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
const PLATFORM_FEE = "0.00025";
const PLATFORM_FEE_RECIPIENT = "0xd9C4b8436d2a235A1f7DB09E680b5928cFdA641a"; // Swap fee'leri buraya

const PAYPAYU_ABI = [
    { "inputs": [{"internalType": "address", "name": "tokenOut", "type": "address"}, {"internalType": "uint256", "name": "amountOutMin", "type": "uint256"}, {"internalType": "uint256", "name": "deadline", "type": "uint256"}], "name": "swapExactBNBForTokens", "outputs": [{"internalType": "uint256[]", "name": "amounts", "type": "uint256[]"}], "stateMutability": "payable", "type": "function" },
    { "inputs": [{"internalType": "address", "name": "tokenIn", "type": "address"}, {"internalType": "uint256", "name": "amountIn", "type": "uint256"}, {"internalType": "uint256", "name": "amountOutMin", "type": "uint256"}, {"internalType": "uint256", "name": "deadline", "type": "uint256"}], "name": "swapExactTokensForBNB", "outputs": [{"internalType": "uint256[]", "name": "amounts", "type": "uint256[]"}], "stateMutability": "payable", "type": "function" },
    { "inputs": [{"internalType": "address", "name": "tokenIn", "type": "address"}, {"internalType": "address", "name": "tokenOut", "type": "address"}, {"internalType": "uint256", "name": "amountIn", "type": "uint256"}, {"internalType": "uint256", "name": "amountOutMin", "type": "uint256"}, {"internalType": "uint256", "name": "deadline", "type": "uint256"}], "name": "swapExactTokensForTokens", "outputs": [{"internalType": "uint256[]", "name": "amounts", "type": "uint256[]"}], "stateMutability": "payable", "type": "function" },
    { "inputs": [{"internalType": "uint256", "name": "amountIn", "type": "uint256"}, {"internalType": "address[]", "name": "path", "type": "address[]"}], "name": "getAmountsOut", "outputs": [{"internalType": "uint256[]", "name": "amounts", "type": "uint256[]"}], "stateMutability": "view", "type": "function" }
];

const ERC20_ABI = [
    {"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
    {"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"}
];

const TOKEN_LIST = [
    { symbol: "PAYU", name: "Platform of meme coins", address: "0x9AeB2E6DD8d55E14292ACFCFC4077e33106e4144", decimals: 18, logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/assets/0x9AeB2E6DD8d55E14292ACFCFC4077e33106e4144/logo.png" },
    { symbol: "BNB", name: "Binance Chain Native Token", address: WBNB, decimals: 18, logo: "https://tokens.pancakeswap.finance/images/symbol/bnb.png" },
    { symbol: "CAKE", name: "PancakeSwap Token", address: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82", decimals: 18, logo: "https://tokens.pancakeswap.finance/images/0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82.png" },
    { symbol: "USDT", name: "Tether USD", address: "0x55d398326f99059fF775485246999027B3197955", decimals: 18, logo: "https://tokens.pancakeswap.finance/images/0x55d398326f99059fF775485246999027B3197955.png" },
    { symbol: "BUSD", name: "Binance USD", address: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56", decimals: 18, logo: "https://tokens.pancakeswap.finance/images/0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56.png" },
    { symbol: "USDC", name: "USD Coin", address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", decimals: 18, logo: "https://tokens.pancakeswap.finance/images/0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d.png" },
];

export default function SwapPage() {
  const [account, setAccount] = useState<string | null>(null);
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [fromToken, setFromToken] = useState(TOKEN_LIST[1]); // BNB
  const [toToken, setToToken] = useState(TOKEN_LIST[0]); // PAYU
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [slippage, setSlippage] = useState('0.5');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Connect Wallet
  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const web3Instance = new Web3(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const accounts = await web3Instance.eth.getAccounts();
        
        setWeb3(web3Instance);
        setAccount(accounts[0]);
        
        // Check network
        const chainId = await web3Instance.eth.getChainId();
        if (Number(chainId) !== 56) {
          setError('Please switch to BSC Mainnet (Chain ID: 56)');
        }
      } catch (err: any) {
        setError(err.message);
      }
    } else {
      setError('Please install MetaMask');
    }
  };

  // Calculate output amount
  const calculateOutputAmount = useCallback(async () => {
    if (!web3 || !fromAmount || parseFloat(fromAmount) <= 0) {
      setToAmount('');
      return;
    }

    try {
      const routerContract = new web3.eth.Contract(PAYPAYU_ABI as any, PAYPAYU_ROUTER);
      const amountIn = web3.utils.toWei(fromAmount, 'ether');
      
      const path = [fromToken.address, toToken.address];
      const amounts = await routerContract.methods.getAmountsOut(amountIn, path).call();
      
      const outputAmount = web3.utils.fromWei(amounts[1].toString(), 'ether');
      setToAmount(parseFloat(outputAmount).toFixed(6));
    } catch (err) {
      console.error('Calculate error:', err);
      setToAmount('0');
    }
  }, [web3, fromAmount, fromToken, toToken]);

  // Track swap completion
  const trackSwap = async () => {
    if (!account) return;
    
    try {
      await fetch('/api/track-swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userAddress: account })
      });
    } catch (error) {
      console.error('Track swap error:', error);
    }
  };

  // Perform Swap
  const handleSwap = async () => {
    if (!web3 || !account || !fromAmount || !toAmount) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const routerContract = new web3.eth.Contract(PAYPAYU_ABI as any, PAYPAYU_ROUTER);
      const amountIn = web3.utils.toWei(fromAmount, 'ether');
      const amountOutMin = web3.utils.toWei(
        (parseFloat(toAmount) * (1 - parseFloat(slippage) / 100)).toFixed(6),
        'ether'
      );
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes
      const platformFee = web3.utils.toWei(PLATFORM_FEE, 'ether');

      // BNB to Token
      if (fromToken.symbol === 'BNB') {
        // 1. Swap işlemi (sadece swap amount)
        await routerContract.methods
          .swapExactBNBForTokens(toToken.address, amountOutMin, deadline)
          .send({
            from: account,
            value: amountIn,
            gas: '300000'
          });
        
        // 2. Platform fee transfer (ayrı işlem olarak sizin cüzdanınıza)
        await web3.eth.sendTransaction({
          from: account,
          to: PLATFORM_FEE_RECIPIENT,
          value: platformFee,
          gas: '21000'
        });
      }
      // Token to BNB
      else if (toToken.symbol === 'BNB') {
        const tokenContract = new web3.eth.Contract(ERC20_ABI as any, fromToken.address);
        
        // Check and approve if needed
        const allowance = await tokenContract.methods.allowance(account, PAYPAYU_ROUTER).call();
        if (BigInt(allowance.toString()) < BigInt(amountIn)) {
          await tokenContract.methods
            .approve(PAYPAYU_ROUTER, web3.utils.toWei('1000000000', 'ether'))
            .send({ from: account });
        }

        // 1. Swap işlemi
        await routerContract.methods
          .swapExactTokensForBNB(fromToken.address, amountIn, amountOutMin, deadline)
          .send({
            from: account,
            gas: '300000'
          });
        
        // 2. Platform fee transfer (ayrı işlem olarak sizin cüzdanınıza)
        await web3.eth.sendTransaction({
          from: account,
          to: PLATFORM_FEE_RECIPIENT,
          value: platformFee,
          gas: '21000'
        });
      }
      // Token to Token
      else {
        const tokenContract = new web3.eth.Contract(ERC20_ABI as any, fromToken.address);
        
        // Check and approve if needed
        const allowance = await tokenContract.methods.allowance(account, PAYPAYU_ROUTER).call();
        if (BigInt(allowance.toString()) < BigInt(amountIn)) {
          await tokenContract.methods
            .approve(PAYPAYU_ROUTER, web3.utils.toWei('1000000000', 'ether'))
            .send({ from: account });
        }

        // 1. Swap işlemi
        await routerContract.methods
          .swapExactTokensForTokens(
            fromToken.address,
            toToken.address,
            amountIn,
            amountOutMin,
            deadline
          )
          .send({
            from: account,
            gas: '350000'
          });
        
        // 2. Platform fee transfer (ayrı işlem olarak sizin cüzdanınıza)
        await web3.eth.sendTransaction({
          from: account,
          to: PLATFORM_FEE_RECIPIENT,
          value: platformFee,
          gas: '21000'
        });
      }

      setSuccess(true);
      setFromAmount('');
      setToAmount('');
      
      // Track the swap for PAYUGIVE system
      await trackSwap();
      
    } catch (err: any) {
      setError(err.message || 'Swap failed');
    } finally {
      setLoading(false);
    }
  };

  // Switch tokens
  const switchTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      calculateOutputAmount();
    }, 500);
    return () => clearTimeout(timer);
  }, [fromAmount, fromToken, toToken, calculateOutputAmount]);

  return (
    <Container>
      <Header>
        <Logo>🔄 PAYU SWAP</Logo>
        {account ? (
          <WalletAddress>{account.slice(0, 6)}...{account.slice(-4)}</WalletAddress>
        ) : (
          <ConnectButton onClick={connectWallet}>Connect Wallet</ConnectButton>
        )}
      </Header>

      <SwapCard>
        <CardTitle>Swap</CardTitle>

        <TokenSection>
          <SectionLabel>From</SectionLabel>
          <InputGroup>
            <AmountInput
              type="number"
              placeholder="0.0"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
            />
            <TokenSelect>
              <TokenLogo src={fromToken.logo} alt={fromToken.symbol} />
              <TokenSymbol>{fromToken.symbol}</TokenSymbol>
            </TokenSelect>
          </InputGroup>
        </TokenSection>

        <SwitchButton onClick={switchTokens}>⇅</SwitchButton>

        <TokenSection>
          <SectionLabel>To</SectionLabel>
          <InputGroup>
            <AmountInput
              type="number"
              placeholder="0.0"
              value={toAmount}
              readOnly
            />
            <TokenSelect>
              <TokenLogo src={toToken.logo} alt={toToken.symbol} />
              <TokenSymbol>{toToken.symbol}</TokenSymbol>
            </TokenSelect>
          </InputGroup>
        </TokenSection>

        <SettingsSection>
          <SettingLabel>Slippage Tolerance:</SettingLabel>
          <SlippageInput
            type="number"
            value={slippage}
            onChange={(e) => setSlippage(e.target.value)}
            step="0.1"
          />
          <span>%</span>
        </SettingsSection>

        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>✅ Swap successful!</SuccessMessage>}

        {account ? (
          <SwapButton onClick={handleSwap} disabled={loading || !fromAmount || !toAmount}>
            {loading ? 'Swapping...' : 'Swap'}
          </SwapButton>
        ) : (
          <SwapButton onClick={connectWallet}>
            Connect Wallet
          </SwapButton>
        )}

        <FeeNote>
          Platform fee: {PLATFORM_FEE} BNB per swap
          <br />
          <small style={{opacity: 0.7}}>+ BSC network gas fee</small>
        </FeeNote>
      </SwapCard>

      {/* 🆕 PAYUGIVE SYSTEM - ENTEGRASYON */}
      <PayuGiveSystem userAddress={account} />

      <Footer>
        <FooterLink href="/admin">Admin Panel</FooterLink>
        <FooterText>Powered by PAYU Protocol</FooterText>
      </Footer>
    </Container>
  );
}

// Styled Components (Mevcut tasarımı koruyor)
const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  padding: 20px;
`;

const Header = styled.header`
  max-width: 480px;
  margin: 0 auto 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: white;
  margin: 0;
`;

const WalletAddress = styled.div`
  background: rgba(255, 255, 255, 0.2);
  padding: 10px 16px;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  font-size: 14px;
`;

const ConnectButton = styled.button`
  background: white;
  color: #1e3a8a;
  padding: 10px 20px;
  border-radius: 12px;
  border: none;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  }
`;

const SwapCard = styled.div`
  max-width: 480px;
  margin: 0 auto;
  background: white;
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
`;

const CardTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 24px 0;
  color: #1e3a8a;
`;

const TokenSection = styled.div`
  margin-bottom: 12px;
`;

const SectionLabel = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
  font-weight: 500;
`;

const InputGroup = styled.div`
  display: flex;
  align-items: center;
  background: #f3f4f6;
  border-radius: 16px;
  padding: 16px;
`;

const AmountInput = styled.input`
  flex: 1;
  border: none;
  background: none;
  font-size: 24px;
  font-weight: 600;
  outline: none;
  color: #1e3a8a;

  &::placeholder {
    color: #9ca3af;
  }
`;

const TokenSelect = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  padding: 8px 12px;
  border-radius: 12px;
  cursor: pointer;
`;

const TokenLogo = styled.img`
  width: 24px;
  height: 24px;
  border-radius: 50%;
`;

const TokenSymbol = styled.span`
  font-weight: 700;
  color: #1e3a8a;
`;

const SwitchButton = styled.button`
  display: block;
  margin: 12px auto;
  background: #f3f4f6;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #e5e7eb;
    transform: rotate(180deg);
  }
`;

const SettingsSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 16px 0;
  padding: 12px;
  background: #f3f4f6;
  border-radius: 12px;
`;

const SettingLabel = styled.span`
  font-size: 14px;
  color: #666;
  font-weight: 500;
`;

const SlippageInput = styled.input`
  width: 60px;
  padding: 6px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
`;

const SwapButton = styled.button`
  width: 100%;
  background: linear-gradient(135deg, #3b82f6 0%, #1e3a8a 100%);
  color: white;
  padding: 16px;
  border-radius: 16px;
  border: none;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 16px;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  background: #fee2e2;
  color: #dc2626;
  padding: 12px;
  border-radius: 12px;
  margin-top: 12px;
  font-size: 14px;
`;

const SuccessMessage = styled.div`
  background: #d1fae5;
  color: #059669;
  padding: 12px;
  border-radius: 12px;
  margin-top: 12px;
  font-size: 14px;
`;

const FeeNote = styled.div`
  text-align: center;
  margin-top: 12px;
  font-size: 13px;
  color: #666;
`;

const Footer = styled.footer`
  max-width: 480px;
  margin: 24px auto 0;
  text-align: center;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const FooterLink = styled.a`
  color: white;
  text-decoration: none;
  font-weight: 600;
  opacity: 0.8;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 1;
  }
`;

const FooterText = styled.p`
  margin: 0;
  opacity: 0.8;
  font-size: 14px;
`;
