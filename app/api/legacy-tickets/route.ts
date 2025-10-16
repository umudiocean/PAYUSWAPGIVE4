import { NextRequest, NextResponse } from 'next/server';

// Mock eski ticket pool verisi
// Gerçek implementasyonda bu veriler bir veritabanından gelecek
const LEGACY_TICKETS: { [address: string]: any[] } = {
  '0x88c1ff9bcde2cda7d92f45908c5acec7c5adb793': [
    {
      ticketId: 'PAYU-0E7-08C-718',
      earnedAt: '2024-01-15T10:30:00Z',
      claimed: false,
      rewardAmount: '250000000', // 250M PAYU
      poolId: 'legacy_pool_1'
    },
    {
      ticketId: 'PAYU-A3F-2B1-9C4',
      earnedAt: '2024-01-20T14:45:00Z',
      claimed: true,
      claimTxHash: '0x1234567890abcdef...',
      rewardAmount: '250000000',
      poolId: 'legacy_pool_1'
    }
  ],
  // Diğer cüzdanlar için örnek veriler
  '0x1234567890123456789012345678901234567890': [
    {
      ticketId: 'PAYU-B2C-5D8-E9A',
      earnedAt: '2024-01-10T08:15:00Z',
      claimed: false,
      rewardAmount: '250000000',
      poolId: 'legacy_pool_1'
    }
  ]
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userAddress = searchParams.get('address');

    if (!userAddress) {
      return NextResponse.json(
        { error: 'User address is required' },
        { status: 400 }
      );
    }

    // Validate address format
    if (!userAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json(
        { error: 'Invalid address format' },
        { status: 400 }
      );
    }

    // Eski ticket pool verilerini al
    const legacyTickets = LEGACY_TICKETS[userAddress.toLowerCase()] || [];
    
    // Sadece claim edilmemiş ticket'ları döndür
    const availableTickets = legacyTickets.filter(ticket => !ticket.claimed);

    return NextResponse.json({
      success: true,
      legacyTickets: availableTickets,
      totalLegacyTickets: legacyTickets.length,
      availableLegacyTickets: availableTickets.length,
      claimedLegacyTickets: legacyTickets.filter(ticket => ticket.claimed).length
    });
  } catch (error: any) {
    console.error('Get legacy tickets error:', error);
    return NextResponse.json(
      { error: 'Failed to get legacy tickets', details: error.message },
      { status: 500 }
    );
  }
}
