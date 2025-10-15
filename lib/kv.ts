// Vercel KV Store Helper
// This file provides utility functions for interacting with Vercel KV database

export interface SwapData {
  count: number;
  lastSwap: string;
  tickets: number;
}

export interface TicketData {
  count: number;
  claimed: boolean;
  claimTime: string | null;
  txHash: string | null;
}

export interface AdminStats {
  totalSwaps: number;
  totalTickets: number;
  totalClaims: number;
  activeUsers: number;
  lastUpdated: string;
}

// Mock KV functions for development (replace with @vercel/kv in production)
const kvStore = new Map<string, any>();

export async function getSwapData(userAddress: string): Promise<SwapData> {
  const key = `swaps:${userAddress.toLowerCase()}`;
  
  // In production: use @vercel/kv
  // const data = await kv.get(key);
  
  const data = kvStore.get(key);
  
  return data || {
    count: 0,
    lastSwap: new Date().toISOString(),
    tickets: 0
  };
}

export async function setSwapData(userAddress: string, data: SwapData): Promise<void> {
  const key = `swaps:${userAddress.toLowerCase()}`;
  
  // In production: use @vercel/kv
  // await kv.set(key, data);
  
  kvStore.set(key, data);
}

export async function getTicketData(userAddress: string): Promise<TicketData> {
  const key = `tickets:${userAddress.toLowerCase()}`;
  
  // In production: use @vercel/kv
  // const data = await kv.get(key);
  
  const data = kvStore.get(key);
  
  return data || {
    count: 0,
    claimed: false,
    claimTime: null,
    txHash: null
  };
}

export async function setTicketData(userAddress: string, data: TicketData): Promise<void> {
  const key = `tickets:${userAddress.toLowerCase()}`;
  
  // In production: use @vercel/kv
  // await kv.set(key, data);
  
  kvStore.set(key, data);
}

export async function getAdminStats(): Promise<AdminStats> {
  const key = 'admin:stats';
  
  // In production: use @vercel/kv
  // const data = await kv.get(key);
  
  const data = kvStore.get(key);
  
  return data || {
    totalSwaps: 0,
    totalTickets: 0,
    totalClaims: 0,
    activeUsers: 0,
    lastUpdated: new Date().toISOString()
  };
}

export async function updateAdminStats(stats: Partial<AdminStats>): Promise<void> {
  const key = 'admin:stats';
  const currentStats = await getAdminStats();
  
  const updatedStats = {
    ...currentStats,
    ...stats,
    lastUpdated: new Date().toISOString()
  };
  
  // In production: use @vercel/kv
  // await kv.set(key, updatedStats);
  
  kvStore.set(key, updatedStats);
}

export async function incrementSwapCount(userAddress: string): Promise<SwapData> {
  const currentData = await getSwapData(userAddress);
  const newCount = currentData.count + 1;
  
  // Every 3 swaps = 1 ticket
  const newTickets = Math.floor(newCount / 3);
  
  const updatedData: SwapData = {
    count: newCount,
    lastSwap: new Date().toISOString(),
    tickets: newTickets
  };
  
  await setSwapData(userAddress, updatedData);
  
  // Update ticket data if new ticket earned
  if (newTickets > currentData.tickets) {
    const ticketData = await getTicketData(userAddress);
    await setTicketData(userAddress, {
      ...ticketData,
      count: ticketData.count + (newTickets - currentData.tickets)
    });
  }
  
  // Update admin stats
  const adminStats = await getAdminStats();
  await updateAdminStats({
    totalSwaps: adminStats.totalSwaps + 1,
    totalTickets: adminStats.totalTickets + (newTickets > currentData.tickets ? 1 : 0),
    activeUsers: adminStats.activeUsers // Will be calculated separately
  });
  
  return updatedData;
}

