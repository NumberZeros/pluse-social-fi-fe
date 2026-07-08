import { useState } from 'react';
import { useProfile } from '../../hooks/useProfile';
import { Button, Input } from '../../design-system';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm">
      <div className="bg-surface rounded-ds-xl p-8 max-w-md w-full mx-4 border border-border">
        <h2 className="text-h3 text-foreground mb-6">Create Your Profile</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username Input */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-muted mb-2">
              Username
            </label>
            <Input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="satoshi"
              maxLength={32}
              required
              disabled={isCreating}
            />
            <p className="text-xs text-muted mt-1">Max 32 characters</p>
          </div>



          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isCreating} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating || !username.trim()} className="flex-1">
              {isCreating ? 'Creating...' : 'Create Profile'}
            </Button>
          </div>
        </form>

        {/* Info Text */}
        <p className="text-xs text-muted mt-6 text-center">
          Creating a profile costs ~0.01 SOL for account rent
        </p>
      </div>
    </div>
  );
}
