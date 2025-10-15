'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import Web3 from 'web3';

interface ClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  userAddress: string;
  tickets: number;
  onSuccess: () => void;
}

const CLAIM_FEE = '0.00030'; // BNB

export const ClaimModal: React.FC<ClaimModalProps> = ({
  isOpen,
  onClose,
  userAddress,
  tickets,
  onSuccess
}) => {
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const handleClaim = async () => {
    if (!userAddress || tickets === 0) return;

    setClaiming(true);
    setError(null);
    setSuccess(false);

    try {
      // Get Web3 instance
      if (typeof window.ethereum === 'undefined') {
        throw new Error('Please install MetaMask to claim rewards');
      }

      const web3 = new Web3(window.ethereum);

      // Calculate total fee (0.00030 BNB per ticket)
      const totalFee = (parseFloat(CLAIM_FEE) * tickets).toFixed(5);
      const feeInWei = web3.utils.toWei(totalFee, 'ether');

      // Call API to initiate claim
      const response = await fetch('/api/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAddress,
          tickets,
          feeInWei
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Claim failed');
      }

      // Send fee to platform
      const tx = await web3.eth.sendTransaction({
        from: userAddress,
        to: data.feeRecipient,
        value: feeInWei,
        gas: 21000
      });

      setTxHash(tx.transactionHash as string);
      setSuccess(true);

      // Wait a bit before closing
      setTimeout(() => {
        onSuccess();
      }, 2000);

    } catch (err: any) {
      console.error('Claim error:', err);
      setError(err.message || 'Failed to claim reward. Please try again.');
    } finally {
      setClaiming(false);
    }
  };

  if (!isOpen) return null;

  const rewardAmount = tickets * 250000000; // 250M PAYU per ticket
  const totalFee = (parseFloat(CLAIM_FEE) * tickets).toFixed(5);

  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose}>×</CloseButton>

        {success ? (
          <SuccessContent>
            <SuccessIcon>✅</SuccessIcon>
            <SuccessTitle>Claim Successful!</SuccessTitle>
            <SuccessMessage>
              You've claimed {rewardAmount.toLocaleString()} PAYU!
            </SuccessMessage>
            {txHash && (
              <TxLink
                href={`https://bscscan.com/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View on BscScan →
              </TxLink>
            )}
          </SuccessContent>
        ) : (
          <>
            <ModalHeader>
              <ModalIcon>🎁</ModalIcon>
              <ModalTitle>Claim Your Rewards</ModalTitle>
            </ModalHeader>

            <RewardSection>
              <RewardLabel>You will receive:</RewardLabel>
              <RewardAmount>{rewardAmount.toLocaleString()} PAYU</RewardAmount>
              <RewardSubtext>
                {tickets} ticket{tickets > 1 ? 's' : ''} × 250M PAYU each
              </RewardSubtext>
            </RewardSection>

            <FeeSection>
              <FeeRow>
                <FeeLabel>Claim Fee:</FeeLabel>
                <FeeValue>{totalFee} BNB</FeeValue>
              </FeeRow>
              <FeeNote>
                This fee covers gas and processing costs
              </FeeNote>
            </FeeSection>

            {error && (
              <ErrorBox>
                <ErrorIcon>⚠️</ErrorIcon>
                <ErrorText>{error}</ErrorText>
              </ErrorBox>
            )}

            <ButtonGroup>
              <CancelButton onClick={onClose} disabled={claiming}>
                Cancel
              </CancelButton>
              <ConfirmButton onClick={handleClaim} disabled={claiming}>
                {claiming ? 'Processing...' : 'Confirm Claim'}
              </ConfirmButton>
            </ButtonGroup>

            <InfoNote>
              <InfoIcon>ℹ️</InfoIcon>
              <InfoText>
                Your PAYU tokens will be sent instantly after the transaction is confirmed
              </InfoText>
            </InfoNote>
          </>
        )}
      </ModalContainer>
    </Overlay>
  );
};

// Styled Components
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  backdrop-filter: blur(4px);
`;

const ModalContainer = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 24px;
  padding: 32px;
  max-width: 480px;
  width: 100%;
  position: relative;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.5);
  color: white;

  @media (max-width: 768px) {
    padding: 24px;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-size: 28px;
  cursor: pointer;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: rotate(90deg);
  }
`;

const ModalHeader = styled.div`
  text-align: center;
  margin-bottom: 24px;
`;

const ModalIcon = styled.div`
  font-size: 64px;
  margin-bottom: 12px;
`;

const ModalTitle = styled.h2`
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  text-shadow: 0 2px 10px rgba(0,0,0,0.2);
`;

const RewardSection = styled.div`
  background: rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  margin-bottom: 20px;
  backdrop-filter: blur(10px);
`;

const RewardLabel = styled.div`
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 8px;
`;

const RewardAmount = styled.div`
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 8px;
  text-shadow: 0 2px 15px rgba(0,0,0,0.3);
`;

const RewardSubtext = styled.div`
  font-size: 13px;
  opacity: 0.8;
`;

const FeeSection = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
`;

const FeeRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const FeeLabel = styled.div`
  font-size: 15px;
  font-weight: 500;
`;

const FeeValue = styled.div`
  font-size: 18px;
  font-weight: 700;
`;

const FeeNote = styled.div`
  font-size: 12px;
  opacity: 0.7;
`;

const ErrorBox = styled.div`
  background: rgba(255, 107, 107, 0.2);
  border: 1px solid rgba(255, 107, 107, 0.4);
  border-radius: 12px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
`;

const ErrorIcon = styled.span`
  font-size: 20px;
`;

const ErrorText = styled.p`
  margin: 0;
  font-size: 14px;
  flex: 1;
`;

const ButtonGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 12px;
  margin-bottom: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const CancelButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 14px 24px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ConfirmButton = styled.button`
  background: linear-gradient(135deg, #51cf66 0%, #40c057 100%);
  color: white;
  padding: 14px 24px;
  border-radius: 12px;
  border: none;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 15px rgba(81, 207, 102, 0.3);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(81, 207, 102, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const InfoNote = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 12px;
  opacity: 0.8;
  line-height: 1.4;
`;

const InfoIcon = styled.span`
  font-size: 14px;
`;

const InfoText = styled.p`
  margin: 0;
  flex: 1;
`;

const SuccessContent = styled.div`
  text-align: center;
  padding: 20px;
`;

const SuccessIcon = styled.div`
  font-size: 80px;
  margin-bottom: 20px;
  animation: scaleIn 0.5s ease;

  @keyframes scaleIn {
    from {
      transform: scale(0);
    }
    to {
      transform: scale(1);
    }
  }
`;

const SuccessTitle = styled.h2`
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 12px 0;
`;

const SuccessMessage = styled.p`
  font-size: 18px;
  margin: 0 0 24px 0;
  opacity: 0.9;
`;

const TxLink = styled.a`
  display: inline-block;
  color: white;
  text-decoration: none;
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }
`;

