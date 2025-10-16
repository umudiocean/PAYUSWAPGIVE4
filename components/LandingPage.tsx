'use client';

import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

interface LandingPageProps {
  onConnectWallet: () => void;
  onGoToSwap: () => void;
}

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(255, 20, 147, 0.7);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 0 20px rgba(255, 20, 147, 0);
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
`;

const sparkle = keyframes`
  0%, 100% {
    opacity: 0;
    transform: scale(0);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
`;

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  border: 2px solid #ff1493;
  border-radius: 20px;
  margin: 10px;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 20%, rgba(255, 215, 0, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(255, 20, 147, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 40% 60%, rgba(0, 255, 127, 0.1) 0%, transparent 50%);
    pointer-events: none;
  }
`;

const Spotlight = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  background: linear-gradient(180deg, 
    rgba(255, 215, 0, 0.3) 0%, 
    rgba(255, 215, 0, 0.1) 30%, 
    transparent 70%
  );
  pointer-events: none;
`;

const Sparkles = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  
  &::before,
  &::after {
    content: '';
    position: absolute;
    width: 4px;
    height: 4px;
    background: #ffd700;
    border-radius: 50%;
    animation: ${sparkle} 2s infinite;
  }
  
  &::before {
    top: 20%;
    left: 15%;
    animation-delay: 0s;
  }
  
  &::after {
    top: 60%;
    right: 20%;
    animation-delay: 1s;
  }
`;

const Content = styled.div`
  position: relative;
  z-index: 2;
  max-width: 1200px;
  width: 100%;
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: ${fadeIn} 1s ease-out;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

const PepeCharacter = styled.div`
  font-size: 120px;
  margin-bottom: 20px;
  animation: ${float} 3s ease-in-out infinite;
  filter: drop-shadow(0 0 20px rgba(0, 255, 127, 0.5));
`;

const MainTitle = styled.h1`
  font-size: 72px;
  font-weight: 900;
  color: #ffd700;
  margin: 0 0 10px 0;
  text-shadow: 0 0 30px rgba(255, 215, 0, 0.5);
  background: linear-gradient(45deg, #ffd700, #ffed4e);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: ${fadeIn} 1s ease-out 0.2s both;
`;

const Subtitle = styled.p`
  font-size: 24px;
  color: white;
  margin: 0 0 10px 0;
  font-weight: 300;
  animation: ${fadeIn} 1s ease-out 0.4s both;
`;

const AmountText = styled.h2`
  font-size: 48px;
  font-weight: 800;
  color: #ffd700;
  margin: 0;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
  animation: ${fadeIn} 1s ease-out 0.6s both;
`;

const PrizesSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin: 40px 0;
  width: 100%;
  max-width: 1000px;
  animation: ${fadeIn} 1s ease-out 0.8s both;
`;

const PrizeCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  animation: ${slideIn} 0.8s ease-out;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
  }
  
  img {
    width: 80px;
    height: 80px;
    object-fit: contain;
    margin-bottom: 15px;
  }
  
  p {
    font-size: 14px;
    color: #333;
    font-weight: 500;
    margin: 0;
    line-height: 1.4;
  }
`;

const BonusText = styled.div`
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  border-radius: 20px;
  padding: 20px;
  margin: 30px 0;
  text-align: center;
  color: #000;
  font-weight: 600;
  font-size: 18px;
  box-shadow: 0 8px 32px rgba(255, 215, 0, 0.3);
  animation: ${fadeIn} 1s ease-out 1s both;
`;

const ActionSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 800px;
  margin-top: 40px;
  animation: ${fadeIn} 1s ease-out 1.2s both;
`;

const ConnectButton = styled.button`
  background: linear-gradient(135deg, #333, #555);
  border: 2px solid #ff1493;
  border-radius: 16px;
  padding: 20px 30px;
  color: white;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  position: relative;
  animation: ${pulse} 2s infinite;
  
  &:hover {
    background: linear-gradient(135deg, #444, #666);
    transform: scale(1.05);
    box-shadow: 0 0 30px rgba(255, 20, 147, 0.5);
  }
  
  &::before {
    content: '';
    position: absolute;
    left: -8px;
    top: 50%;
    transform: translateY(-50%);
    width: 6px;
    height: 6px;
    background: #ff1493;
    border-radius: 50%;
    box-shadow: 0 0 10px rgba(255, 20, 147, 0.8);
  }
  
  &::after {
    content: '';
    position: absolute;
    left: -8px;
    bottom: 20px;
    width: 6px;
    height: 6px;
    background: #00ff7f;
    border-radius: 50%;
    box-shadow: 0 0 10px rgba(0, 255, 127, 0.8);
  }
`;

const CountdownSection = styled.div`
  text-align: center;
  color: white;
`;

const CountdownTitle = styled.h3`
  font-size: 32px;
  font-weight: 800;
  color: #ff1493;
  margin: 0 0 10px 0;
  text-shadow: 0 0 20px rgba(255, 20, 147, 0.5);
  animation: ${fadeIn} 1s ease-out 1.4s both;
`;

const CountdownText = styled.p`
  font-size: 18px;
  font-weight: 600;
  color: #ffd700;
  margin: 0;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
  animation: ${fadeIn} 1s ease-out 1.6s both;
`;

const LandingPage: React.FC<LandingPageProps> = ({ onConnectWallet, onGoToSwap }) => {
  const [isConnected, setIsConnected] = useState(false);

  const handleConnectWallet = async () => {
    try {
      await onConnectWallet();
      setIsConnected(true);
      // 2 saniye sonra swap sayfasına yönlendir
      setTimeout(() => {
        onGoToSwap();
      }, 2000);
    } catch (error) {
      console.error('Wallet connection failed:', error);
    }
  };

  return (
    <Container>
      <Spotlight />
      <Sparkles />
      <Content>
        <Header>
          <PepeCharacter>🐸</PepeCharacter>
          <MainTitle>GIVE AWAY</MainTitle>
          <Subtitle>We will be giving away a total of</Subtitle>
          <AmountText>2.5 Trillion Payu Coins</AmountText>
        </Header>

        <PrizesSection>
          <PrizeCard>
            <div style={{ fontSize: '60px', marginBottom: '15px' }}>📱</div>
            <p>1 lucky person will get an iPhone 17 (256gb)</p>
          </PrizeCard>
          
          <PrizeCard>
            <div style={{ fontSize: '60px', marginBottom: '15px' }}>🎮</div>
            <p>3 lucky people will get a Playstation 5</p>
          </PrizeCard>
          
          <PrizeCard>
            <div style={{ fontSize: '60px', marginBottom: '15px' }}>🎧</div>
            <p>5 lucky people will get 4 Airpods</p>
          </PrizeCard>
          
          <PrizeCard>
            <div style={{ fontSize: '60px', marginBottom: '15px' }}>🪙</div>
            <p>1000 lucky people will get 2 billion 500 million Payu Coins</p>
          </PrizeCard>
        </PrizesSection>

        <BonusText>
          Additionally, 250 million payu coins will be instantly sent to each participant.
        </BonusText>

        <ActionSection>
          <ConnectButton onClick={handleConnectWallet}>
            <span>JOIN THE GIVEAWAY</span>
            <span>CONNECT WALLET</span>
          </ConnectButton>

          <CountdownSection>
            <CountdownTitle>GIVEAWAY ENDS</CountdownTitle>
            <CountdownText>15 OCTOBER SATURDAY 23:59</CountdownText>
          </CountdownSection>
        </ActionSection>
      </Content>
    </Container>
  );
};

export default LandingPage;
