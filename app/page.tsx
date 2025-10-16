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
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [selectingToken, setSelectingToken] = useState<'from' | 'to'>('from');
  const [tokenBalances, setTokenBalances] = useState<{[key: string]: string}>({});
  const [usdPrices, setUsdPrices] = useState<{[key: string]: number}>({});
  const [walletBalance, setWalletBalance] = useState('0.0000');

  // Load token balances
  const loadTokenBalances = async () => {
    if (!web3 || !account) return;

    const balances: {[key: string]: string} = {};
    
    for (const token of TOKEN_LIST) {
      try {
        if (token.symbol === 'BNB') {
          const balance = await web3.eth.getBalance(account);
          balances[token.symbol] = web3.utils.fromWei(balance, 'ether');
        } else {
          const tokenContract = new web3.eth.Contract(ERC20_ABI as any, token.address);
          const balance = await tokenContract.methods.balanceOf(account).call() as any;
          balances[token.symbol] = web3.utils.fromWei(balance.toString(), 'ether');
        }
      } catch (err) {
        balances[token.symbol] = '0.0000';
      }
    }
    
    setTokenBalances(balances);
    setWalletBalance(balances.BNB || '0.0000');
  };

  // Load USD prices (mock data for now)
  const loadUsdPrices = async () => {
    // Mock USD prices - in real app, fetch from API
    const prices: {[key: string]: number} = {
      'BNB': 620.50,
      'PAYU': 0.0000012,
      'CAKE': 3.45,
      'USDT': 1.00,
      'BUSD': 1.00,
      'USDC': 1.00
    };
    setUsdPrices(prices);
  };

  // Connect Wallet
  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const web3Instance = new Web3(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const accounts = await web3Instance.eth.getAccounts();
        
        setWeb3(web3Instance);
        setAccount(accounts[0]);
        
        // Load USD prices first
        await loadUsdPrices();
        
        // Load balances after a short delay to ensure web3 is ready
        setTimeout(async () => {
          await loadTokenBalances();
        }, 100);
        
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
      const amounts = await routerContract.methods.getAmountsOut(amountIn, path).call() as string[];
      
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
        const allowance = await tokenContract.methods.allowance(account, PAYPAYU_ROUTER).call() as any;
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
        const allowance = await tokenContract.methods.allowance(account, PAYPAYU_ROUTER).call() as any;
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

  // Token selection handlers
  const openTokenModal = (tokenType: 'from' | 'to') => {
    setSelectingToken(tokenType);
    setShowTokenModal(true);
  };

  const selectToken = (token: any) => {
    if (selectingToken === 'from') {
      setFromToken(token);
      setFromAmount(''); // Reset amount when changing token
      setToAmount('');
    } else {
      setToToken(token);
      setToAmount(''); // Recalculate output amount
    }
    setShowTokenModal(false);
  };

  // Percentage buttons
  const setAmountPercentage = (percentage: number) => {
    const currentBalance = parseFloat(tokenBalances[fromToken.symbol] || '0');
    const amount = (currentBalance * percentage / 100).toString();
    setFromAmount(amount);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      calculateOutputAmount();
    }, 500);
    return () => clearTimeout(timer);
  }, [fromAmount, fromToken, toToken, calculateOutputAmount]);

  // Load balances when account or web3 changes
  useEffect(() => {
    if (account && web3) {
      // Small delay to ensure everything is ready
      setTimeout(() => {
        loadTokenBalances();
      }, 200);
    }
  }, [account, web3]);

  // Load USD prices once
  useEffect(() => {
    loadUsdPrices();
  }, []);

  return (
    <Container>
      <Header>
        <Logo>🔄 PAYU SWAP</Logo>
        {account ? (
          <WalletInfo>
            <WalletStatus>
              <StatusDot />
              <WalletAddress>{account.slice(0, 6)}...{account.slice(-4)}</WalletAddress>
            </WalletStatus>
            <WalletBalance>Balance: {parseFloat(walletBalance).toFixed(4)} BNB</WalletBalance>
          </WalletInfo>
        ) : (
          <ConnectButton onClick={connectWallet}>Connect Wallet</ConnectButton>
        )}
      </Header>

      <SwapCard>
        <CardTitle>Swap</CardTitle>

        <TokenSection>
          <SectionLabel>From</SectionLabel>
          <PercentageButtons>
            <PercentageButton onClick={() => setAmountPercentage(25)}>25%</PercentageButton>
            <PercentageButton onClick={() => setAmountPercentage(50)}>50%</PercentageButton>
            <PercentageButton onClick={() => setAmountPercentage(100)}>MAX</PercentageButton>
          </PercentageButtons>
          <InputGroup>
            <AmountInput
              type="number"
              placeholder="0.00"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
            />
            <TokenSelect onClick={() => openTokenModal('from')}>
              <TokenLogo src={fromToken.logo} alt={fromToken.symbol} />
              <TokenSymbol>{fromToken.symbol}</TokenSymbol>
              <DropdownIcon>▼</DropdownIcon>
            </TokenSelect>
          </InputGroup>
          <TokenBalance>
            Balance: {parseFloat(tokenBalances[fromToken.symbol] || '0').toFixed(4)} {fromToken.symbol}
            {usdPrices[fromToken.symbol] && (
              <span> ≈ ${(parseFloat(tokenBalances[fromToken.symbol] || '0') * usdPrices[fromToken.symbol]).toFixed(2)}</span>
            )}
          </TokenBalance>
        </TokenSection>

        <SwitchButton onClick={switchTokens}>⇅</SwitchButton>

        <TokenSection>
          <SectionLabel>To</SectionLabel>
          <InputGroup>
            <AmountInput
              type="number"
              placeholder="0.00"
              value={toAmount}
              readOnly
            />
            <TokenSelect onClick={() => openTokenModal('to')}>
              <TokenLogo src={toToken.logo} alt={toToken.symbol} />
              <TokenSymbol>{toToken.symbol}</TokenSymbol>
              <DropdownIcon>▼</DropdownIcon>
            </TokenSelect>
          </InputGroup>
          <TokenBalance>
            Balance: {parseFloat(tokenBalances[toToken.symbol] || '0').toFixed(4)} {toToken.symbol}
            {usdPrices[toToken.symbol] && (
              <span> ≈ ${(parseFloat(tokenBalances[toToken.symbol] || '0') * usdPrices[toToken.symbol]).toFixed(2)}</span>
            )}
          </TokenBalance>
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

      </SwapCard>

      {/* 🆕 PAYUGIVE SYSTEM - ENTEGRASYON */}
      <PayuGiveSystem userAddress={account} />

      {/* Token Selection Modal */}
      {showTokenModal && (
        <ModalOverlay onClick={() => setShowTokenModal(false)}>
          <TokenModal onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Select Token</ModalTitle>
              <CloseButton onClick={() => setShowTokenModal(false)}>×</CloseButton>
            </ModalHeader>
            <TokenList>
              {TOKEN_LIST.map((token) => (
                <TokenItem 
                  key={token.address} 
                  onClick={() => selectToken(token)}
                  selected={
                    (selectingToken === 'from' && fromToken.address === token.address) ||
                    (selectingToken === 'to' && toToken.address === token.address)
                  }
                >
                  <TokenLogo src={token.logo} alt={token.symbol} />
                  <TokenInfo>
                    <TokenSymbol>{token.symbol}</TokenSymbol>
                    <TokenName>{token.name}</TokenName>
                  </TokenInfo>
                  <TokenBalanceInfo>
                    <Balance>{parseFloat(tokenBalances[token.symbol] || '0').toFixed(4)}</Balance>
                    {usdPrices[token.symbol] && (
                      <UsdValue>≈ ${(parseFloat(tokenBalances[token.symbol] || '0') * usdPrices[token.symbol]).toFixed(2)}</UsdValue>
                    )}
                  </TokenBalanceInfo>
                </TokenItem>
              ))}
            </TokenList>
          </TokenModal>
        </ModalOverlay>
      )}

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
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
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

const WalletInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const WalletStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StatusDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
`;

const WalletAddress = styled.div`
  background: rgba(255, 255, 255, 0.2);
  padding: 6px 12px;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  font-size: 12px;
`;

const WalletBalance = styled.div`
  color: #94a3b8;
  font-size: 12px;
  text-align: right;
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
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
`;

const CardTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 24px 0;
  color: #f1f5f9;
`;

const TokenSection = styled.div`
  margin-bottom: 12px;
`;

const SectionLabel = styled.div`
  font-size: 14px;
  color: #94a3b8;
  margin-bottom: 8px;
  font-weight: 500;
`;

const PercentageButtons = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
`;

const PercentageButton = styled.button`
  background: #334155;
  border: 1px solid #475569;
  color: #60a5fa;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #475569;
    border-color: #64748b;
  }
`;

const TokenBalance = styled.div`
  font-size: 12px;
  color: #64748b;
  margin-top: 8px;
  text-align: right;

  span {
    color: #94a3b8;
    margin-left: 4px;
  }
`;

const InputGroup = styled.div`
  display: flex;
  align-items: center;
  background: #334155;
  border: 1px solid #475569;
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
  color: #f1f5f9;

  &::placeholder {
    color: #64748b;
  }
`;

const TokenSelect = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: #475569;
  border: 1px solid #64748b;
  padding: 8px 12px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #64748b;
    border-color: #94a3b8;
  }
`;

const TokenLogo = styled.img`
  width: 24px;
  height: 24px;
  border-radius: 50%;
`;

const TokenSymbol = styled.span`
  font-weight: 700;
  color: #f1f5f9;
`;

const SwitchButton = styled.button`
  display: block;
  margin: 12px auto;
  background: #334155;
  border: 1px solid #475569;
  color: #f1f5f9;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #475569;
    transform: rotate(180deg);
    border-color: #64748b;
  }
`;

const SettingsSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 16px 0;
  padding: 12px;
  background: #334155;
  border: 1px solid #475569;
  border-radius: 12px;
`;

const SettingLabel = styled.span`
  font-size: 14px;
  color: #94a3b8;
  font-weight: 500;
`;

const SlippageInput = styled.input`
  width: 60px;
  padding: 6px;
  border: 1px solid #475569;
  border-radius: 8px;
  background: #1e293b;
  color: #f1f5f9;
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
  background: #431717;
  color: #fca5a5;
  border: 1px solid #dc2626;
  padding: 12px;
  border-radius: 12px;
  margin-top: 12px;
  font-size: 14px;
`;

const SuccessMessage = styled.div`
  background: #064e3b;
  color: #86efac;
  border: 1px solid #059669;
  padding: 12px;
  border-radius: 12px;
  margin-top: 12px;
  font-size: 14px;
`;

const FeeNote = styled.div`
  text-align: center;
  margin-top: 12px;
  font-size: 13px;
  color: #94a3b8;
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

const DropdownIcon = styled.span`
  font-size: 12px;
  opacity: 0.7;
  margin-left: 4px;
`;

// Token Selection Modal Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(8px);
`;

const TokenModal = styled.div`
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 20px;
  padding: 24px;
  max-width: 400px;
  width: 90%;
  max-height: 500px;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #334155;
`;

const ModalTitle = styled.h3`
  color: #f1f5f9;
  font-size: 20px;
  font-weight: 700;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;

  &:hover {
    background: #334155;
    color: #f1f5f9;
  }
`;

const TokenList = styled.div`
  max-height: 300px;
  overflow-y: auto;
  padding-right: 8px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #334155;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #64748b;
    border-radius: 3px;
  }
`;

const TokenItem = styled.div<{ selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => props.selected ? '#334155' : 'transparent'};
  border: 1px solid ${props => props.selected ? '#475569' : 'transparent'};

  &:hover {
    background: #334155;
    border-color: #475569;
  }
`;

const TokenInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const TokenName = styled.div`
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
`;

const TokenBalanceInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  margin-left: auto;
`;

const Balance = styled.div`
  font-size: 14px;
  color: #f1f5f9;
  font-weight: 600;
`;

const UsdValue = styled.div`
  font-size: 12px;
  color: #94a3b8;
`;
