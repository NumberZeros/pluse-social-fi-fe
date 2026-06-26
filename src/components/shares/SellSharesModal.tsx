import { useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useShares } from '../../hooks/useShares';
import { toast } from 'react-hot-toast';

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
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="glass-card rounded-xl p-6 max-w-md w-full border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            Cash out support — @{creatorUsername}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Your Balance</p>
            <p className="text-white text-xl font-bold">{userBalance} Supporter Shares</p>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Base Price</p>
            <p className="text-white text-xl font-bold">
              {shares?.basePrice ? (Number(shares.basePrice) / 1e9).toFixed(4) : '0'} SOL
            </p>
          </div>

          <div>
            <label className="block text-gray-300 text-sm mb-2">
              Amount to sell
            </label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-solana-green)]"
                min="0"
                max={userBalance}
                step="0.01"
              />
              <button
                onClick={() => setAmount(userBalance.toString())}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-solana-green)] hover:text-[#9FE51C] text-sm font-medium"
              >
                MAX
              </button>
            </div>
          </div>

          <div>
            <label className="block text-gray-300 text-sm mb-2">
              Price protection (%)
            </label>
            <div className="flex gap-2">
              {['0.5', '1.0', '2.0'].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setSlippage(preset)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    slippage === preset
                      ? 'bg-[var(--color-solana-green)] text-black'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {preset}%
                </button>
              ))}
              <input
                type="number"
                value={slippage}
                onChange={(e) => setSlippage(e.target.value)}
                className="flex-1 bg-gray-800 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-solana-green)]"
                min="0"
                max="50"
                step="0.1"
              />
            </div>
          </div>

          {amount && parseFloat(amount) > 0 && (
            <div className="bg-gray-800 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Estimated gross</span>
                <span className="text-white font-medium">{estimatedGross.toFixed(4)} SOL</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Pool fee ({SELL_POOL_FEE_PERCENT}%)</span>
                <span className="text-amber-400 font-medium">−{poolFee.toFixed(4)} SOL</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Price protection ({slippage}%)</span>
                <span className="text-white font-medium">−{slippageAmount.toFixed(4)} SOL</span>
              </div>
              <div className="border-t border-gray-700 pt-2 flex justify-between">
                <span className="text-gray-300 font-medium">Minimum receive</span>
                <span className="text-white font-bold">{minReceive.toFixed(4)} SOL</span>
              </div>
              <p className="text-xs text-gray-500 pt-1">
                The {SELL_POOL_FEE_PERCENT}% pool fee stays in @{creatorUsername}&apos;s supporter pool — not a platform cut.
              </p>
            </div>
          )}

          <button
            onClick={handleSell}
            disabled={!amount || parseFloat(amount) <= 0 || isSelling || parseFloat(amount) > userBalance}
            className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold py-3 px-6 rounded-lg transition"
          >
            {isSelling ? 'Cashing out...' : 'Cash out support'}
          </button>
        </div>
      </div>
    </div>
  );
};
