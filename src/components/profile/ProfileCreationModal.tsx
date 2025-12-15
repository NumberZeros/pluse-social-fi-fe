import { useState } from 'react';
import { useProfile } from '../../hooks/useProfile';

interface ProfileCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileCreationModal({ isOpen, onClose }: ProfileCreationModalProps) {
  const [username, setUsername] = useState('');
  const { createProfile, isCreating } = useProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      return;
    }

    try {
      await createProfile({ username: username.trim() });
      setUsername('');
      onClose();
    } catch (error) {
      // Error already handled by useSocialFi hook
      console.error('Profile creation failed:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-slate-900 rounded-xl p-8 max-w-md w-full mx-4 border border-slate-700">
        <h2 className="text-2xl font-bold text-white mb-6">Create Your Profile</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username Input */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="satoshi"
              maxLength={32}
              required
              disabled={isCreating}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-solana-green)] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p className="text-xs text-slate-500 mt-1">Max 32 characters</p>
          </div>



          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isCreating}
              className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating || !username.trim()}
              className="flex-1 px-6 py-3 bg-[var(--color-solana-green)] hover:bg-[#9FE51C] text-black rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? 'Creating...' : 'Create Profile'}
            </button>
          </div>
        </form>

        {/* Info Text */}
        <p className="text-xs text-slate-400 mt-6 text-center">
          Creating a profile costs ~0.01 SOL for account rent
        </p>
      </div>
    </div>
  );
}
