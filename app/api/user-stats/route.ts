import { NextRequest, NextResponse } from 'next/server';
import { getSwapData, getTicketData } from '@/lib/kv';

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

    // Get user data
    const swapData = await getSwapData(userAddress);
    const ticketData = await getTicketData(userAddress);

    return NextResponse.json({
      success: true,
      swapCount: swapData.count,
      lastSwap: swapData.lastSwap,
      tickets: ticketData.count,
      claimed: ticketData.claimed,
      claimTime: ticketData.claimTime
    });
  } catch (error: any) {
    console.error('Get user stats error:', error);
    return NextResponse.json(
      { error: 'Failed to get user stats', details: error.message },
      { status: 500 }
    );
  }
}

