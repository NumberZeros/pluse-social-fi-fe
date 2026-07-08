import { useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useShares } from '../../hooks/useShares';
import { toast } from 'react-hot-toast';
import { Button, Card, Input } from '../../design-system';

/** Percent of sell proceeds retained in the creator pool vault (not a platform cut). */
export const SELL_POOL_FEE_PERCENT = 10;

interface SellSharesModalProps {
  creatorPubkey: PublicKey;
  creatorUsername: string;
  onClose: () => void;
}

export const SellSharesModal = ({ creatorPubkey, creatorUsername, onClose }: SellSharesModalProps) => {
  const [amount, setAmount] = useState('');
  const [slippage, setSlippage] = useState('1.0');
  
  const { userBalance, shares, calculatePriceForAmount, sellShares, isSelling } = useShares(creatorPubkey);

  const handleSell = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const amountNum = parseFloat(amount);
    
    if (amountNum > userBalance) {
      toast.error(`You only have ${userBalance} Supporter Shares`);
      return;
    }

    try {
      const estimatedPriceValue = await calculatePriceForAmount(amountNum);
      const slippagePercent = parseFloat(slippage);
      const minPricePerShare =
        (estimatedPriceValue * (1 - slippagePercent / 100)) / amountNum;

      await sellShares({
        amount: amountNum,
        minPrice: minPricePerShare,
      });
      
      toast.success(`Cashed out ${amountNum} Supporter Shares`);
      setAmount('');
      onClose();
    } catch (error: unknown) {
      console.error('Sell shares failed:', error);
      const message = error instanceof Error ? error.message : 'Failed to sell shares';
      toast.error(message);
    }
  };

  const estimatedGross = amount && parseFloat(amount) > 0 
    ? parseFloat(amount) * (shares?.basePrice ? Number(shares.basePrice) / 1e9 : 0)
    : 0;

  const poolFee = estimatedGross * (SELL_POOL_FEE_PERCENT / 100);
  const estimatedAfterPoolFee = estimatedGross - poolFee;
  const slippageAmount = estimatedAfterPoolFee * (parseFloat(slippage) / 100);
  const minReceive = estimatedAfterPoolFee - slippageAmount;

  return (
    <div 
      className="fixed inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <Card
        variant="glass"
        className="rounded-xl p-6 max-w-md w-full border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-h3 text-foreground">
            Cash out support — @{creatorUsername}
          </h2>
          <button
            onClick={onClose}
            className="text-muted hover:text-foreground transition"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-surface-2 rounded-lg p-4">
            <p className="text-muted text-sm mb-1">Your Balance</p>
            <p className="text-foreground text-xl font-bold">{userBalance} Supporter Shares</p>
          </div>

          <div className="bg-surface-2 rounded-lg p-4">
            <p className="text-muted text-sm mb-1">Base Price</p>
            <p className="text-foreground text-xl font-bold">
              {shares?.basePrice ? (Number(shares.basePrice) / 1e9).toFixed(4) : '0'} SOL
            </p>
          </div>

          <div>
            <label className="block text-muted text-sm mb-2">
              Amount to sell
            </label>
            <div className="relative">
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                className="pr-16"
                min="0"
                max={userBalance}
                step="0.01"
              />
              <button
                onClick={() => setAmount(userBalance.toString())}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-primary hover:text-primary-hover text-sm font-medium"
              >
                MAX
              </button>
            </div>
          </div>

          <div>
            <label className="block text-muted text-sm mb-2">
              Price protection (%)
            </label>
            <div className="flex gap-2">
              {['0.5', '1.0', '2.0'].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setSlippage(preset)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    slippage === preset
                      ? 'bg-primary text-background'
                      : 'bg-surface-2 text-muted hover:bg-surface-2'
                  }`}
                >
                  {preset}%
                </button>
              ))}
              <Input
                type="number"
                value={slippage}
                onChange={(e) => setSlippage(e.target.value)}
                className="flex-1 h-auto py-2 text-sm"
                min="0"
                max="50"
                step="0.1"
              />
            </div>
          </div>

          {amount && parseFloat(amount) > 0 && (
            <div className="bg-surface-2 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted">Estimated gross</span>
                <span className="text-foreground font-medium">{estimatedGross.toFixed(4)} SOL</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Pool fee ({SELL_POOL_FEE_PERCENT}%)</span>
                <span className="text-warning font-medium">−{poolFee.toFixed(4)} SOL</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Price protection ({slippage}%)</span>
                <span className="text-foreground font-medium">−{slippageAmount.toFixed(4)} SOL</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between">
                <span className="text-muted font-medium">Minimum receive</span>
                <span className="text-foreground font-bold">{minReceive.toFixed(4)} SOL</span>
              </div>
              <p className="text-xs text-muted pt-1">
                The {SELL_POOL_FEE_PERCENT}% pool fee stays in @{creatorUsername}&apos;s supporter pool — not a platform cut.
              </p>
            </div>
          )}

          <Button
            variant="danger"
            onClick={handleSell}
            disabled={!amount || parseFloat(amount) <= 0 || isSelling || parseFloat(amount) > userBalance}
            className="w-full"
          >
            {isSelling ? 'Cashing out...' : 'Cash out support'}
          </Button>
        </div>
      </Card>
    </div>
  );
};
