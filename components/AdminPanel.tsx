'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

interface AdminStats {
  totalSwaps: number;
  totalTickets: number;
  totalClaims: number;
  activeUsers: number;
  lastUpdated: string;
}

export const AdminPanel: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${password}`
        }
      });

      if (response.status === 401) {
        setAuthenticated(false);
        setError('Invalid password');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to load stats');
      }

      const data = await response.json();
      setStats(data.stats);
      setAuthenticated(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loadStats();
  };

  useEffect(() => {
    if (authenticated) {
      const interval = setInterval(loadStats, 30000); // Refresh every 30s
      return () => clearInterval(interval);
    }
  }, [authenticated]);

  if (!authenticated) {
    return (
      <Container>
        <LoginCard>
          <LoginTitle>🔐 Admin Login</LoginTitle>
          <LoginForm onSubmit={handleLogin}>
            <Input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
            <LoginButton type="submit">
              Login
            </LoginButton>
            {error && <ErrorText>{error}</ErrorText>}
          </LoginForm>
        </LoginCard>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>📊 PAYUGIVE Admin Dashboard</Title>
        <LastUpdated>
          Last updated: {stats?.lastUpdated ? new Date(stats.lastUpdated).toLocaleString() : 'N/A'}
        </LastUpdated>
      </Header>

      {loading && !stats ? (
        <LoadingText>Loading...</LoadingText>
      ) : error ? (
        <ErrorText>{error}</ErrorText>
      ) : stats ? (
        <>
          <StatsGrid>
            <StatCard color="#667eea">
              <StatIcon>🔄</StatIcon>
              <StatValue>{stats.totalSwaps.toLocaleString()}</StatValue>
              <StatLabel>Total Swaps</StatLabel>
            </StatCard>

            <StatCard color="#f093fb">
              <StatIcon>🎟️</StatIcon>
              <StatValue>{stats.totalTickets.toLocaleString()}</StatValue>
              <StatLabel>Tickets Generated</StatLabel>
            </StatCard>

            <StatCard color="#4facfe">
              <StatIcon>✅</StatIcon>
              <StatValue>{stats.totalClaims.toLocaleString()}</StatValue>
              <StatLabel>Claims Processed</StatLabel>
            </StatCard>

            <StatCard color="#43e97b">
              <StatIcon>👥</StatIcon>
              <StatValue>{stats.activeUsers.toLocaleString()}</StatValue>
              <StatLabel>Active Users</StatLabel>
            </StatCard>
          </StatsGrid>

          <MetricsSection>
            <MetricCard>
              <MetricTitle>Performance Metrics</MetricTitle>
              <MetricRow>
                <MetricLabel>Avg Swaps per User:</MetricLabel>
                <MetricValue>
                  {stats.activeUsers > 0 ? (stats.totalSwaps / stats.activeUsers).toFixed(2) : '0'}
                </MetricValue>
              </MetricRow>
              <MetricRow>
                <MetricLabel>Claim Rate:</MetricLabel>
                <MetricValue>
                  {stats.totalTickets > 0 ? ((stats.totalClaims / stats.totalTickets) * 100).toFixed(1) : '0'}%
                </MetricValue>
              </MetricRow>
              <MetricRow>
                <MetricLabel>Total PAYU Distributed:</MetricLabel>
                <MetricValue>
                  {(stats.totalClaims * 250000000).toLocaleString()} PAYU
                </MetricValue>
              </MetricRow>
            </MetricCard>
          </MetricsSection>

          <ActionButtons>
            <RefreshButton onClick={loadStats}>
              🔄 Refresh Stats
            </RefreshButton>
            <LogoutButton onClick={() => setAuthenticated(false)}>
              🚪 Logout
            </LogoutButton>
          </ActionButtons>
        </>
      ) : null}
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
  color: white;
`;

const Title = styled.h1`
  font-size: 36px;
  font-weight: 700;
  margin: 0 0 12px 0;
  text-shadow: 0 2px 15px rgba(0,0,0,0.2);
`;

const LastUpdated = styled.p`
  font-size: 14px;
  opacity: 0.8;
  margin: 0;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
`;

const StatCard = styled.div<{ color: string }>`
  background: ${props => props.color};
  border-radius: 20px;
  padding: 32px;
  text-align: center;
  color: white;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }
`;

const StatIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const StatValue = styled.div`
  font-size: 42px;
  font-weight: 700;
  margin-bottom: 8px;
  text-shadow: 0 2px 10px rgba(0,0,0,0.2);
`;

const StatLabel = styled.div`
  font-size: 16px;
  opacity: 0.9;
  font-weight: 500;
`;

const MetricsSection = styled.div`
  margin-bottom: 40px;
`;

const MetricCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
`;

const MetricTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 24px 0;
  color: #333;
`;

const MetricRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #eee;

  &:last-child {
    border-bottom: none;
  }
`;

const MetricLabel = styled.div`
  font-size: 16px;
  color: #666;
  font-weight: 500;
`;

const MetricValue = styled.div`
  font-size: 18px;
  color: #333;
  font-weight: 700;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
`;

const RefreshButton = styled.button`
  background: linear-gradient(135deg, #51cf66 0%, #40c057 100%);
  color: white;
  padding: 14px 32px;
  border-radius: 12px;
  border: none;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 15px rgba(81, 207, 102, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(81, 207, 102, 0.4);
  }
`;

const LogoutButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 14px 32px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const LoginCard = styled.div`
  max-width: 400px;
  margin: 100px auto;
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
`;

const LoginTitle = styled.h2`
  font-size: 28px;
  font-weight: 700;
  text-align: center;
  margin: 0 0 32px 0;
  color: #333;
`;

const LoginForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Input = styled.input`
  padding: 14px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const LoginButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 14px;
  border-radius: 12px;
  border: none;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }
`;

const LoadingText = styled.div`
  text-align: center;
  color: white;
  font-size: 18px;
  padding: 40px;
`;

const ErrorText = styled.div`
  color: #ff6b6b;
  text-align: center;
  padding: 12px;
  background: rgba(255, 107, 107, 0.1);
  border-radius: 8px;
  font-size: 14px;
`;

