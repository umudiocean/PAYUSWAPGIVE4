'use client';

import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import Web3 from 'web3';
import { PayuGiveSystem } from '../components/PayuGiveSystem';

// Contract addresses
const PAYPAYU_ROUTER = '0x669f9b0D21c15a608c5309e0B964c165FB428962';
const WBNB = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c';
const PLATFORM_FEE = '0.00025';
const PLATFORM_FEE_RECIPIENT = '0x8fba3cdBCaA2Bb8D98de58B1f079F44ccD6d6311';

// ERC20 ABI
const ERC20_ABI = [
  {
    name: "balanceOf",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    name: "approve",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" }
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    name: "allowance",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" }
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  }
];

// PAYPAYU Router ABI
const PAYPAYU_ABI = [
  {
    name: "getAmountsOut",
    inputs: [
      { name: "amountIn", type: "uint256" },
      { name: "path", type: "address[]" }
    ],
    outputs: [{ name: "amounts", type: "uint256[]" }],
    stateMutability: "view",
    type: "function"
  },
  {
    name: "swapExactBNBForTokens",
    inputs: [
      { name: "tokenOut", type: "address" },
      { name: "amountOutMin", type: "uint256" },
      { name: "deadline", type: "uint256" }
    ],
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    name: "swapExactTokensForBNB",
    inputs: [
      { name: "tokenIn", type: "address" },
      { name: "amountIn", type: "uint256" },
      { name: "amountOutMin", type: "uint256" },
      { name: "deadline", type: "uint256" }
    ],
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    name: "swapExactTokensForTokens",
    inputs: [
      { name: "tokenIn", type: "address" },
      { name: "tokenOut", type: "address" },
      { name: "amountIn", type: "uint256" },
      { name: "amountOutMin", type: "uint256" },
      { name: "deadline", type: "uint256" }
    ],
    outputs: [],
    stateMutability: "payable",
    type: "function"
  }
];

// Token list
const TOKEN_LIST = [
  {
    symbol: 'BNB',
    name: 'Binance Chain Native Token',
    address: WBNB,
    logo: 'https://cryptologos.cc/logos/bnb-bnb-logo.png',
    decimals: 18
  },
  {
    symbol: 'PAYU',
    name: 'Platform of All Your Utilities',
    address: '0x9AeB2E6DD8d55E14292ACFCFC4077e33106e4144',
    logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/assets/0x9AeB2E6DD8d55E14292ACFCFC4077e33106e4144/logo.png',
    decimals: 18
  },
  {
    symbol: 'CAKE',
    name: 'PancakeSwap Token',
    address: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
    logo: 'https://tokens.pancakeswap.finance/images/0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82.png',
    decimals: 18
  },
  {
    symbol: 'USDT',
    name: 'Tether USD',
    address: '0x55d398326f99059fF775485246999027B3197955',
    logo: 'https://tokens.pancakeswap.finance/images/0x55d398326f99059fF775485246999027B3197955.png',
    decimals: 18
  },
  {
    symbol: 'BUSD',
    name: 'Binance USD',
    address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
    logo: 'https://tokens.pancakeswap.finance/images/0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56.png',
    decimals: 18
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    logo: 'https://tokens.pancakeswap.finance/images/0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d.png',
    decimals: 18
  }
];

// Styled Components - Orijinal tasarıma göre
const Container = styled.div`
  min-height: 100vh;
  background: #0a0a0a;
  color: white;
  font-family: 'Inter', sans-serif;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Header = styled.div`
  width: 100%;
  max-width: 500px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: white;
  margin: 0;
`;

const WalletInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const WalletIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #ff6b35;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
`;

const WalletAddress = styled.span`
  color: #888;
  font-size: 14px;
`;

const WalletBalance = styled.span`
  color: #888;
  font-size: 14px;
`;

const ConnectButton = styled.button`
  background: #6366f1;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #5b5cf0;
  }
`;

const SwapCard = styled.div`
  background: #111;
  border: 1px solid #222;
  border-radius: 16px;
  padding: 24px;
  width: 100%;
  max-width: 500px;
  margin-bottom: 20px;
`;

const TokenSection = styled.div`
  position: relative;
`;

const FromSection = styled.div`
  background: #0f0f0f;
  border: 1px solid #222;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 12px;
`;

const FromLabel = styled.div`
  color: #888;
  font-size: 14px;
  margin-bottom: 8px;
`;

const ToSection = styled.div`
  background: #0f0f0f;
  border: 1px solid #222;
  border-radius: 12px;
  padding: 20px;
  margin-top: 12px;
`;

const ToLabel = styled.div`
  color: #888;
  font-size: 14px;
  margin-bottom: 8px;
`;

const AmountDisplay = styled.div`
  margin-bottom: 12px;
`;

const AmountValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: white;
  margin-bottom: 4px;
`;

const UsdValue = styled.div`
  color: #888;
  font-size: 14px;
`;

const PercentageButtons = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
`;

const PercentageButton = styled.button`
  background: transparent;
  color: #60a5fa;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #1e293b;
  }
`;

const TokenSelect = styled.button`
  background: transparent;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #1e293b;
  }
`;

const TokenLogo = styled.img`
  width: 24px;
  height: 24px;
  border-radius: 50%;
`;

const TokenSymbol = styled.span`
  color: white;
  font-size: 16px;
  font-weight: 600;
`;

const DropdownIcon = styled.span`
  color: #888;
  font-size: 12px;
`;

const SwitchButton = styled.button`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  background: #1e293b;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  color: white;
  font-size: 16px;
  cursor: pointer;
  z-index: 10;
  transition: all 0.2s;

  &:hover {
    background: #334155;
  }
`;

const SettingsSection = styled.div`
  margin: 24px 0;
  padding: 20px;
  background: #0f0f0f;
  border: 1px solid #222;
  border-radius: 12px;
`;

const SlippageSection = styled.div`
  margin-bottom: 20px;
`;

const SlippageLabel = styled.div`
  color: white;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
`;

const SlippageButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const SlippageButton = styled.button<{ $active: boolean }>`
  background: ${props => props.$active ? '#60a5fa' : 'transparent'};
  color: ${props => props.$active ? 'white' : '#60a5fa'};
  border: 1px solid #60a5fa;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #60a5fa;
    color: white;
  }
`;

const MevSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const MevLabel = styled.div`
  color: white;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const MevIcon = styled.span`
  color: #ef4444;
`;

const MevToggle = styled.div`
  position: relative;
`;

const MevSwitch = styled.div`
  width: 44px;
  height: 24px;
  background: #374151;
  border-radius: 12px;
  position: relative;
  cursor: pointer;

  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    transition: all 0.2s;
  }
`;

const SwapButton = styled.button`
  width: 100%;
  background: #8b5cf6;
  color: white;
  border: none;
  padding: 16px;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 20px;

  &:disabled {
    background: #374151;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background: #7c3aed;
  }
`;

const ErrorMessage = styled.div`
  background: #dc2626;
  color: white;
  padding: 12px;
  border-radius: 8px;
  margin: 16px 0;
  font-size: 14px;
`;

const SuccessMessage = styled.div`
  background: #059669;
  color: white;
  padding: 12px;
  border-radius: 8px;
  margin: 16px 0;
  font-size: 14px;
`;

// Modal styles
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const TokenModal = styled.div`
  background: #111;
  border: 1px solid #222;
  border-radius: 16px;
  width: 90%;
  max-width: 400px;
  max-height: 80vh;
  overflow: hidden;
`;

const ModalHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #222;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h3`
  color: white;
  margin: 0;
  font-size: 18px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #888;
  font-size: 24px;
  cursor: pointer;
`;

const TokenList = styled.div`
  max-height: 400px;
  overflow-y: auto;
`;

const TokenItem = styled.div<{ $isSelected: boolean }>`
  padding: 16px 20px;
  border-bottom: 1px solid #222;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${props => props.$isSelected ? '#1e293b' : 'transparent'};
  transition: all 0.2s;

  &:hover {
    background: #1e293b;
  }
`;

const TokenInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const TokenName = styled.div`
  color: #888;
  font-size: 12px;
`;

const TokenBalanceInfo = styled.div`
  text-align: right;
`;

const Balance = styled.div`
  color: white;
  font-size: 14px;
  font-weight: 500;
`;

const UsdValueModal = styled.div`
  color: #888;
  font-size: 12px;
  margin-top: 2px;
`;

export default function Home() {
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [fromToken, setFromToken] = useState(TOKEN_LIST[0]); // BNB
  const [toToken, setToToken] = useState(TOKEN_LIST[1]); // PAYU
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [slippage, setSlippage] = useState(0.1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [selectingToken, setSelectingToken] = useState<'from' | 'to'>('from');
  const [tokenBalances, setTokenBalances] = useState<{[key: string]: string}>({});
  const [usdPrices, setUsdPrices] = useState<{[key: string]: number}>({});
  const [walletBalance, setWalletBalance] = useState('0.0000');

  // Load token balances
  const loadTokenBalances = useCallback(async () => {
    if (!web3 || !account) return;

    try {
      const balances: {[key: string]: string} = {};
      
      const balancePromises = TOKEN_LIST.map(async (token) => {
        try {
          if (token.symbol === 'BNB') {
            const balanceWei = await web3.eth.getBalance(account);
            return {
              symbol: token.symbol,
              balance: web3.utils.fromWei(balanceWei, 'ether')
            };
          } else {
            const tokenContract = new web3.eth.Contract(ERC20_ABI as any, token.address);
            const balanceRaw = await tokenContract.methods.balanceOf(account).call() as any;
            return {
              symbol: token.symbol,
              balance: web3.utils.fromWei(balanceRaw.toString(), 'ether')
            };
          }
        } catch (err) {
          return {
            symbol: token.symbol,
            balance: '0.0000'
          };
        }
      });
      
      const results = await Promise.all(balancePromises);
      
      results.forEach(result => {
        const balance = parseFloat(result.balance);
        if (result.symbol === 'BNB') {
          balances[result.symbol] = balance.toFixed(6);
        } else {
          balances[result.symbol] = balance.toFixed(4);
        }
      });
      
      setTokenBalances(balances);
      setWalletBalance(balances.BNB || '0.0000');
      
    } catch (err) {
      console.error('Error loading balances:', err);
    }
  }, [web3, account]);

  // Load USD prices
  const loadUsdPrices = useCallback(async () => {
    if (!web3) return;
    
    const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955";
    const prices: {[key: string]: number} = {};
    
    for (const token of TOKEN_LIST) {
      try {
        if (token.symbol !== 'USDT') {
          try {
            const routerContract = new web3.eth.Contract(PAYPAYU_ABI as any, PAYPAYU_ROUTER);
            const oneToken = web3.utils.toWei('1', 'ether');
            
            const path = token.address === WBNB 
              ? [WBNB, USDT_ADDRESS]
              : [token.address, WBNB, USDT_ADDRESS];
            
            const amounts = await routerContract.methods.getAmountsOut(oneToken, path).call() as string[];
            const usdtAmount = amounts[amounts.length - 1];
            prices[token.symbol] = parseFloat(web3.utils.fromWei(usdtAmount, 'ether'));
            continue;
          } catch (err) {
            // Fallback
          }
        } else {
          prices[token.symbol] = 1.00;
          continue;
        }
        
        const fallbackPrices: {[key: string]: number} = {
          'BNB': 320.50,
          'PAYU': 0.0000012,
          'CAKE': 2.85,
          'BUSD': 1.00,
          'USDC': 1.00
        };
        prices[token.symbol] = fallbackPrices[token.symbol] || 0;
        
      } catch (err) {
        prices[token.symbol] = 0;
      }
    }
    
    setUsdPrices(prices);
  }, [web3]);

  // Connect Wallet
  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      setError('Please install MetaMask!');
      return;
    }

    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      const web3Instance = new Web3(window.ethereum);
      const accounts = await web3Instance.eth.getAccounts();
      
      const chainId = await web3Instance.eth.getChainId();
      if (Number(chainId) !== 56 && Number(chainId) !== 97) {
        setError('Please switch to Binance Smart Chain');
        return;
      }
      
      setWeb3(web3Instance);
      setAccount(accounts[0]);
      setError(null);
      
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
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
      
      let path: string[];
      if (fromToken.symbol === 'BNB' && toToken.symbol !== 'BNB') {
        path = [WBNB, toToken.address];
      } else if (fromToken.symbol !== 'BNB' && toToken.symbol === 'BNB') {
        path = [fromToken.address, WBNB];
      } else if (fromToken.symbol !== 'BNB' && toToken.symbol !== 'BNB') {
        path = [fromToken.address, WBNB, toToken.address];
      } else {
        setToAmount('');
        return;
      }

      const amounts = await routerContract.methods.getAmountsOut(amountIn, path).call() as string[];
      const amountOut = amounts[amounts.length - 1];
      const formattedAmount = web3.utils.fromWei(amountOut, 'ether');
      
      setToAmount(parseFloat(formattedAmount).toFixed(6));
    } catch (err) {
      console.error('Error calculating output:', err);
      setToAmount('');
    }
  }, [web3, fromAmount, fromToken, toToken]);

  // Handle swap
  const handleSwap = async () => {
    if (!web3 || !account || !fromAmount || !toAmount) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const routerContract = new web3.eth.Contract(PAYPAYU_ABI as any, PAYPAYU_ROUTER);
      const amountIn = web3.utils.toWei(fromAmount, 'ether');
      const amountOut = web3.utils.toWei(toAmount, 'ether');
      
      // Calculate minimum output with slippage
      const slippageMultiplier = 1 - (slippage / 100);
      const minAmountOut = (BigInt(amountOut) * BigInt(Math.floor(slippageMultiplier * 1000))) / 1000n;
      
      // Set deadline (20 minutes from now)
      const deadline = Math.floor(Date.now() / 1000) + 1200;
      
      // Platform fee
      const platformFee = web3.utils.toWei(PLATFORM_FEE, 'ether');

      if (fromToken.symbol === 'BNB' && toToken.symbol !== 'BNB') {
        // BNB to Token
        const totalValue = BigInt(amountIn) + BigInt(platformFee);
        
        await routerContract.methods
          .swapExactBNBForTokens(
            toToken.address,
            minAmountOut.toString(),
            deadline
          )
          .send({
            from: account,
            value: totalValue.toString(),
            gas: '300000'
          });
      } else if (fromToken.symbol !== 'BNB' && toToken.symbol === 'BNB') {
        // Token to BNB
        const tokenContract = new web3.eth.Contract(ERC20_ABI as any, fromToken.address);
        const allowance = await tokenContract.methods.allowance(account, PAYPAYU_ROUTER).call() as any;
        
        if (BigInt(allowance) < BigInt(amountIn)) {
          await tokenContract.methods
            .approve(PAYPAYU_ROUTER, amountIn)
            .send({ from: account });
        }

        await routerContract.methods
          .swapExactTokensForBNB(
            fromToken.address,
            amountIn,
            minAmountOut.toString(),
            deadline
          )
          .send({
            from: account,
            value: platformFee,
            gas: '350000'
          });
      } else if (fromToken.symbol !== 'BNB' && toToken.symbol !== 'BNB') {
        // Token to Token
        const tokenContract = new web3.eth.Contract(ERC20_ABI as any, fromToken.address);
        const allowance = await tokenContract.methods.allowance(account, PAYPAYU_ROUTER).call() as any;
        
        if (BigInt(allowance) < BigInt(amountIn)) {
          await tokenContract.methods
            .approve(PAYPAYU_ROUTER, amountIn)
            .send({ from: account });
        }

        await routerContract.methods
          .swapExactTokensForTokens(
            fromToken.address,
            toToken.address,
            amountIn,
            minAmountOut.toString(),
            deadline
          )
          .send({
            from: account,
            value: platformFee,
            gas: '350000'
          });
      }

      setSuccess(true);
      setFromAmount('');
      setToAmount('');
      
      // Track the swap for PAYUGIVE system
      try {
        await fetch('/api/track-swap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ walletAddress: account })
        });
      } catch (err) {
        console.error('Failed to track swap:', err);
      }
      
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

  const selectToken = (token: typeof TOKEN_LIST[0]) => {
    if (selectingToken === 'from') {
      setFromToken(token);
    } else {
      setToToken(token);
    }
    setShowTokenModal(false);
  };

  // Percentage buttons
  const setAmountPercentage = (percentage: number) => {
    const currentBalance = parseFloat(tokenBalances[fromToken.symbol] || '0');
    let amount = (currentBalance * percentage / 100);
    
    if (percentage === 100) {
      amount = currentBalance;
    }
    
    const decimals = fromToken.symbol === 'BNB' ? 6 : 4;
    const formattedAmount = amount.toFixed(decimals);
    
    setFromAmount(formattedAmount);
  };

  // Effects
  useEffect(() => {
    const timer = setTimeout(() => {
      calculateOutputAmount();
    }, 500);
    return () => clearTimeout(timer);
  }, [fromAmount, fromToken, toToken, calculateOutputAmount]);

  useEffect(() => {
    if (account && web3) {
      loadTokenBalances();
      loadUsdPrices();
      
      const interval = setInterval(() => {
        loadTokenBalances();
      }, 10000);
      
      return () => clearInterval(interval);
    }
  }, [account, web3, loadTokenBalances, loadUsdPrices]);

  return (
    <Container>
      <Header>
        <Title>Swap</Title>
        {account ? (
          <WalletInfo>
            <WalletIcon>🟠</WalletIcon>
            <WalletAddress>{account.slice(0, 6)}...{account.slice(-4)}</WalletAddress>
            <WalletBalance>Balance: {parseFloat(walletBalance).toFixed(4)} BNB</WalletBalance>
          </WalletInfo>
        ) : (
          <ConnectButton onClick={connectWallet}>Connect Wallet</ConnectButton>
        )}
      </Header>

      <SwapCard>
        <TokenSection>
          <FromSection>
            <FromLabel>From</FromLabel>
            <AmountDisplay>
              <AmountValue>{fromAmount || '0.001537'}</AmountValue>
              <UsdValue>~${usdPrices[fromToken.symbol] ? (parseFloat(fromAmount || '0.001537') * usdPrices[fromToken.symbol]).toFixed(2) : '1.81'} USD</UsdValue>
            </AmountDisplay>
            <PercentageButtons>
              <PercentageButton onClick={() => setAmountPercentage(25)}>25%</PercentageButton>
              <PercentageButton onClick={() => setAmountPercentage(50)}>50%</PercentageButton>
              <PercentageButton onClick={() => setAmountPercentage(100)}>MAX</PercentageButton>
            </PercentageButtons>
            <TokenSelect onClick={() => openTokenModal('from')}>
              <TokenLogo src={fromToken.logo} alt={fromToken.symbol} />
              <TokenSymbol>{fromToken.symbol}</TokenSymbol>
              <DropdownIcon>▼</DropdownIcon>
            </TokenSelect>
          </FromSection>

          <SwitchButton onClick={switchTokens}>⇅</SwitchButton>

          <ToSection>
            <ToLabel>To</ToLabel>
            <AmountDisplay>
              <AmountValue>{toAmount || '1588168650.533592'}</AmountValue>
              <UsdValue>~${usdPrices[toToken.symbol] ? (parseFloat(toAmount || '0') * usdPrices[toToken.symbol]).toFixed(2) : '1.59'} USD</UsdValue>
            </AmountDisplay>
            <TokenSelect onClick={() => openTokenModal('to')}>
              <TokenLogo src={toToken.logo} alt={toToken.symbol} />
              <TokenSymbol>{toToken.symbol}</TokenSymbol>
              <DropdownIcon>▼</DropdownIcon>
            </TokenSelect>
          </ToSection>
        </TokenSection>

        <SettingsSection>
          <SlippageSection>
            <SlippageLabel>Slippage Tolerance</SlippageLabel>
            <SlippageButtons>
              <SlippageButton $active={slippage === 0.1} onClick={() => setSlippage(0.1)}>0.1%</SlippageButton>
              <SlippageButton $active={slippage === 0.5} onClick={() => setSlippage(0.5)}>0.5%</SlippageButton>
              <SlippageButton $active={slippage === 1} onClick={() => setSlippage(1)}>1%</SlippageButton>
            </SlippageButtons>
          </SlippageSection>
          
          <MevSection>
            <MevLabel>
              <MevIcon>🛡️</MevIcon>
              Enable MEV Protect
            </MevLabel>
            <MevToggle>
              <MevSwitch />
            </MevToggle>
          </MevSection>
        </SettingsSection>

        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>Swap completed successfully!</SuccessMessage>}

        <SwapButton 
          onClick={handleSwap} 
          disabled={loading || !fromAmount || !toAmount || parseFloat(fromAmount) <= 0}
        >
          {loading ? 'Processing Swap' : 'Swap'}
        </SwapButton>
      </SwapCard>

      {/* PAYUGIVE System */}
      <PayuGiveSystem />

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
                  key={token.symbol} 
                  onClick={() => selectToken(token)}
                  $isSelected={selectingToken === 'from' ? fromToken.symbol === token.symbol : toToken.symbol === token.symbol}
                >
                  <TokenInfo>
                    <TokenLogo src={token.logo} alt={token.symbol} />
                    <TokenSymbol>{token.symbol}</TokenSymbol>
                    <TokenName>{token.name}</TokenName>
                  </TokenInfo>
                  <TokenBalanceInfo>
                    <Balance>{parseFloat(tokenBalances[token.symbol] || '0').toFixed(4)}</Balance>
                    {usdPrices[token.symbol] && (
                      <UsdValueModal>≈ ${(parseFloat(tokenBalances[token.symbol] || '0') * usdPrices[token.symbol]).toFixed(2)}</UsdValueModal>
                    )}
                  </TokenBalanceInfo>
                </TokenItem>
              ))}
            </TokenList>
          </TokenModal>
        </ModalOverlay>
      )}
    </Container>
  );
}