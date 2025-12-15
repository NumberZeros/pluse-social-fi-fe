import { useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useShares } from '../../hooks/useShares';

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
  const [slippage, setSlippage] = useState('5'); // 5% default
  const { buyShares, isBuying, calculatePriceForAmount } = useShares(creatorPubkey);
  const [calculatedPrice, setCalculatedPrice] = useState<number>(0);

  const handleAmountChange = async (value: string) => {
    setAmount(value);
    const amountNum = parseInt(value);
    if (amountNum > 0) {
      const price = await calculatePriceForAmount(amountNum);
      setCalculatedPrice(price / 1e9); // Convert to SOL
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amountNum = parseInt(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return;
    }

    try {
      // Calculate max price with slippage
      const maxPrice = calculatedPrice * (1 + parseFloat(slippage) / 100);
      await buyShares({ amount: amountNum, maxPrice });
      setAmount('1');
      onClose();
    } catch (error) {
      console.error('Buy shares failed:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-slate-900 rounded-xl p-8 max-w-md w-full mx-4 border border-slate-700">
        <h2 className="text-2xl font-bold text-white mb-2">
          Buy @{creatorUsername} Shares
        </h2>
        <p className="text-slate-400 text-sm mb-6">
          Invest in this creator's success
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount Input */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-slate-300 mb-2">
              Number of Shares
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="1"
              min="1"
              step="1"
              required
              disabled={isBuying}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-solana-green)] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <div className="flex gap-2 mt-2">
              {[1, 5, 10, 50].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleAmountChange(preset.toString())}
                  disabled={isBuying}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded border border-slate-700 transition-colors disabled:opacity-50"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Slippage Tolerance */}
          <div>
            <label htmlFor="slippage" className="block text-sm font-medium text-slate-300 mb-2">
              Slippage Tolerance (%)
            </label>
            <input
              type="number"
              id="slippage"
              value={slippage}
              onChange={(e) => setSlippage(e.target.value)}
              placeholder="5"
              min="0.1"
              max="50"
              step="0.5"
              disabled={isBuying}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-solana-green)] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Price Estimate */}
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-400 text-sm">Estimated Cost</span>
              <span className="text-white font-semibold">
                {calculatedPrice.toFixed(4)} SOL
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">Max Price (with slippage)</span>
              <span className="text-[var(--color-solana-green)] font-semibold">
                {(calculatedPrice * (1 + parseFloat(slippage) / 100)).toFixed(4)} SOL
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isBuying}
              className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isBuying || !amount || parseInt(amount) <= 0}
              className="flex-1 px-6 py-3 bg-[var(--color-solana-green)] hover:bg-[#9FE51C] text-black rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isBuying ? 'Buying...' : 'Buy Shares'}
            </button>
          </div>
        </form>

        {/* Info */}
        <p className="text-xs text-slate-400 mt-4 text-center">
          Price increases as more shares are bought (bonding curve)
        </p>
      </div>
    </div>
  );
}
