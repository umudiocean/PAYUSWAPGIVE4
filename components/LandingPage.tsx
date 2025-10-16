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
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 20px;
  opacity: 0;
  transition: opacity 0.3s ease;
  
  ${Banner}:hover & {
    opacity: 1;
  }
`;

const ConnectButton = styled.button`
  background: linear-gradient(135deg, #ff1493, #ff69b4);
  border: none;
  border-radius: 12px;
  padding: 15px 30px;
  color: white;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 20px rgba(255, 20, 147, 0.4);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 30px rgba(255, 20, 147, 0.6);
  }
`;

const LoadingText = styled.div`
  color: white;
  font-size: 24px;
  font-weight: 600;
  margin-top: 20px;
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
          {isLoading ? (
            <LoadingText>Loading Giveaway...</LoadingText>
          ) : (
            <ConnectButton onClick={handleConnectWallet}>
              JOIN THE GIVEAWAY
            </ConnectButton>
          )}
        </InteractiveOverlay>
      </Banner>
    </Container>
  );
};

export default LandingPage;