import { Crown, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

interface SubscriptionBadgeProps {
  isSubscriberOnly?: boolean;
  tierName?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SubscriptionBadge = ({
  isSubscriberOnly = false,
  tierName,
  size = 'md',
  className = '',
}: SubscriptionBadgeProps) => {
  if (!isSubscriberOnly) return null;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-1.5 bg-gradient-to-r from-[#D4AF37] to-[#ABFE2C] text-black rounded-full font-bold ${sizeClasses[size]} ${className}`}
    >
      <Crown className={iconSizes[size]} />
      {tierName ? tierName : 'Subscribers Only'}
    </motion.div>
  );
};

export const SubscriberOnlyOverlay = ({ tierName }: { tierName?: string }) => {
  return (
    <div className="absolute inset-0 backdrop-blur-sm bg-black/40 rounded-xl flex items-center justify-center z-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center px-6 py-4"
      >
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#ABFE2C] text-black rounded-full font-bold mb-3">
          <Lock className="w-5 h-5" />
          Subscribers Only
        </div>
        <p className="text-white text-sm">
          {tierName
            ? `Subscribe to ${tierName} tier to view this content`
            : 'Subscribe to view this content'}
        </p>
      </motion.div>
    </div>
  );
};

export default SubscriptionBadge;
