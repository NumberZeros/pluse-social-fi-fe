import { useWallet, useConnection } from '../lib/wallet-adapter';
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { toast } from 'react-hot-toast';

export function useSolanaTipping() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

  const sendTip = async (recipientAddress: string, amountUSD: number) => {
    if (!publicKey) {
      toast.error('Please connect your wallet first');
      return false;
    }

    try {
      // For demo purposes, we'll use 1 USD = 0.01 SOL
      // In production, you'd fetch the real SOL/USD price
      const solAmount = amountUSD * 0.01;
      const lamports = Math.floor(solAmount * LAMPORTS_PER_SOL);

      const recipientPubkey = new PublicKey(recipientAddress);

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipientPubkey,
          lamports,
        }),
      );

      const signature = await sendTransaction(transaction);

      toast.success(`Tip sent! Transaction: ${signature.slice(0, 8)}...`);

      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed');

      return true;
    } catch (error) {
      console.error('Error sending tip:', error);
      toast.error('Failed to send tip. Please try again.');
      return false;
    }
  };

  return { sendTip };
}

export function useSolanaIdentity() {
  const { publicKey } = useWallet();

  const mintUsername = async (username: string) => {
    if (!publicKey) {
      toast.error('Please connect your wallet first');
      return false;
    }

    try {
      // This would integrate with your ZK Compression program
      // For now, we'll just simulate the minting
      toast.success(`@${username} minted successfully!`);
      return true;
    } catch (error) {
      console.error('Error minting username:', error);
      toast.error('Failed to mint username. Please try again.');
      return false;
    }
  };

  return { mintUsername };
}
