import { useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useShares } from '../../hooks/useShares';
import { Button, Input } from '../../design-system';

interface BuySharesModalProps {
  isOpen: boolean;
  onClose: () => void;
  creatorPubkey: PublicKey;
  creatorUsername: string;
}

export function BuySharesModal({
  isOpen,
  onClose,
  creatorPubkey,
  creatorUsername,
}: BuySharesModalProps) {
  const [amount, setAmount] = useState('1');
  const [slippage, setSlippage] = useState('5');
  const { buyShares, isBuying, calculatePriceForAmount } = useShares(creatorPubkey);
  const [calculatedPrice, setCalculatedPrice] = useState<number>(0);

  const handleAmountChange = async (value: string) => {
    setAmount(value);
    const amountNum = parseInt(value);
    if (amountNum > 0) {
      const price = await calculatePriceForAmount(amountNum);
      setCalculatedPrice(price);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amountNum = parseInt(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return;
    }

    try {
      const maxPricePerShare =
        (calculatedPrice * (1 + parseFloat(slippage) / 100)) / amountNum;
      await buyShares({ amount: amountNum, maxPrice: maxPricePerShare });
      setAmount('1');
      onClose();
    } catch (error) {
      console.error('Support creator failed:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm">
      <div className="bg-surface rounded-ds-xl p-8 max-w-md w-full mx-4 border border-border">
        <h2 className="text-h3 text-foreground mb-2">
          Support @{creatorUsername}
        </h2>
        <p className="text-muted text-sm mb-6">
          Buy Supporter Shares to unlock exclusive content
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-muted mb-2">
              Number of Supporter Shares
            </label>
            <Input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="1"
              min="1"
              step="1"
              required
              disabled={isBuying}
            />
            <div className="flex gap-2 mt-2">
              {[1, 5, 10, 50].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleAmountChange(preset.toString())}
                  disabled={isBuying}
                  className="px-3 py-1 bg-surface-2 hover:bg-surface text-muted text-sm rounded-ds-sm border border-border transition-colors disabled:opacity-50"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="slippage" className="block text-sm font-medium text-muted mb-2">
              Price protection (%)
            </label>
            <Input
              type="number"
              id="slippage"
              value={slippage}
              onChange={(e) => setSlippage(e.target.value)}
              placeholder="5"
              min="0.1"
              max="50"
              step="0.5"
              disabled={isBuying}
            />
          </div>

          <div className="bg-surface-2 rounded-ds-md p-4 border border-border">
            <div className="flex justify-between items-center mb-2">
              <span className="text-muted text-sm">Estimated Cost</span>
              <span className="text-foreground font-semibold">
                {calculatedPrice.toFixed(4)} SOL
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted text-sm">Max price (with protection)</span>
              <span className="text-primary font-semibold">
                {(calculatedPrice * (1 + parseFloat(slippage) / 100)).toFixed(4)} SOL
              </span>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isBuying}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isBuying || !amount || parseInt(amount) <= 0}
              className="flex-1"
            >
              {isBuying ? 'Supporting...' : 'Support Creator'}
            </Button>
          </div>
        </form>

        <p className="text-xs text-muted mt-4 text-center">
          Price grows as more supporters join
        </p>
      </div>
    </div>
  );
}
