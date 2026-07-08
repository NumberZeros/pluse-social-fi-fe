import { useState } from 'react';
import { Button, Card, Input } from '../../design-system';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <Card variant="glass" className="rounded-2xl p-8 max-w-md w-full border border-border">
        <h2 className="text-h3 text-foreground mb-2">Send Tip</h2>
        <p className="text-muted text-sm mb-6">Support this creator with SOL</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="tip-amount" className="block text-sm font-medium text-muted mb-2">
              Amount (SOL)
            </label>
            <Input
              id="tip-amount"
              type="number"
              step="0.01"
              min="0.01"
              max="65"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Sending...' : 'Send Tip'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
