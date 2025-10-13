'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Web3 from 'web3';
import styled from 'styled-components';

// ==================== SMART CONTRACT ====================
const PAYPAYU_ROUTER = "0x669f9b0D21c15a608c5309e0B964c165FB428962";
const WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
const PLATFORM_FEE = "0.00025"; // 0.00025 BNB

// PayPayu Router ABI (minimal - sadece ihtiyacımız olanlar)
const PAYPAYU_ABI = [
    {
        "inputs": [
            {"internalType": "address", "name": "tokenOut", "type": "address"},
            {"internalType": "uint256", "name": "amountOutMin", "type": "uint256"},
            {"internalType": "uint256", "name": "deadline", "type": "uint256"}
        ],
        "name": "swapExactBNBForTokens",
        "outputs": [{"internalType": "uint256[]", "name": "amounts", "type": "uint256[]"}],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "address", "name": "tokenIn", "type": "address"},
            {"internalType": "uint256", "name": "amountIn", "type": "uint256"},
            {"internalType": "uint256", "name": "amountOutMin", "type": "uint256"},
            {"internalType": "uint256", "name": "deadline", "type": "uint256"}
        ],
        "name": "swapExactTokensForBNB",
        "outputs": [{"internalType": "uint256[]", "name": "amounts", "type": "uint256[]"}],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "address", "name": "tokenIn", "type": "address"},
            {"internalType": "address", "name": "tokenOut", "type": "address"},
            {"internalType": "uint256", "name": "amountIn", "type": "uint256"},
            {"internalType": "uint256", "name": "amountOutMin", "type": "uint256"},
            {"internalType": "uint256", "name": "deadline", "type": "uint256"}
        ],
        "name": "swapExactTokensForTokens",
        "outputs": [{"internalType": "uint256[]", "name": "amounts", "type": "uint256[]"}],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "uint256", "name": "amountIn", "type": "uint256"},
            {"internalType": "address[]", "name": "path", "type": "address[]"}
        ],
        "name": "getAmountsOut",
        "outputs": [{"internalType": "uint256[]", "name": "amounts", "type": "uint256[]"}],
        "stateMutability": "view",
        "type": "function"
    }
];

const ERC20_ABI = [
    {"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
    {"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"}
];

// Token list - PAYU coin en üstte
const TOKEN_LIST = [
    { symbol: "PAYU", name: "Platform of meme coins", address: "0x9AeB2E6DD8d55E14292ACFCFC4077e33106e4144", decimals: 18, logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/assets/0x9AeB2E6DD8d55E14292ACFCFC4077e33106e4144/logo.png" },
    { symbol: "BNB", name: "Binance Chain Native Token", address: WBNB, decimals: 18, logo: "https://tokens.pancakeswap.finance/images/symbol/bnb.png" },
    { symbol: "CAKE", name: "PancakeSwap Token", address: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82", decimals: 18, logo: "https://tokens.pancakeswap.finance/images/0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82.png" },
    { symbol: "USDT", name: "Tether USD", address: "0x55d398326f99059fF775485246999027B3197955", decimals: 18, logo: "https://tokens.pancakeswap.finance/images/0x55d398326f99059fF775485246999027B3197955.png" },
    { symbol: "BUSD", name: "Binance USD", address: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56", decimals: 18, logo: "https://tokens.pancakeswap.finance/images/0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56.png" },
    { symbol: "USDC", name: "USD Coin", address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", decimals: 18, logo: "https://tokens.pancakeswap.finance/images/0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d.png" },
    { symbol: "BTCB", name: "Bitcoin BEP2", address: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c", decimals: 18, logo: "https://tokens.pancakeswap.finance/images/0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c.png" },
    { symbol: "ETH", name: "Ethereum Token", address: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8", decimals: 18, logo: "https://tokens.pancakeswap.finance/images/0x2170Ed0880ac9A755fd29B2688956BD959F933F8.png" },
    { symbol: "ADA", name: "Cardano Token", address: "0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47", decimals: 18, logo: "https://tokens.pancakeswap.finance/images/0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47.png" },
    { symbol: "DOT", name: "Polkadot Token", address: "0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402", decimals: 18, logo: "https://tokens.pancakeswap.finance/images/0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402.png" },
    { symbol: "LINK", name: "ChainLink Token", address: "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD", decimals: 18, logo: "https://tokens.pancakeswap.finance/images/0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD.png" },
    { symbol: "UNI", name: "Uniswap", address: "0xBf5140A22578168FD562DCcF235E5D43A02ce9B1", decimals: 18, logo: "https://tokens.pancakeswap.finance/images/0xBf5140A22578168FD562DCcF235E5D43A02ce9B1.png" },
    { symbol: "LTC", name: "Litecoin Token", address: "0x4338665CBB7B2485A8855A139b75D5e34AB0DB94", decimals: 18, logo: "https://tokens.pancakeswap.finance/images/0x4338665CBB7B2485A8855A139b75D5e34AB0DB94.png" },
    { symbol: "BCH", name: "Bitcoin Cash Token", address: "0x8fF795a6F4D97E7887C79beA79aba5cc76444aDf", decimals: 18, logo: "https://tokens.pancakeswap.finance/images/0x8fF795a6F4D97E7887C79beA79aba5cc76444aDf.png" },
    { symbol: "XRP", name: "XRP Token", address: "0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE", decimals: 18, logo: "https://tokens.pancakeswap.finance/images/0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE.png" },
    { symbol: "CUSTOM", name: "Custom Token", address: "0x9eeb6c5ff183e6001c65a12d70026b900ae76781", decimals: 18, logo: "https://tokens.pancakeswap.finance/images/symbol/bnb.png" },
    { symbol: "ADA", name: "Cardano Token", address: "0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47", decimals: 18, logo: "https://tokens.pancakeswap.finance/images/0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47.png" },
    { symbol: "DOGE", name: "Dogecoin", address: "0xbA2aE424d960c26247Dd6c32edC70B295c744C43", decimals: 8, logo: "https://tokens.pancakeswap.finance/images/0xbA2aE424d960c26247Dd6c32edC70B295c744C43.png" },
    { symbol: "MATIC", name: "Polygon", address: "0xCC42724C6683B7E57334c4E856f4c9965ED682bD", decimals: 18, logo: "https://tokens.pancakeswap.finance/images/0xCC42724C6683B7E57334c4E856f4c9965ED682bD.png" },
    { symbol: "AVAX", name: "Avalanche", address: "0x1CE0c2827e2eF14D5C4f29a091d735A204794041", decimals: 18, logo: "https://tokens.pancakeswap.finance/images/0x1CE0c2827e2eF14D5C4f29a091d735A204794041.png" },
    { symbol: "SOL", name: "Solana", address: "0x570A5D26f7765Ecb712C0924E4De545B89fD43dF", decimals: 18, logo: "https://tokens.pancakeswap.finance/images/0x570A5D26f7765Ecb712C0924E4De545B89fD43dF.png" },
    { symbol: "SHIB", name: "Shiba Inu", address: "0x2859e4544C4bB03966803b044A93563Bd2D0DD4D", decimals: 18, logo: "https://tokens.pancakeswap.finance/images/0x2859e4544C4bB03966803b044A93563Bd2D0DD4D.png" },
    { symbol: "PEPE", name: "Pepe", address: "0x25d887Ce7a35172C62FeBFD67a1851F35C727E0e", decimals: 18, logo: "https://tokens.pancakeswap.finance/images/0x25d887Ce7a35172C62FeBFD67a1851F35C727E0e.png" },
];


// ==================== STYLED COMPONENTS ====================
const Container = styled.div`
    min-height: 100vh;
    background: linear-gradient(139.73deg, #08060E 0%, #0F0C23 100%);
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
    font-family: 'Kanit', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
`;

const SwapCard = styled.div`
    background: #27262C;
    border-radius: 32px;
    width: 100%;
    max-width: 440px;
    padding: 24px;
    box-shadow: 0px 20px 36px -8px rgba(14, 14, 44, 0.1);
    @media (min-width: 768px) {
        max-width: 820px;
    }
`;

const SwapHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
`;

const SwapTitle = styled.h2`
    font-size: 24px;
    font-weight: 700;
    color: #F4EEFF;
    margin: 0;
    font-family: 'Kanit', sans-serif;
`;

const WalletButton = styled.button`
    width: 100%;
    height: 48px;
    padding: 0 16px;
    background: linear-gradient(270deg, #7645D9 0%, #5121B1 100%);
    color: white;
    border: none;
    border-radius: 16px;
    font-size: 18px;
    font-weight: 700;
    cursor: pointer;
    font-family: 'Kanit', sans-serif;
    transition: all 0.2s ease;
    &:hover {
        box-shadow: 0 0 20px rgba(118, 69, 217, 0.5);
        transform: translateY(-1px);
    }
    &:active {
        transform: translateY(0);
    }
`;

const ConnectedWallet = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: #372F47;
    border-radius: 16px;
    margin-bottom: 16px;
    font-size: 14px;
    color: #F4EEFF;
    font-family: 'Kanit', sans-serif;
    border: 2px solid transparent;
    transition: border-color 0.2s ease;
    &:hover {
        border-color: #7645D9;
    }
`;

const TokenBox = styled.div`
    background: #372F47;
    border-radius: 16px;
    padding: 16px;
    margin-bottom: 8px;
    border: 2px solid transparent;
    transition: all 0.2s ease;
    &:hover {
        border-color: #7645D9;
        background: #3A3149;
    }
`;

const TokenInput = styled.input`
    flex: 1;
    background: transparent;
    border: none;
    font-size: 24px;
    font-weight: 600;
    color: #F4EEFF;
    outline: none;
    width: 100%;
    font-family: 'Kanit', sans-serif;
    &::placeholder {
        color: #B8ADD2;
        opacity: 0.7;
    }
    &:focus {
        outline: none;
    }
`;

const TokenSelectButton = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    background: #27262C;
    border: none;
    padding: 8px 12px;
    border-radius: 12px;
    cursor: pointer;
    color: #F4EEFF;
    font-family: 'Kanit', sans-serif;
    font-weight: 600;
    transition: all 0.2s ease;
    &:hover {
        background: #372F47;
        transform: translateY(-1px);
    }
    img { 
        width: 24px; 
        height: 24px; 
        border-radius: 50%; 
    }
`;

const SwapButton = styled.button<{ disabled?: boolean }>`
    width: 100%;
    height: 48px;
    padding: 0 16px;
    background: ${props => props.disabled ? '#383241' : 'linear-gradient(270deg, #7645D9 0%, #5121B1 100%)'};
    color: ${props => props.disabled ? '#B8ADD2' : 'white'};
    border: none;
    border-radius: 16px;
    font-size: 18px;
    font-weight: 700;
    cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
    margin-top: 16px;
    font-family: 'Kanit', sans-serif;
    transition: all 0.2s ease;
    &:hover {
        ${props => !props.disabled && 'box-shadow: 0 0 20px rgba(118, 69, 217, 0.5); transform: translateY(-1px);'}
    }
    &:active {
        transform: translateY(0);
    }
`;

const FeeInfo = styled.div`
    display: flex;
    justify-content: space-between;
    padding: 12px;
    background: rgba(31, 199, 212, 0.1);
    border-radius: 16px;
    margin-top: 12px;
    font-size: 14px;
    color: #1FC7D4;
    font-family: 'Kanit', sans-serif;
    border: 1px solid rgba(31, 199, 212, 0.2);
`;

const ErrorText = styled.div`
    color: #ED4B9E;
    font-size: 14px;
    margin-top: 12px;
    padding: 12px;
    background: rgba(237, 75, 158, 0.1);
    border-radius: 16px;
    font-family: 'Kanit', sans-serif;
    border: 1px solid rgba(237, 75, 158, 0.2);
`;

const SuccessText = styled.div`
    color: #31D0AA;
    font-size: 14px;
    margin-top: 12px;
    padding: 12px;
    background: rgba(49, 208, 170, 0.1);
    border-radius: 16px;
    font-family: 'Kanit', sans-serif;
    border: 1px solid rgba(49, 208, 170, 0.2);
`;

const ArrowButton = styled.button`
    width: 40px;
    height: 40px;
    background: #27262C;
    border: 4px solid #1E1D20;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 20px;
    color: #1FC7D4;
    margin: -16px auto;
    position: relative;
    z-index: 1;
    transition: all 0.3s ease;
    &:hover {
        background: #372F47;
        transform: rotate(180deg);
        border-color: #7645D9;
    }
`;

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
    backdrop-filter: blur(4px);
`;

const ModalContent = styled.div`
    background: #27262C;
    border-radius: 24px;
    width: 90%;
    max-width: 420px;
    height: 80vh;
    max-height: 80vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
`;

const ModalHeader = styled.div`
    padding: 20px 24px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const ModalTitle = styled.h3`
    font-size: 18px;
    font-weight: 700;
    color: #F4EEFF;
    margin: 0;
    font-family: 'Kanit', sans-serif;
`;

const HeaderButtons = styled.div`
    display: flex;
    gap: 8px;
`;

const CloseButton = styled.button`
    background: none;
    border: none;
    color: #B8ADD2;
    font-size: 20px;
    cursor: pointer;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    &:hover {
        color: #F4EEFF;
    }
`;

const SearchInput = styled.input`
    width: 100%;
    padding: 12px 16px;
    background: #1E1D20;
    border: 2px solid #7645D9;
    border-radius: 16px;
    color: #F4EEFF;
    font-size: 16px;
    font-family: 'Kanit', sans-serif;
    outline: none;
    margin: 0 24px 16px;
    &::placeholder {
        color: #B8ADD2;
    }
    &:focus {
        border-color: #1FC7D4;
    }
`;

const NetworkSection = styled.div`
    padding: 0 24px 16px;
`;

const NetworkLabel = styled.div`
    color: #F4EEFF;
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 8px;
    font-family: 'Kanit', sans-serif;
`;

const NetworkChips = styled.div`
    display: flex;
    gap: 8px;
`;

const NetworkChip = styled.div<{ active?: boolean }>`
    padding: 6px 12px;
    background: ${props => props.active ? '#7645D9' : 'transparent'};
    border: 1px solid ${props => props.active ? '#7645D9' : '#383241'};
    border-radius: 20px;
    color: ${props => props.active ? '#F4EEFF' : '#B8ADD2'};
    font-size: 12px;
    font-weight: 600;
    font-family: 'Kanit', sans-serif;
`;

const PopularSection = styled.div`
    padding: 0 24px 16px;
`;

const PopularLabel = styled.div`
    color: #F4EEFF;
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 8px;
    font-family: 'Kanit', sans-serif;
`;

const PopularChips = styled.div`
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
`;

const PopularChip = styled.button`
    padding: 6px 12px;
    background: transparent;
    border: 1px solid #383241;
    border-radius: 20px;
    color: #B8ADD2;
    font-size: 12px;
    font-weight: 600;
    font-family: 'Kanit', sans-serif;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 6px;
    &:hover {
        border-color: #7645D9;
        color: #F4EEFF;
    }
    img {
        width: 16px;
        height: 16px;
        border-radius: 50%;
    }
`;

const TokenList = styled.div`
    flex: 1;
    overflow-y: auto;
    padding: 0 12px 12px;
`;

const TokenItem = styled.button`
    width: 100%;
    padding: 12px 16px;
    background: transparent;
    border: none;
    border-radius: 12px;
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: 'Kanit', sans-serif;
    position: relative;
    &:hover {
        background: #372F47;
    }
    img {
        width: 32px;
        height: 32px;
        border-radius: 50%;
    }
`;

const TokenInfo = styled.div`
    flex: 1;
    text-align: left;
`;

const TokenSymbol = styled.div`
    color: #F4EEFF;
    font-size: 16px;
    font-weight: 600;
`;

const TokenName = styled.div`
    color: #B8ADD2;
    font-size: 12px;
`;

const TokenBalance = styled.div`
    text-align: right;
    color: #F4EEFF;
    font-size: 14px;
    font-weight: 600;
`;

const TokenBalanceUSD = styled.div`
    text-align: right;
    color: #B8ADD2;
    font-size: 12px;
    margin-top: 2px;
`;

const BSCBadge = styled.div`
    position: absolute;
    bottom: 8px;
    right: 8px;
    width: 16px;
    height: 16px;
    background: #F3BA2F;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 8px;
    font-weight: bold;
    color: #000;
`;

const FuturisticLoader = styled.div<{ show: boolean }>`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%);
    display: ${props => props.show ? 'flex' : 'none'};
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    backdrop-filter: blur(10px);
    animation: ${props => props.show ? 'fadeIn 0.3s ease-in-out' : 'none'};
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`;

const LoadingRing = styled.div`
    width: 120px;
    height: 120px;
    border: 3px solid transparent;
    border-top: 3px solid #1FC7D4;
    border-right: 3px solid #7645D9;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    position: relative;
    
    &::before {
        content: '';
        position: absolute;
        top: -6px;
        left: -6px;
        right: -6px;
        bottom: -6px;
        border: 2px solid transparent;
        border-top: 2px solid #1FC7D4;
        border-radius: 50%;
        animation: spin 1.2s linear infinite reverse;
        opacity: 0.7;
    }
    
    &::after {
        content: '';
        position: absolute;
        top: -12px;
        left: -12px;
        right: -12px;
        bottom: -12px;
        border: 1px solid transparent;
        border-top: 1px solid #7645D9;
        border-radius: 50%;
        animation: spin 1.6s linear infinite;
        opacity: 0.5;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

const LoadingParticles = styled.div`
    position: absolute;
    width: 100%;
    height: 100%;
    overflow: hidden;
    
    &::before, &::after {
        content: '';
        position: absolute;
        width: 4px;
        height: 4px;
        background: #1FC7D4;
        border-radius: 50%;
        animation: float 2s ease-in-out infinite;
    }
    
    &::before {
        top: 20%;
        left: 20%;
        animation-delay: 0s;
    }
    
    &::after {
        top: 60%;
        right: 20%;
        animation-delay: 1s;
    }
    
    @keyframes float {
        0%, 100% { transform: translateY(0px) scale(1); opacity: 0.8; }
        50% { transform: translateY(-20px) scale(1.2); opacity: 1; }
    }
`;

const LoadingText = styled.div`
    color: #1FC7D4;
    font-size: 18px;
    font-weight: 700;
    font-family: 'Kanit', sans-serif;
    margin-top: 30px;
    text-align: center;
    animation: pulse 1.5s ease-in-out infinite;
    
    @keyframes pulse {
        0%, 100% { opacity: 0.8; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.05); }
    }
`;

const LoadingSubtext = styled.div`
    color: #B8ADD2;
    font-size: 14px;
    font-family: 'Kanit', sans-serif;
    margin-top: 8px;
    text-align: center;
    opacity: 0.8;
`;

// ==================== MAIN COMPONENT ====================
export default function SwapPage() {
    const [web3, setWeb3] = useState<Web3 | null>(null);
    const [account, setAccount] = useState<string>('');
    const [contract, setContract] = useState<any>(null);
    
    const [fromToken, setFromToken] = useState(TOKEN_LIST[1]); // BNB
    const [toToken, setToToken] = useState(TOKEN_LIST[0]); // PAYU
    const [fromAmount, setFromAmount] = useState<string>('');
    const [toAmount, setToAmount] = useState<string>('');
    const [fromBalance, setFromBalance] = useState<string>('0');
    
    const [loading, setLoading] = useState<boolean>(false);
    const [showFuturisticLoader, setShowFuturisticLoader] = useState<boolean>(false);
    const [slippage, setSlippage] = useState<number>(0.5);
    const [mevProtect, setMevProtect] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');
    const [showTokenModal, setShowTokenModal] = useState<boolean>(false);
    const [selectingToken, setSelectingToken] = useState<'from' | 'to'>('from');
    const [tokenPrices, setTokenPrices] = useState<{[key: string]: number}>({});
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [tokenBalances, setTokenBalances] = useState<{[key: string]: string}>({});
    
    // Gerçek zamanlı token fiyatları
    const [realTimePrices, setRealTimePrices] = useState<{[key: string]: number}>({});
    
    // PancakeSwap API'den gerçek fiyatları al
    const fetchRealTimePrices = useCallback(async () => {
        try {
            // CoinGecko API'den BNB fiyatını al (daha güvenilir)
            const bnbResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd');
            const bnbData = await bnbResponse.json();
            const bnbPrice = bnbData.binancecoin.usd;
            
            // CAKE fiyatını al
            const cakeResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=pancakeswap-token&vs_currencies=usd');
            const cakeData = await cakeResponse.json();
            const cakePrice = cakeData['pancakeswap-token'].usd;
            
            // PAYU için PancakeSwap API'yi kullan (BSC'deki token)
            let payuPriceInUSD = 0.000000001; // çok düşük fallback (1 PAYU = $0.000000001)
            try {
                const payuResponse = await fetch('https://api.pancakeswap.info/api/v2/tokens/0x9AeB2E6DD8d55E14292ACFCFC4077e33106e4144');
                const payuData = await payuResponse.json();
                const payuPriceInBNB = parseFloat(payuData.data.price);
                payuPriceInUSD = payuPriceInBNB * bnbPrice;
                
                // PAYU fiyatı çok yüksekse fallback kullan
                if (payuPriceInUSD > 0.00001) {
                    console.log('PAYU price too high, using fallback');
                    payuPriceInUSD = 0.000000001;
                }
            } catch (payuError) {
                console.log('PAYU price fallback used');
            }
            
            setRealTimePrices({
                'BNB': bnbPrice,
                'CAKE': cakePrice,
                'USDT': 1,
                'BUSD': 1,
                'USDC': 1,
                'BTCB': 65000,
                'ETH': 3500,
                'PAYU': payuPriceInUSD,
                'CUSTOM': 0.0001, // Custom token için varsayılan fiyat
                'ADA': 0.45,
                'DOGE': 0.08,
                'MATIC': 0.85,
                'AVAX': 35,
                'SOL': 180,
                'SHIB': 0.000025,
                'PEPE': 0.000001
            });
            
            console.log('Updated prices:', {
                'BNB': bnbPrice,
                'CAKE': cakePrice,
                'PAYU': payuPriceInUSD
            });
        } catch (error) {
            console.error('Error fetching prices:', error);
            // Fallback fiyatlar
            setRealTimePrices({
                'BNB': 600,
                'CAKE': 2.5,
                'USDT': 1,
                'BUSD': 1,
                'USDC': 1,
                'BTCB': 65000,
                'ETH': 3500,
                'PAYU': 0.000000001,
                'CUSTOM': 0.0001,
                'ADA': 0.45,
                'DOGE': 0.08,
                'MATIC': 0.85,
                'AVAX': 35,
                'SOL': 180,
                'SHIB': 0.000025,
                'PEPE': 0.000001
            });
        }
    }, []);

    const getTokenPrice = (symbol: string): number => {
        return realTimePrices[symbol] || 1;
    };

    // Connect wallet
    const connectWallet = async () => {
        if (typeof window.ethereum === 'undefined') {
            alert('Please install MetaMask!');
            return;
        }

        try {
            const web3Instance = new Web3(window.ethereum);
            await window.ethereum.request({ method: 'eth_requestAccounts' });

            const accounts = await web3Instance.eth.getAccounts();
            const chainId = await web3Instance.eth.getChainId();

            if (chainId !== 56n) {
                alert('Please switch to BSC Mainnet!');
                return;
            }

            const contractInstance = new web3Instance.eth.Contract(PAYPAYU_ABI, PAYPAYU_ROUTER);

            setWeb3(web3Instance);
            setAccount(accounts[0]);
            setContract(contractInstance);
        } catch (error: any) {
            setError('Failed to connect: ' + error.message);
        }
    };

    // Get balance
    const updateBalance = useCallback(async () => {
        if (!web3 || !account) return;

        try {
            if (fromToken.symbol === 'BNB') {
                const balance = await web3.eth.getBalance(account);
                setFromBalance(web3.utils.fromWei(balance, 'ether'));
            } else {
                const tokenContract = new web3.eth.Contract(ERC20_ABI, fromToken.address);
                const balance = await tokenContract.methods.balanceOf(account).call();
                setFromBalance(web3.utils.fromWei(String(balance), 'ether'));
            }
        } catch (error) {
            setFromBalance('0');
        }
    }, [web3, account, fromToken]);

    // Get all token balances
    const updateAllTokenBalances = useCallback(async () => {
        if (!web3 || !account) return;

        const balances: {[key: string]: string} = {};
        
        try {
            for (const token of TOKEN_LIST) {
                if (token.symbol === 'BNB') {
                    const balance = await web3.eth.getBalance(account);
                    balances[token.symbol] = web3.utils.fromWei(balance, 'ether');
                } else {
                    try {
                        const tokenContract = new web3.eth.Contract(ERC20_ABI, token.address);
                        const balance = await tokenContract.methods.balanceOf(account).call();
                        balances[token.symbol] = web3.utils.fromWei(String(balance), 'ether');
                    } catch (error) {
                        balances[token.symbol] = '0';
                    }
                }
            }
            setTokenBalances(balances);
        } catch (error) {
            console.error('Error updating token balances:', error);
        }
    }, [web3, account]);

    // Get quote
    const getQuote = useCallback(async () => {
        if (!contract || !fromAmount || !web3) return;

        try {
            let path: string[];
            if (fromToken.symbol === 'BNB') {
                path = [WBNB, toToken.address];
            } else if (toToken.symbol === 'BNB') {
                path = [fromToken.address, WBNB];
            } else {
                path = [fromToken.address, WBNB, toToken.address];
            }

            const amountIn = web3.utils.toWei(fromAmount, 'ether');
            const amounts = await contract.methods.getAmountsOut(amountIn, path).call();
            const output = web3.utils.fromWei((amounts as string[])[amounts.length - 1], 'ether');
            setToAmount(parseFloat(output).toFixed(6));
        } catch (error) {
            setToAmount('0');
        }
    }, [contract, fromAmount, web3, fromToken, toToken]);

    useEffect(() => {
        if (account) {
            updateBalance();
            updateAllTokenBalances();
        }
    }, [account, fromToken, updateBalance, updateAllTokenBalances]);

    // Sayfa yüklendiğinde fiyatları al
    useEffect(() => {
        fetchRealTimePrices();
        // Her 30 saniyede bir fiyatları güncelle
        const interval = setInterval(fetchRealTimePrices, 30000);
        return () => clearInterval(interval);
    }, [fetchRealTimePrices]);

    useEffect(() => {
        if (fromAmount && contract) {
            const debounce = setTimeout(getQuote, 500);
            return () => clearTimeout(debounce);
        } else {
            setToAmount('');
        }
    }, [fromAmount, contract, getQuote]);

    // Execute swap
    const executeSwap = async () => {
        if (!fromAmount || !toAmount || !contract || !web3 || !account) {
            setError('Please enter valid amounts');
            return;
        }

        setLoading(true);
        setShowFuturisticLoader(true);
        setError('');
        setSuccess('');

        try {
            const amountIn = web3.utils.toWei(fromAmount, 'ether');
            const expectedOutput = web3.utils.toWei(toAmount, 'ether');
            const minOutput = (BigInt(expectedOutput) * BigInt(Math.floor((100 - slippage) * 100)) / BigInt(10000)).toString();
            const deadline = Math.floor(Date.now() / 1000) + 1200;
            
            if (fromToken.symbol === 'BNB') {
                // BNB → Token
                const totalValue = (parseFloat(fromAmount) + parseFloat(PLATFORM_FEE)).toString();
                const totalValueWei = web3.utils.toWei(totalValue, 'ether');

                await contract.methods.swapExactBNBForTokens(
                    toToken.address,
                    minOutput,
                    deadline
                ).send({
                    from: account,
                    value: totalValueWei
                });
                
            } else if (toToken.symbol === 'BNB') {
                // Token → BNB
                const tokenContract = new web3.eth.Contract(ERC20_ABI, fromToken.address);
                const allowance = await tokenContract.methods.allowance(account, PAYPAYU_ROUTER).call();

                if (BigInt(String(allowance)) < BigInt(amountIn)) {
                    setSuccess('Approving token...');
                    await tokenContract.methods.approve(
                        PAYPAYU_ROUTER,
                        '115792089237316195423570985008687907853269984665640564039457584007913129639935'
                    ).send({ from: account });
                }

                setSuccess('Swapping...');
                const feeWei = web3.utils.toWei(PLATFORM_FEE, 'ether');

                await contract.methods.swapExactTokensForBNB(
                    fromToken.address,
                    amountIn,
                    minOutput,
                    deadline
                ).send({
                    from: account,
                    value: feeWei
                });
                
            } else {
                // Token → Token
                const tokenContract = new web3.eth.Contract(ERC20_ABI, fromToken.address);
                const allowance = await tokenContract.methods.allowance(account, PAYPAYU_ROUTER).call();

                if (BigInt(String(allowance)) < BigInt(amountIn)) {
                    setSuccess('Approving token...');
                    await tokenContract.methods.approve(
                        PAYPAYU_ROUTER,
                        '115792089237316195423570985008687907853269984665640564039457584007913129639935'
                    ).send({ from: account });
                }

                setSuccess('Swapping...');
                const feeWei = web3.utils.toWei(PLATFORM_FEE, 'ether');

                await contract.methods.swapExactTokensForTokens(
                    fromToken.address,
                    toToken.address,
                    amountIn,
                    minOutput,
                    deadline
                ).send({
                    from: account,
                    value: feeWei
                });
            }

            setSuccess('Swap successful!');
            setFromAmount('');
            setToAmount('');
            
            setTimeout(() => updateBalance(), 3000);

        } catch (error: any) {
            console.error('Swap error:', error);
            if (error.message.includes('User denied')) {
                setError('Transaction rejected by user');
            } else {
                setError('Swap failed: ' + error.message);
            }
        } finally {
            setLoading(false);
            // Hızlı animasyon için kısa bir gecikme
            setTimeout(() => {
                setShowFuturisticLoader(false);
            }, 1000);
        }
    };

    const handleSwitch = () => {
        const temp = fromToken;
        setFromToken(toToken);
        setToToken(temp);
        setFromAmount(toAmount);
        setToAmount('');
    };

    const handleTokenSelect = (token: typeof TOKEN_LIST[0]) => {
        if (selectingToken === 'from') {
            if (token.symbol === toToken.symbol) {
                setToToken(fromToken);
            }
            setFromToken(token);
        } else {
            if (token.symbol === fromToken.symbol) {
                setFromToken(toToken);
            }
            setToToken(token);
        }
        setShowTokenModal(false);
        setFromAmount('');
        setToAmount('');
    };

    const openTokenModal = (type: 'from' | 'to') => {
        setSelectingToken(type);
        setSearchQuery('');
        setShowTokenModal(true);
    };

    const setPercentageAmount = (percentage: number) => {
        const balance = parseFloat(fromBalance);
        if (balance > 0) {
            const amount = (balance * percentage / 100 * 0.99).toFixed(6);
            setFromAmount(amount);
        }
    };

        return (
        <>
            <FuturisticLoader show={showFuturisticLoader}>
                <LoadingRing>
                    <LoadingParticles />
                </LoadingRing>
                <LoadingText>Processing Swap</LoadingText>
                <LoadingSubtext>Executing transaction...</LoadingSubtext>
            </FuturisticLoader>
            
            <Container>
                <SwapCard>
                <SwapHeader>
                    <SwapTitle>Swap</SwapTitle>
                </SwapHeader>

                {!account ? (
                    <WalletButton onClick={connectWallet}>
                        Connect Wallet
                    </WalletButton>
                ) : (
                    <>
                        <ConnectedWallet>
                            🟠 {account.slice(0, 6)}...{account.slice(-4)}
                            <span>Balance: {parseFloat(fromBalance).toFixed(4)} {fromToken.symbol}</span>
                        </ConnectedWallet>

                <TokenBox>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <span style={{ color: '#B8ADD2', fontSize: '14px', fontFamily: 'Kanit' }}>From</span>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                        style={{ 
                                            background: 'none', 
                                            border: 'none', 
                                            color: '#1FC7D4', 
                                            cursor: 'pointer', 
                                            fontSize: '14px',
                                            fontFamily: 'Kanit',
                                            fontWeight: '600'
                                        }}
                                        onClick={() => setPercentageAmount(25)}
                                    >
                                        25%
                                    </button>
                                    <button
                                        style={{ 
                                            background: 'none', 
                                            border: 'none', 
                                            color: '#1FC7D4', 
                                            cursor: 'pointer', 
                                            fontSize: '14px',
                                            fontFamily: 'Kanit',
                                            fontWeight: '600'
                                        }}
                                        onClick={() => setPercentageAmount(50)}
                                    >
                                        50%
                                    </button>
                                <button
                                        style={{ 
                                            background: 'none', 
                                            border: 'none', 
                                            color: '#1FC7D4', 
                                            cursor: 'pointer', 
                                            fontSize: '14px',
                                            fontFamily: 'Kanit',
                                            fontWeight: '600'
                                        }}
                                        onClick={() => setPercentageAmount(100)}
                                >
                                    MAX
                                </button>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <TokenInput
                                type="number"
                                placeholder="0.00"
                                        value={fromAmount}
                                        onChange={(e) => setFromAmount(e.target.value)}
                                    />
                                <TokenSelectButton onClick={() => openTokenModal('from')}>
                                    <img src={fromToken.logo} alt={fromToken.symbol} />
                                    <span>{fromToken.symbol}</span>
                                    <span style={{ marginLeft: '4px' }}>▼</span>
                                </TokenSelectButton>
                            </div>
                            {fromAmount && parseFloat(fromAmount) > 0 && (
                                <div style={{ 
                                    marginTop: '8px', 
                                    color: '#B8ADD2', 
                                    fontSize: '12px',
                                    fontFamily: 'Kanit'
                                }}>
                                    ~${(parseFloat(fromAmount) * getTokenPrice(fromToken.symbol)).toFixed(2)} USD
                                </div>
                            )}
                </TokenBox>

                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <ArrowButton onClick={handleSwitch}>⇅</ArrowButton>
                        </div>

                <TokenBox>
                            <div style={{ marginBottom: '12px' }}>
                                <span style={{ color: '#B8ADD2', fontSize: '14px', fontFamily: 'Kanit' }}>To</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <TokenInput
                                        type="number"
                                        placeholder="0.00"
                                        value={toAmount}
                                        disabled
                                    />
                                <TokenSelectButton onClick={() => openTokenModal('to')}>
                                    <img src={toToken.logo} alt={toToken.symbol} />
                                    <span>{toToken.symbol}</span>
                                    <span style={{ marginLeft: '4px' }}>▼</span>
                                </TokenSelectButton>
                            </div>
                            {toAmount && parseFloat(toAmount) > 0 && (
                                <div style={{ 
                                    marginTop: '8px', 
                                    color: '#B8ADD2', 
                                    fontSize: '12px',
                                    fontFamily: 'Kanit'
                                }}>
                                    ~${(parseFloat(toAmount) * getTokenPrice(toToken.symbol)).toFixed(2)} USD
                                </div>
                            )}
                </TokenBox>

                        {/* Controls Panel */}
                {fromAmount && toAmount && (
                            <>
                                <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center',
                                    marginTop: '16px',
                                    marginBottom: '12px'
                                }}>
                                    <span style={{ color: '#B8ADD2', fontSize: '14px', fontFamily: 'Kanit' }}>Slippage Tolerance</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <button
                                            style={{
                                                background: slippage === 0.1 ? '#1FC7D4' : 'transparent',
                                                color: slippage === 0.1 ? '#27262C' : '#1FC7D4',
                                                border: '1px solid #1FC7D4',
                                                borderRadius: '9999px',
                                                padding: '4px 12px',
                                                fontSize: '12px',
                                                fontFamily: 'Kanit',
                                                fontWeight: '600',
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => setSlippage(0.1)}
                                        >
                                            0.1%
                                        </button>
                                        <button
                                            style={{
                                                background: slippage === 0.5 ? '#1FC7D4' : 'transparent',
                                                color: slippage === 0.5 ? '#27262C' : '#1FC7D4',
                                                border: '1px solid #1FC7D4',
                                                borderRadius: '9999px',
                                                padding: '4px 12px',
                                                fontSize: '12px',
                                                fontFamily: 'Kanit',
                                                fontWeight: '600',
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => setSlippage(0.5)}
                                        >
                                            0.5%
                                        </button>
                                        <button
                                            style={{
                                                background: slippage === 1 ? '#1FC7D4' : 'transparent',
                                                color: slippage === 1 ? '#27262C' : '#1FC7D4',
                                                border: '1px solid #1FC7D4',
                                                borderRadius: '9999px',
                                                padding: '4px 12px',
                                                fontSize: '12px',
                                                fontFamily: 'Kanit',
                                                fontWeight: '600',
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => setSlippage(1)}
                                        >
                                            1%
                                        </button>
                                    </div>
                                </div>

                                <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center',
                                    marginBottom: '16px'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ color: '#F4EEFF', fontSize: '16px' }}>🛡️</span>
                                        <span style={{ color: '#F4EEFF', fontSize: '14px', fontFamily: 'Kanit' }}>Enable MEV Protect</span>
                                    </div>
                                    <button
                                        style={{
                                            width: '44px',
                                            height: '24px',
                                            background: mevProtect ? '#1FC7D4' : '#666171',
                                            border: 'none',
                                            borderRadius: '9999px',
                                            position: 'relative',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onClick={() => setMevProtect(!mevProtect)}
                                    >
                                        <div
                                            style={{
                                                width: '20px',
                                                height: '20px',
                                                background: 'white',
                                                borderRadius: '50%',
                                                position: 'absolute',
                                                top: '2px',
                                                left: mevProtect ? '22px' : '2px',
                                                transition: 'all 0.2s ease'
                                            }}
                                        />
                                    </button>
                                </div>
                            </>
                        )}

                        <SwapButton onClick={executeSwap} disabled={!fromAmount || !toAmount || loading}>
                            {loading ? 'Swapping...' : 'Swap'}
                        </SwapButton>


                        {error && <ErrorText>{error}</ErrorText>}
                        {success && <SuccessText>{success}</SuccessText>}
                    </>
                )}
            </SwapCard>

            {/* Token Selection Modal */}
            {showTokenModal && (
                <ModalOverlay onClick={() => setShowTokenModal(false)}>
                    <ModalContent onClick={(e) => e.stopPropagation()}>
                        <ModalHeader>
                            <ModalTitle>{selectingToken === 'from' ? 'From' : 'To'}</ModalTitle>
                            <HeaderButtons>
                                <CloseButton onClick={() => setShowTokenModal(false)}>×</CloseButton>
                            </HeaderButtons>
                        </ModalHeader>
                        
                        <SearchInput
                            type="text"
                            placeholder="Search name / address"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        
                        <NetworkSection>
                            <NetworkLabel>Network: BNB Chain</NetworkLabel>
                            <NetworkChips>
                                <NetworkChip active>BNB Chain</NetworkChip>
                            </NetworkChips>
                        </NetworkSection>
                        
                        <PopularSection>
                            <PopularLabel>Popular tokens</PopularLabel>
                            <PopularChips>
                                <PopularChip onClick={() => handleTokenSelect(TOKEN_LIST.find(t => t.symbol === 'BNB')!)}>
                                    <img src={TOKEN_LIST.find(t => t.symbol === 'BNB')!.logo} alt="BNB" />
                                    BNB
                                </PopularChip>
                                <PopularChip onClick={() => handleTokenSelect(TOKEN_LIST.find(t => t.symbol === 'USDT')!)}>
                                    <img src={TOKEN_LIST.find(t => t.symbol === 'USDT')!.logo} alt="USDT" />
                                    USDT
                                </PopularChip>
                                <PopularChip onClick={() => handleTokenSelect(TOKEN_LIST.find(t => t.symbol === 'CAKE')!)}>
                                    <img src={TOKEN_LIST.find(t => t.symbol === 'CAKE')!.logo} alt="CAKE" />
                                    CAKE
                                </PopularChip>
                                <PopularChip onClick={() => handleTokenSelect(TOKEN_LIST.find(t => t.symbol === 'BTCB')!)}>
                                    <img src={TOKEN_LIST.find(t => t.symbol === 'BTCB')!.logo} alt="BTCB" />
                                    BTCB
                                </PopularChip>
                            </PopularChips>
                        </PopularSection>
                        
                        <TokenList>
                            {(() => {
                                const filteredTokens = TOKEN_LIST.filter(token => {
                                    const query = searchQuery.toLowerCase().trim();
                                    if (!query) return true;
                                    
                                    // Symbol arama (tam eşleşme öncelikli)
                                    if (token.symbol.toLowerCase() === query) return true;
                                    if (token.symbol.toLowerCase().includes(query)) return true;
                                    
                                    // Name arama
                                    if (token.name.toLowerCase().includes(query)) return true;
                                    
                                    // Address arama (tam veya kısmi)
                                    if (token.address.toLowerCase().includes(query)) return true;
                                    
                                    // Kelime bazlı arama (name içinde)
                                    const nameWords = token.name.toLowerCase().split(' ');
                                    const queryWords = query.split(' ');
                                    if (queryWords.every(word => nameWords.some(nameWord => nameWord.includes(word)))) return true;
                                    
                                    return false;
                                });
                                
                                // Sonuçları öncelik sırasına göre sırala
                                filteredTokens.sort((a, b) => {
                                    const query = searchQuery.toLowerCase().trim();
                                    
                                    // Tam symbol eşleşmesi en üstte
                                    if (a.symbol.toLowerCase() === query && b.symbol.toLowerCase() !== query) return -1;
                                    if (b.symbol.toLowerCase() === query && a.symbol.toLowerCase() !== query) return 1;
                                    
                                    // Symbol başlangıcı eşleşmesi
                                    if (a.symbol.toLowerCase().startsWith(query) && !b.symbol.toLowerCase().startsWith(query)) return -1;
                                    if (b.symbol.toLowerCase().startsWith(query) && !a.symbol.toLowerCase().startsWith(query)) return 1;
                                    
                                    // Name başlangıcı eşleşmesi
                                    if (a.name.toLowerCase().startsWith(query) && !b.name.toLowerCase().startsWith(query)) return -1;
                                    if (b.name.toLowerCase().startsWith(query) && !a.name.toLowerCase().startsWith(query)) return 1;
                                    
                                    return 0;
                                });
                                
                                if (filteredTokens.length === 0 && searchQuery) {
                                    return (
                                        <div style={{
                                            padding: '20px',
                                            textAlign: 'center',
                                            color: '#B8ADD2',
                                            fontFamily: 'Kanit'
                                        }}>
                                            <div style={{ fontSize: '16px', marginBottom: '8px' }}>No tokens found</div>
                                            <div style={{ fontSize: '12px' }}>Try searching by symbol, name, or contract address</div>
                                        </div>
                                    );
                                }
                                
                                return filteredTokens.map((token) => {
                                    const balance = tokenBalances[token.symbol] || '0';
                                    const balanceNum = parseFloat(balance);
                                    const price = getTokenPrice(token.symbol);
                                    const usdValue = balanceNum * price;
                                    
                                    return (
                                        <TokenItem key={token.address} onClick={() => handleTokenSelect(token)}>
                                            <img src={token.logo} alt={token.symbol} />
                                            <TokenInfo>
                                                <TokenSymbol>{token.symbol}</TokenSymbol>
                                                <TokenName>{token.name}</TokenName>
                                            </TokenInfo>
                                            <div>
                                                <TokenBalance>
                                                    {balanceNum > 0 ? balanceNum.toFixed(6) : '0'}
                                                </TokenBalance>
                                                {balanceNum > 0 && (
                                                    <TokenBalanceUSD>
                                                        ${usdValue.toFixed(2)}
                                                    </TokenBalanceUSD>
                                                )}
                                            </div>
                                            <BSCBadge>B</BSCBadge>
                                        </TokenItem>
                                    );
                                });
                            })()}
                        </TokenList>
                    </ModalContent>
                </ModalOverlay>
            )}
            </Container>
        </>
    );
}