import { useProfile } from '../../hooks/useProfile';
import { PublicKey } from '@solana/web3.js';

interface ProfileCardProps {
  ownerPubkey: PublicKey;
}

export function ProfileCard({ ownerPubkey }: ProfileCardProps) {
  const { profile, isLoading, hasProfile } = useProfile(ownerPubkey);

  if (isLoading) {
    return (
      <div className="bg-slate-900 rounded-xl p-6 border border-slate-700 animate-pulse">
        <div className="h-6 bg-slate-700 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-slate-700 rounded w-full mb-2"></div>
        <div className="h-4 bg-slate-700 rounded w-2/3"></div>
      </div>
    );
  }

  if (!hasProfile || !profile) {
    return (
      <div className="bg-slate-900 rounded-xl p-6 border border-slate-700">
        <p className="text-slate-400 text-center">No profile found</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 rounded-xl p-6 border border-slate-700">
      {/* Username */}
      <h3 className="text-2xl font-bold text-white mb-4">
        @{profile.username}
      </h3>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <p className="text-slate-500 text-sm">Tips Received</p>
          <p className="text-white font-semibold">
            {(profile.totalTipsReceived.toNumber() / 1e9).toFixed(3)} SOL
          </p>
        </div>
        <div>
          <p className="text-slate-500 text-sm">Tips Sent</p>
          <p className="text-white font-semibold">
            {(profile.totalTipsSent.toNumber() / 1e9).toFixed(3)} SOL
          </p>
        </div>
        <div>
          <p className="text-slate-500 text-sm">Followers</p>
          <p className="text-white font-semibold">
            {profile.followersCount.toNumber()}
          </p>
        </div>
        <div>
          <p className="text-slate-500 text-sm">Following</p>
          <p className="text-white font-semibold">
            {profile.followingCount.toNumber()}
          </p>
        </div>
      </div>
    </div>
  );
}
