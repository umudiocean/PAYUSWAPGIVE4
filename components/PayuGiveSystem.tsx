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
  const [legacyTickets, setLegacyTickets] = useState<any[]>([]);
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
      setLegacyTickets([]);
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

      // Fetch legacy ticket pool data
      const legacyResponse = await fetch(`/api/legacy-tickets?address=${userAddress}`);
      
      if (legacyResponse.ok) {
        const legacyData = await legacyResponse.json();
        setLegacyTickets(legacyData.legacyTickets || []);
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

        {legacyTickets.length > 0 && (
          <LegacyTicketSection>
            <LegacyTicketTitle>🏆 Legacy Pool Tickets:</LegacyTicketTitle>
            <LegacyTicketList>
              {legacyTickets.map((ticket, index) => (
                <LegacyTicketItem key={index}>
                  <LegacyTicketNumber>{ticket.ticketId}</LegacyTicketNumber>
                  <LegacyTicketInfo>
                    <LegacyTicketDate>Earned: {new Date(ticket.earnedAt).toLocaleDateString()}</LegacyTicketDate>
                    <LegacyTicketReward>250M PAYU</LegacyTicketReward>
                  </LegacyTicketInfo>
                </LegacyTicketItem>
              ))}
            </LegacyTicketList>
          </LegacyTicketSection>
        )}

        {ticketIds.length > 0 && (
          <TicketSection>
            <TicketTitle>🎟️ Current Pool Tickets:</TicketTitle>
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
              Claim {tickets} Ticket{tickets > 1 ? 's' : ''} (250M PAYU each)
            </ClaimButton>
          ) : (
            <DisabledButton>
              No tickets available yet
            </DisabledButton>
          )}
        </ButtonContainer>

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
  border: 1px solid #475569;
  border-radius: 24px;
  padding: 24px;
  margin-top: 24px;
  color: white;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  position: relative;
  overflow: hidden;
  max-width: 480px; /* Swap kartı ile aynı genişlikte */
  margin-left: auto;
  margin-right: auto;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%);
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
  background: linear-gradient(135deg, #62cbc1 0%, #5bc0be 50%, #52b7b5 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 2px 10px rgba(98, 203, 193, 0.3);
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
  gap: 12px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const StatBox = styled.div<{ highlighted?: boolean }>`
  background: ${props => props.highlighted 
    ? '#334155' 
    : '#1e293b'};
  border-radius: 16px;
  padding: 16px;
  text-align: center;
  position: relative;
  backdrop-filter: blur(10px);
  border: ${props => props.highlighted 
    ? '2px solid #62cbc1' 
    : '1px solid #334155'};
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.3);
    background: ${props => props.highlighted 
      ? '#475569' 
      : '#334155'};
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
  background: linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
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
  background: linear-gradient(135deg, #62cbc1 0%, #5bc0be 100%);
  color: white;
  padding: 16px 24px;
  border-radius: 16px;
  border: none;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  width: 100%;
  transition: all 0.3s ease;
  box-shadow: 0 8px 20px rgba(98, 207, 102, 0.3);

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 30px rgba(98, 207, 102, 0.4);
    background: linear-gradient(135deg, #5bc0be 0%, #52b7b5 100%);
  }

  &:active {
    transform: translateY(-1px);
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
  color: #62cbc1;
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
  color: #62cbc1;
  letter-spacing: 1px;
`;

const LegacyTicketSection = styled.div`
  margin-bottom: 20px;
`;

const LegacyTicketTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: #fbbf24;
  text-shadow: 0 2px 4px rgba(251, 191, 36, 0.3);
`;

const LegacyTicketList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const LegacyTicketItem = styled.div`
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  border: 1px solid #fbbf24;
  border-radius: 12px;
  padding: 16px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, #fbbf24, #f59e0b, #fbbf24);
    animation: legacyGlow 2s ease-in-out infinite;
  }

  &:hover {
    background: linear-gradient(135deg, #334155 0%, #475569 100%);
    border-color: #f59e0b;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(251, 191, 36, 0.2);
  }

  @keyframes legacyGlow {
    0%, 100% {
      opacity: 0.6;
    }
    50% {
      opacity: 1;
    }
  }
`;

const LegacyTicketNumber = styled.span`
  font-family: 'Courier New', monospace;
  font-size: 14px;
  font-weight: 700;
  color: #fbbf24;
  letter-spacing: 1px;
  display: block;
  margin-bottom: 8px;
`;

const LegacyTicketInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
`;

const LegacyTicketDate = styled.span`
  color: #94a3b8;
  font-weight: 500;
`;

const LegacyTicketReward = styled.span`
  color: #62cbc1;
  font-weight: 600;
  background: rgba(98, 203, 193, 0.1);
  padding: 2px 8px;
  border-radius: 6px;
`;

