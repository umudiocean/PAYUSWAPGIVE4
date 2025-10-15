import { NextRequest, NextResponse } from 'next/server';
import { incrementSwapCount } from '@/lib/kv';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userAddress } = body;

    if (!userAddress) {
      return NextResponse.json(
        { error: 'User address is required' },
        { status: 400 }
      );
    }

    // Validate address format (basic validation)
    if (!userAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json(
        { error: 'Invalid address format' },
        { status: 400 }
      );
    }

    // Increment swap count and handle ticket generation
    const swapData = await incrementSwapCount(userAddress);

    return NextResponse.json({
      success: true,
      swapCount: swapData.count,
      tickets: swapData.tickets,
      lastSwap: swapData.lastSwap,
      message: swapData.tickets > Math.floor((swapData.count - 1) / 3) 
        ? '🎉 New ticket earned!' 
        : `${3 - (swapData.count % 3)} more swaps to next ticket`
    });
  } catch (error: any) {
    console.error('Track swap error:', error);
    return NextResponse.json(
      { error: 'Failed to track swap', details: error.message },
      { status: 500 }
    );
  }
}

// Optional: GET endpoint to check swap stats
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userAddress = searchParams.get('address');

  if (!userAddress) {
    return NextResponse.json(
      { error: 'User address is required' },
      { status: 400 }
    );
  }

  try {
    const { getSwapData } = await import('@/lib/kv');
    const swapData = await getSwapData(userAddress);

    return NextResponse.json({
      success: true,
      ...swapData
    });
  } catch (error: any) {
    console.error('Get swap data error:', error);
    return NextResponse.json(
      { error: 'Failed to get swap data', details: error.message },
      { status: 500 }
    );
  }
}

