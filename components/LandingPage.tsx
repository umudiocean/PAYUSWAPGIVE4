'use client';

import React, { useState } from 'react';
import styled from 'styled-components';

interface LandingPageProps {
  onConnectWallet: () => void;
  onGoToSwap: () => void;
}

const Container = styled.div`
  min-height: 100vh;
  background: url('/images/giveaway-landing.png') center center/cover no-repeat;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 1;
`;

const Content = styled.div`
  position: relative;
  z-index: 2;
  text-align: center;
  color: white;
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
      <Overlay />
      <Content>
        {/* Görsel zaten arka planda, ekstra içerik gerekmez */}
      </Content>
    </Container>
  );
};

export default LandingPage;