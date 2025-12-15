import { useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useSocialFi } from '../../hooks/useSocialFi';

interface SendTipModalProps {
  recipientPubkey: PublicKey;
  recipientUsername: string;
  onClose: () => void;
  onSuccess?: (amount: number) => void;
}

export function SendTipModal({
  recipientPubkey,
  recipientUsername,
  onClose,
  onSuccess,
}: SendTipModalProps) {
  const [amount, setAmount] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { sendTip } = useSocialFi();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return;
    }

    try {
      setIsSending(true);
      await sendTip(recipientPubkey, amountNum);
      setAmount('');
      onSuccess?.(amountNum);
      onClose();
    } catch (error) {
      console.error('Send tip failed:', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 rounded-xl p-8 max-w-md w-full mx-4 border border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-white mb-2">
          Send Tip to @{recipientUsername}
        </h2>
        <p className="text-slate-400 text-sm mb-6">Show your appreciation with SOL</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount Input */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-slate-300 mb-2">
              Amount (SOL)
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.1"
              step="0.01"
              min="0.001"
              required
              disabled={isSending}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-solana-green)] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <div className="flex gap-2 mt-2">
              {[0.1, 0.5, 1, 5].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(preset.toString())}
                  disabled={isSending}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded border border-slate-700 transition-colors disabled:opacity-50"
                >
                  {preset} SOL
                </button>
              ))}
            </div>
          </div>



          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSending}
              className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSending || !amount || parseFloat(amount) <= 0}
              className="flex-1 px-6 py-3 bg-[var(--color-solana-green)] hover:bg-[#9FE51C] text-black rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? 'Sending...' : 'Send Tip'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
