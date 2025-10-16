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
  const [ticketIds, setTicketIds] = useState<string[]>([]);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load user data when address changes
  useEffect(() => {
    if (userAddress) {
      loadUserData();
    } else {
      setSwapCount(0);
      setTickets(0);
      setTicketIds([]);
    }
  }, [userAddress]);

  // Listen for swap completion events
  useEffect(() => {
    const handleSwapCompleted = () => {
      if (userAddress) {
        loadUserData();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('swapCompleted', handleSwapCompleted);
      return () => window.removeEventListener('swapCompleted', handleSwapCompleted);
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
        setTicketIds(data.ticketIds || []);
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

        {ticketIds.length > 0 && (
          <TicketSection>
            <TicketTitle>Your Lucky Tickets:</TicketTitle>
            <TicketList>
              {ticketIds.map((ticketId, index) => (
                <TicketItem key={index}>
                  <TicketNumber>{ticketId}</TicketNumber>
                </TicketItem>
              ))}
            </TicketList>
          </TicketSection>
        )}

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
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
  border: 2px solid transparent;
  background-clip: padding-box;
  border-radius: 32px;
  padding: 32px;
  margin-top: 32px;
  color: white;
  box-shadow: 
    0 25px 80px rgba(0, 0, 0, 0.6),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(20px);
  animation: cardEntrance 0.8s ease-out;

  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg, #51cf66, #40c057, #37b24d, #51cf66);
    border-radius: 32px;
    z-index: -1;
    animation: borderGlow 3s ease-in-out infinite;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 30% 20%, rgba(81, 207, 102, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 70% 80%, rgba(64, 192, 87, 0.1) 0%, transparent 50%);
    pointer-events: none;
    animation: backgroundPulse 4s ease-in-out infinite;
  }

  @keyframes cardEntrance {
    0% {
      opacity: 0;
      transform: translateY(30px) scale(0.95);
    }
    100% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes borderGlow {
    0%, 100% {
      opacity: 0.3;
    }
    50% {
      opacity: 0.8;
    }
  }

  @keyframes backgroundPulse {
    0%, 100% {
      opacity: 0.3;
    }
    50% {
      opacity: 0.6;
    }
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 32px;
  position: relative;
`;

const Title = styled.h2`
  font-size: 36px;
  font-weight: 800;
  margin: 0 0 12px 0;
  background: linear-gradient(135deg, #51cf66 0%, #40c057 50%, #37b24d 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 4px 20px rgba(81, 207, 102, 0.3);
  animation: titleGlow 2s ease-in-out infinite alternate;
  
  @keyframes titleGlow {
    0% {
      filter: brightness(1);
    }
    100% {
      filter: brightness(1.2);
    }
  }
`;

const Subtitle = styled.p`
  font-size: 16px;
  margin: 0;
  opacity: 0.9;
  font-weight: 500;
  letter-spacing: 0.5px;
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
  gap: 20px;
  margin-bottom: 32px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const StatBox = styled.div<{ highlighted?: boolean }>`
  background: ${props => props.highlighted 
    ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' 
    : 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'};
  border-radius: 20px;
  padding: 24px 20px;
  text-align: center;
  position: relative;
  backdrop-filter: blur(15px);
  border: ${props => props.highlighted 
    ? '2px solid #51cf66' 
    : '1px solid #334155'};
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  animation: ${props => props.highlighted ? 'statBoxPulse 2s ease-in-out infinite' : 'none'};

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
    transition: left 0.5s;
  }

  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: ${props => props.highlighted 
      ? '0 20px 40px rgba(81, 207, 102, 0.3)' 
      : '0 15px 30px rgba(0,0,0,0.4)'};
    background: ${props => props.highlighted 
      ? 'linear-gradient(135deg, #334155 0%, #475569 100%)' 
      : 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'};
    
    &::before {
      left: 100%;
    }
  }

  @keyframes statBoxPulse {
    0%, 100% {
      box-shadow: 0 0 20px rgba(81, 207, 102, 0.3);
    }
    50% {
      box-shadow: 0 0 30px rgba(81, 207, 102, 0.6);
    }
  }
`;

const StatLabel = styled.div`
  font-size: 12px;
  opacity: 0.8;
  margin-bottom: 8px;
  font-weight: 500;
`;

const StatValue = styled.div`
  font-size: 32px;
  font-weight: 800;
  background: linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 4px 12px rgba(0,0,0,0.3);
  animation: valueGlow 1.5s ease-in-out infinite alternate;
  
  @keyframes valueGlow {
    0% {
      filter: brightness(1);
    }
    100% {
      filter: brightness(1.1);
    }
  }
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
  background: #334155;
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
  background: linear-gradient(135deg, #51cf66 0%, #40c057 50%, #37b24d 100%);
  color: white;
  padding: 20px 32px;
  border-radius: 20px;
  border: none;
  font-weight: 800;
  font-size: 18px;
  cursor: pointer;
  width: 100%;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 10px 30px rgba(81, 207, 102, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
  animation: buttonPulse 2s ease-in-out infinite;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.6s;
  }

  &:hover {
    transform: translateY(-5px) scale(1.02);
    box-shadow: 
      0 20px 50px rgba(81, 207, 102, 0.6),
      0 0 0 1px rgba(255, 255, 255, 0.2);
    background: linear-gradient(135deg, #40c057 0%, #37b24d 50%, #2f9e44 100%);
    
    &::before {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(-2px) scale(1.01);
  }

  @keyframes buttonPulse {
    0%, 100% {
      box-shadow: 
        0 10px 30px rgba(81, 207, 102, 0.4),
        0 0 0 1px rgba(255, 255, 255, 0.1);
    }
    50% {
      box-shadow: 
        0 15px 40px rgba(81, 207, 102, 0.6),
        0 0 0 1px rgba(255, 255, 255, 0.2);
    }
  }
`;

const DisabledButton = styled.button`
  background: #1e293b;
  color: #64748b;
  padding: 16px 24px;
  border-radius: 16px;
  border: 1px solid #334155;
  font-weight: 600;
  font-size: 16px;
  cursor: not-allowed;
  width: 100%;
`;

const InfoBox = styled.div`
  background: #1e293b;
  border: 1px solid #334155;
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

const TicketSection = styled.div`
  margin-bottom: 20px;
`;

const TicketTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: #51cf66;
`;

const TicketList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const TicketItem = styled.div`
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 12px 16px;
  transition: all 0.3s ease;

  &:hover {
    background: #334155;
    border-color: #475569;
  }
`;

const TicketNumber = styled.span`
  font-family: 'Courier New', monospace;
  font-size: 14px;
  font-weight: 700;
  color: #51cf66;
  letter-spacing: 1px;
`;

