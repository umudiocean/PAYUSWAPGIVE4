'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ClaimModal } from './ClaimModal';

interface PayuGiveSystemProps {
  userAddress: string | null;
  onSwapComplete?: () => void;
}

export const PayuGiveSystem: React.FC<PayuGiveSystemProps> = ({ userAddress, onSwapComplete }) => {
  const [swapCount, setSwapCount] = useState(0);
  const [tickets, setTickets] = useState(0);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load user data when address changes
  useEffect(() => {
    if (userAddress) {
      loadUserData();
    } else {
      setSwapCount(0);
      setTickets(0);
    }
  }, [userAddress]);

  const loadUserData = async () => {
    if (!userAddress) return;
    
    try {
      setLoading(true);
      
      // Fetch user swap and ticket data
      const response = await fetch(`/api/user-stats?address=${userAddress}`);
      
      if (response.ok) {
        const data = await response.json();
        setSwapCount(data.swapCount || 0);
        setTickets(data.tickets || 0);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const swapsUntilNextTicket = 3 - (swapCount % 3);
  const progress = ((swapCount % 3) / 3) * 100;

  const handleClaimSuccess = () => {
    setShowClaimModal(false);
    loadUserData(); // Reload data after claim
  };

  if (!userAddress) {
    return (
      <PayuGiveCard>
        <Title>🎁 PAYU GIVEAWAY</Title>
        <ConnectMessage>Connect your wallet to participate!</ConnectMessage>
      </PayuGiveCard>
    );
  }

  return (
    <>
      <PayuGiveCard>
        <Header>
          <Title>🎁 PAYU GIVEAWAY</Title>
          <Subtitle>Make 3 swaps, earn 1 ticket, claim 250M PAYU!</Subtitle>
        </Header>

        <StatsContainer>
          <StatBox>
            <StatLabel>Total Swaps</StatLabel>
            <StatValue>{swapCount}</StatValue>
          </StatBox>

          <StatBox highlighted>
            <StatLabel>Available Tickets</StatLabel>
            <StatValue>{tickets}</StatValue>
            <TicketIcon>🎟️</TicketIcon>
          </StatBox>

          <StatBox>
            <StatLabel>Next Ticket</StatLabel>
            <StatValue>{swapsUntilNextTicket} swaps</StatValue>
          </StatBox>
        </StatsContainer>

        <ProgressContainer>
          <ProgressLabel>Progress to next ticket:</ProgressLabel>
          <ProgressBar>
            <ProgressFill progress={progress} />
          </ProgressBar>
          <ProgressText>{swapCount % 3}/3 swaps</ProgressText>
        </ProgressContainer>

        <ButtonContainer>
          {tickets > 0 ? (
            <ClaimButton onClick={() => setShowClaimModal(true)}>
              🎁 Claim {tickets} Ticket{tickets > 1 ? 's' : ''} (250M PAYU each)
            </ClaimButton>
          ) : (
            <DisabledButton>
              No tickets available yet
            </DisabledButton>
          )}
        </ButtonContainer>

        <InfoBox>
          <InfoIcon>ℹ️</InfoIcon>
          <InfoText>
            Claim fee: 0.00030 BNB per ticket • Instant reward delivery
          </InfoText>
        </InfoBox>
      </PayuGiveCard>

      <ClaimModal
        isOpen={showClaimModal}
        onClose={() => setShowClaimModal(false)}
        userAddress={userAddress}
        tickets={tickets}
        onSuccess={handleClaimSuccess}
      />
    </>
  );
};

// Styled Components
const PayuGiveCard = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 24px;
  padding: 24px;
  margin-top: 24px;
  color: white;
  box-shadow: 0 20px 60px rgba(102, 126, 234, 0.4);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
    pointer-events: none;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 24px;
`;

const Title = styled.h2`
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
  text-shadow: 0 2px 10px rgba(0,0,0,0.2);
`;

const Subtitle = styled.p`
  font-size: 14px;
  margin: 0;
  opacity: 0.9;
`;

const ConnectMessage = styled.p`
  text-align: center;
  font-size: 16px;
  padding: 40px 20px;
  opacity: 0.9;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const StatBox = styled.div<{ highlighted?: boolean }>`
  background: ${props => props.highlighted 
    ? 'rgba(255, 255, 255, 0.25)' 
    : 'rgba(255, 255, 255, 0.15)'};
  border-radius: 16px;
  padding: 16px;
  text-align: center;
  position: relative;
  backdrop-filter: blur(10px);
  border: ${props => props.highlighted 
    ? '2px solid rgba(255, 255, 255, 0.4)' 
    : '1px solid rgba(255, 255, 255, 0.2)'};
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.2);
  }
`;

const StatLabel = styled.div`
  font-size: 12px;
  opacity: 0.8;
  margin-bottom: 8px;
  font-weight: 500;
`;

const StatValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  text-shadow: 0 2px 8px rgba(0,0,0,0.2);
`;

const TicketIcon = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 20px;
`;

const ProgressContainer = styled.div`
  margin-bottom: 24px;
`;

const ProgressLabel = styled.div`
  font-size: 13px;
  margin-bottom: 8px;
  opacity: 0.9;
  font-weight: 500;
`;

const ProgressBar = styled.div`
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  height: 12px;
  overflow: hidden;
  backdrop-filter: blur(10px);
`;

const ProgressFill = styled.div<{ progress: number }>`
  background: linear-gradient(90deg, #51cf66 0%, #40c057 100%);
  height: 100%;
  width: ${props => props.progress}%;
  transition: width 0.5s ease;
  box-shadow: 0 0 10px rgba(81, 207, 102, 0.5);
`;

const ProgressText = styled.div`
  font-size: 12px;
  margin-top: 6px;
  opacity: 0.8;
  text-align: right;
`;

const ButtonContainer = styled.div`
  margin-bottom: 16px;
`;

const ClaimButton = styled.button`
  background: linear-gradient(135deg, #51cf66 0%, #40c057 100%);
  color: white;
  padding: 16px 24px;
  border-radius: 16px;
  border: none;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  width: 100%;
  transition: all 0.3s ease;
  box-shadow: 0 8px 20px rgba(81, 207, 102, 0.3);

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 30px rgba(81, 207, 102, 0.4);
    background: linear-gradient(135deg, #40c057 0%, #37b24d 100%);
  }

  &:active {
    transform: translateY(-1px);
  }
`;

const DisabledButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);
  padding: 16px 24px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  font-weight: 600;
  font-size: 16px;
  cursor: not-allowed;
  width: 100%;
`;

const InfoBox = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  backdrop-filter: blur(10px);
`;

const InfoIcon = styled.span`
  font-size: 18px;
`;

const InfoText = styled.p`
  font-size: 13px;
  margin: 0;
  opacity: 0.9;
  line-height: 1.4;
`;

