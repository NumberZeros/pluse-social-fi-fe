import { useState } from 'react';

interface TipPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (amount: number) => void;
  isSubmitting?: boolean;
}

export function TipPostModal({ isOpen, onClose, onSubmit, isSubmitting }: TipPostModalProps) {
  const [amount, setAmount] = useState('0.1');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) return;
    onSubmit(parsed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="glass-card rounded-2xl p-8 max-w-md w-full border border-white/10">
        <h2 className="text-2xl font-bold text-white mb-2">Send Tip</h2>
        <p className="text-gray-400 text-sm mb-6">Support this creator with SOL</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="tip-amount" className="block text-sm font-medium text-gray-300 mb-2">
              Amount (SOL)
            </label>
            <input
              id="tip-amount"
              type="number"
              step="0.01"
              min="0.01"
              max="65"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white"
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-white/5 rounded-lg font-bold hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-[var(--color-solana-green)] text-black rounded-lg font-bold disabled:opacity-50"
            >
              {isSubmitting ? 'Sending...' : 'Send Tip'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
