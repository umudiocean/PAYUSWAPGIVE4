import { NextRequest, NextResponse } from 'next/server';
import { getTicketData, setTicketData, updateAdminStats, getAdminStats } from '@/lib/kv';
import Web3 from 'web3';

// Configuration
const PAYU_TOKEN = process.env.NEXT_PUBLIC_PAYU_TOKEN || '0x9AeB2E6DD8d55E14292ACFCFC4077e33106e4144';
const REWARD_WALLET_ADDRESS = process.env.REWARD_WALLET_ADDRESS || '0xfb2cC3797407Dc4147451BE31D1927ebd2403451';
const REWARD_WALLET_PRIVATE_KEY = process.env.REWARD_WALLET_PRIVATE_KEY;
const BSC_RPC = process.env.NEXT_PUBLIC_BSC_RPC || 'https://bsc-dataseed1.binance.org/';
const FEE_RECIPIENT = process.env.FEE_RECIPIENT_ADDRESS || '0xd9C4b8436d2a235A1f7DB09E680b5928cFdA641a';

const REWARD_PER_TICKET = '250000000'; // 250M PAYU

const ERC20_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "recipient", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "transfer",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }],
    "stateMutability": "view",
    "type": "function"
  }
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userAddress, tickets } = body;

    // Validation
    if (!userAddress || !tickets) {
      return NextResponse.json(
        { error: 'User address and tickets are required' },
        { status: 400 }
      );
    }

    if (!userAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json(
        { error: 'Invalid address format' },
        { status: 400 }
      );
    }

    if (tickets <= 0) {
      return NextResponse.json(
        { error: 'Invalid ticket count' },
        { status: 400 }
      );
    }

    // Get user ticket data
    const ticketData = await getTicketData(userAddress);

    if (ticketData.count < tickets) {
      return NextResponse.json(
        { error: 'Insufficient tickets' },
        { status: 400 }
      );
    }

    // Initialize Web3
    const web3 = new Web3(BSC_RPC);
    const payuContract = new web3.eth.Contract(ERC20_ABI as any, PAYU_TOKEN);

    // Calculate reward amount (250M PAYU per ticket)
    const decimals = 18; // PAYU has 18 decimals
    const rewardAmount = web3.utils.toBigInt(REWARD_PER_TICKET) * web3.utils.toBigInt(tickets);
    const rewardInWei = rewardAmount * web3.utils.toBigInt(10 ** decimals);

    // Send PAYU tokens if private key is available
    let txHash = null;
    if (REWARD_WALLET_PRIVATE_KEY) {
      try {
        const account = web3.eth.accounts.privateKeyToAccount(REWARD_WALLET_PRIVATE_KEY);
        web3.eth.accounts.wallet.add(account);

        const tx = await payuContract.methods.transfer(userAddress, rewardInWei.toString()).send({
          from: REWARD_WALLET_ADDRESS,
          gas: 100000
        });

        txHash = tx.transactionHash;
      } catch (error: any) {
        console.error('Token transfer error:', error);
        return NextResponse.json(
          { error: 'Failed to send reward tokens', details: error.message },
          { status: 500 }
        );
      }
    }

    // Update ticket data
    await setTicketData(userAddress, {
      count: ticketData.count - tickets,
      claimed: true,
      claimTime: new Date().toISOString(),
      txHash
    });

    // Update admin stats
    const adminStats = await getAdminStats();
    await updateAdminStats({
      totalClaims: adminStats.totalClaims + tickets
    });

    return NextResponse.json({
      success: true,
      feeRecipient: FEE_RECIPIENT,
      txHash,
      rewardAmount: (parseFloat(REWARD_PER_TICKET) * tickets).toLocaleString(),
      message: 'Reward claimed successfully!'
    });
  } catch (error: any) {
    console.error('Claim error:', error);
    return NextResponse.json(
      { error: 'Failed to process claim', details: error.message },
      { status: 500 }
    );
  }
}

