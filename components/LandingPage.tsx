'use client';

import React, { useState } from 'react';
import styled from 'styled-components';

interface LandingPageProps {
  onConnectWallet: () => void;
  onGoToSwap: () => void;
}

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
`;

const BackgroundStars = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(2px 2px at 20px 30px, #ffd700, transparent),
    radial-gradient(2px 2px at 40px 70px, #ffd700, transparent),
    radial-gradient(1px 1px at 90px 40px, #ffd700, transparent),
    radial-gradient(1px 1px at 130px 80px, #ffd700, transparent),
    radial-gradient(2px 2px at 160px 30px, #ffd700, transparent);
  background-repeat: repeat;
  background-size: 200px 100px;
  animation: twinkle 3s ease-in-out infinite alternate;
  
  @keyframes twinkle {
    0% { opacity: 0.3; }
    100% { opacity: 1; }
  }
`;

const MainContent = styled.div`
  max-width: 1200px;
  width: 100%;
  padding: 40px 20px;
  text-align: center;
  position: relative;
  z-index: 2;
  
  @media (max-width: 768px) {
    padding: 20px 15px;
  }
  
  @media (max-width: 480px) {
    padding: 15px 10px;
  }
`;

const GiveawayLogo = styled.div`
  width: 1024px;
  height: 1024px;
  margin: 0 auto 30px;
  background-image: url('/images/giveaway-logo.png');
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  border-radius: 20px;
  position: relative;
  box-shadow: 
    0 0 50px rgba(255, 215, 0, 0.8),
    0 0 100px rgba(255, 215, 0, 0.4),
    inset 0 0 50px rgba(255, 215, 0, 0.2);
  border: 4px solid rgba(255, 215, 0, 0.6);
  animation: logoGlow 3s ease-in-out infinite alternate, logoFloat 4s ease-in-out infinite;
  overflow: hidden;
  
  @media (max-width: 1200px) {
    width: 90vw;
    height: 90vw;
    max-width: 800px;
    max-height: 800px;
  }
  
  @media (max-width: 768px) {
    width: 95vw;
    height: 95vw;
    max-width: 500px;
    max-height: 500px;
    margin: 0 auto 20px;
  }
  
  @media (max-width: 480px) {
    width: 90vw;
    height: 90vw;
    max-width: 350px;
    max-height: 350px;
    margin: 0 auto 15px;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, 
      rgba(255, 215, 0, 0.1) 0%, 
      transparent 25%, 
      transparent 75%, 
      rgba(255, 215, 0, 0.1) 100%);
    animation: shimmer 2s linear infinite;
    pointer-events: none;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: -15px;
    left: 50%;
    transform: translateX(-50%);
    width: 100px;
    height: 50px;
    background: linear-gradient(135deg, #333, #555);
    border-radius: 25px;
    box-shadow: 
      0 0 20px rgba(0, 0, 0, 0.8),
      0 0 40px rgba(255, 215, 0, 0.3);
    animation: tabPulse 2s ease-in-out infinite;
  }
  
  @keyframes logoGlow {
    0% { 
      box-shadow: 
        0 0 50px rgba(255, 215, 0, 0.8),
        0 0 100px rgba(255, 215, 0, 0.4),
        inset 0 0 50px rgba(255, 215, 0, 0.2);
    }
    100% { 
      box-shadow: 
        0 0 80px rgba(255, 215, 0, 1),
        0 0 150px rgba(255, 215, 0, 0.6),
        inset 0 0 80px rgba(255, 215, 0, 0.4);
    }
  }
  
  @keyframes logoFloat {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  
  @keyframes tabPulse {
    0%, 100% { 
      box-shadow: 
        0 0 20px rgba(0, 0, 0, 0.8),
        0 0 40px rgba(255, 215, 0, 0.3);
    }
    50% { 
      box-shadow: 
        0 0 30px rgba(0, 0, 0, 0.9),
        0 0 60px rgba(255, 215, 0, 0.5);
    }
  }
`;

const Title = styled.h1`
  font-size: 4rem;
  font-weight: 900;
  color: #ffd700;
  text-shadow: 0 0 30px rgba(255, 215, 0, 0.8);
  margin: 0 0 20px 0;
  letter-spacing: 3px;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: #ffffff;
  margin: 0 0 10px 0;
  font-weight: 400;
`;

const CoinAmount = styled.div`
  font-size: 2.5rem;
  font-weight: 900;
  color: #ffd700;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.8);
  margin: 0 0 50px 0;
  
  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
`;

const PrizesContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  margin: 50px 0;
  padding: 0 20px;
`;

const PrizeCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 30px 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  }
`;

const PrizeIcon = styled.div`
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  background: linear-gradient(135deg, #f0f0f0, #e0e0e0);
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
`;

const PrizeText = styled.p`
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin: 0;
  line-height: 1.4;
`;

const AdditionalInfo = styled.p`
  font-size: 1.1rem;
  color: #ffffff;
  margin: 40px 0;
  font-weight: 500;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 50px;
  width: 100%;
  max-width: 1000px;
  margin-left: auto;
  margin-right: auto;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 15px;
    padding: 0 20px;
    margin-top: 30px;
  }
  
  @media (max-width: 480px) {
    padding: 0 15px;
    gap: 12px;
    margin-top: 25px;
  }
`;

const ActionButton = styled.button`
  background: linear-gradient(135deg, #ff1493, #ff69b4);
  border: none;
  border-radius: 25px;
  padding: 20px 30px;
  color: white;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px rgba(255, 20, 147, 0.4);
  position: relative;
  overflow: hidden;
  flex: 1;
  min-width: 0;
  text-align: center;
  line-height: 1.3;
  
  @media (max-width: 768px) {
    padding: 18px 25px;
    font-size: 1rem;
    border-radius: 20px;
  }
  
  @media (max-width: 480px) {
    padding: 15px 20px;
    font-size: 0.95rem;
    border-radius: 18px;
  }
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 35px rgba(255, 20, 147, 0.6);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }
  
  &:hover::before {
    left: 100%;
  }
`;

const SwapButton = styled(ActionButton)`
  background: linear-gradient(135deg, #87CEEB, #4682B4);
  box-shadow: 0 8px 25px rgba(135, 206, 235, 0.4);
  
  &:hover {
    box-shadow: 0 15px 35px rgba(135, 206, 235, 0.6);
  }
`;

const CountdownSection = styled.div`
  margin-top: 60px;
  padding: 30px;
  background: rgba(255, 215, 0, 0.1);
  border-radius: 20px;
  border: 2px solid rgba(255, 215, 0, 0.3);
`;

const CountdownTitle = styled.h3`
  font-size: 2rem;
  font-weight: 800;
  color: #ff1493;
  margin: 0 0 15px 0;
  text-shadow: 0 0 20px rgba(255, 20, 147, 0.8);
`;

const CountdownText = styled.p`
  font-size: 1.5rem;
  font-weight: 600;
  color: #ffd700;
  margin: 0;
  text-shadow: 0 0 15px rgba(255, 215, 0, 0.8);
`;

const LoadingText = styled.div`
  color: white;
  font-size: 1rem;
  font-weight: 600;
  margin-top: 10px;
`;

const LandingPage: React.FC<LandingPageProps> = ({ onConnectWallet, onGoToSwap }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleConnectWallet = async () => {
    try {
      setIsLoading(true);
      await onConnectWallet();
      setTimeout(() => {
        onGoToSwap();
      }, 2000);
    } catch (error) {
      console.error('Wallet connection failed:', error);
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <BackgroundStars />
      <MainContent>
        <GiveawayLogo />
        
        <ButtonContainer>
          <ActionButton onClick={handleConnectWallet} disabled={isLoading}>
            JOIN THE GIVEAWAY
            <br />
            CONNECT WALLET
            {isLoading && <LoadingText>Loading...</LoadingText>}
          </ActionButton>
          
          <SwapButton onClick={() => window.open('https://pancakeswap.finance/swap?outputCurrency=0x9AeB2E6DD8d55E14292ACFCFC4077e33106e4144', '_blank')}>
            BUY NOW PAYU ON PANCAKESWAP
          </SwapButton>
        </ButtonContainer>
        
        <CountdownSection>
          <CountdownTitle>GIVEAWAY ENDS</CountdownTitle>
          <CountdownText>15 OCTOBER SATURDAY 23:59</CountdownText>
        </CountdownSection>
      </MainContent>
    </Container>
  );
};

export default LandingPage;