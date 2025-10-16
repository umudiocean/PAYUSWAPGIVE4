'use client';

import React, { useState } from 'react';
import styled from 'styled-components';

interface LandingPageProps {
  onConnectWallet: () => void;
  onGoToSwap: () => void;
}

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  border: 2px solid #ff1493;
  border-radius: 20px;
  margin: 10px;
`;

const Banner = styled.div`
  width: 100%;
  max-width: 1200px;
  height: auto;
  margin: 20px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  position: relative;
  z-index: 2;
`;

const BannerImage = styled.img`
  width: 100%;
  height: auto;
  display: block;
  border-radius: 20px;
`;

const InteractiveOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 40px;
  pointer-events: none;
`;

const BottomSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  width: 100%;
  pointer-events: auto;
`;

const LeftButton = styled.button`
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
  box-shadow: 0 8px 20px rgba(255, 20, 147, 0.4);
  
  &:hover {
    background: linear-gradient(135deg, #444, #666);
    transform: scale(1.05);
    box-shadow: 0 12px 30px rgba(255, 20, 147, 0.6);
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

const RightSection = styled.div`
  text-align: center;
  color: white;
`;

const CountdownTitle = styled.h3`
  font-size: 24px;
  font-weight: 800;
  color: #ff1493;
  margin: 0 0 10px 0;
  text-shadow: 0 0 20px rgba(255, 20, 147, 0.8), 2px 2px 4px rgba(0, 0, 0, 0.8);
`;

const CountdownText = styled.p`
  font-size: 18px;
  font-weight: 600;
  color: #ffd700;
  margin: 0;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.8), 1px 1px 2px rgba(0, 0, 0, 0.8);
`;

const LoadingText = styled.div`
  color: white;
  font-size: 18px;
  font-weight: 600;
  margin-top: 10px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
`;

const LandingPage: React.FC<LandingPageProps> = ({ onConnectWallet, onGoToSwap }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleConnectWallet = async () => {
    try {
      setIsLoading(true);
      await onConnectWallet();
      // 2 saniye sonra swap sayfasına yönlendir
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
      <Banner>
        <BannerImage 
          src="/images/giveaway-landing.png" 
          alt="PayU Giveaway Banner"
          onLoad={() => console.log('Banner loaded successfully')}
          onError={() => console.log('Banner failed to load')}
        />
        <InteractiveOverlay>
          <BottomSection>
            <LeftButton onClick={handleConnectWallet} disabled={isLoading}>
              <span>JOIN THE GIVEAWAY</span>
              <span>CONNECT WALLET</span>
              {isLoading && <LoadingText>Loading...</LoadingText>}
            </LeftButton>

            <RightSection>
              <CountdownTitle>GIVEAWAY ENDS</CountdownTitle>
              <CountdownText>15 OCTOBER SATURDAY 23:59</CountdownText>
            </RightSection>
          </BottomSection>
        </InteractiveOverlay>
      </Banner>
    </Container>
  );
};

export default LandingPage;