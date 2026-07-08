import { useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useSocialFi } from '../../hooks/useSocialFi';
import { Button, Input } from '../../design-system';

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-background bg-opacity-50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-surface rounded-ds-xl p-8 max-w-md w-full mx-4 border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-h3 text-foreground mb-2">
          Send Tip to @{recipientUsername}
        </h2>
        <p className="text-muted text-sm mb-6">Show your appreciation with SOL</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount Input */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-muted mb-2">
              Amount (SOL)
            </label>
            <Input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.1"
              step="0.01"
              min="0.001"
              required
              disabled={isSending}
            />
            <div className="flex gap-2 mt-2">
              {[0.1, 0.5, 1, 5].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(preset.toString())}
                  disabled={isSending}
                  className="px-3 py-1 bg-surface-2 hover:bg-surface text-muted text-sm rounded-ds-sm border border-border transition-colors disabled:opacity-50"
                >
                  {preset} SOL
                </button>
              ))}
            </div>
          </div>



          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSending} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isSending || !amount || parseFloat(amount) <= 0} className="flex-1">
              {isSending ? 'Sending...' : 'Send Tip'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
