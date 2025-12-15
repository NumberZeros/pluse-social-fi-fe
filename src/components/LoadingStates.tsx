import { motion } from 'framer-motion';

export function PostSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 border-b border-white/10"
    >
      <div className="flex gap-4">
        {/* Avatar Skeleton */}
        <div className="w-12 h-12 rounded-full bg-white/10 animate-pulse" />

        <div className="flex-1 space-y-3">
          {/* Header Skeleton */}
          <div className="flex items-center gap-2">
            <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
            <div className="h-3 w-12 bg-white/10 rounded animate-pulse" />
          </div>

          {/* Content Skeleton */}
          <div className="space-y-2">
            <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
            <div className="h-4 w-3/4 bg-white/10 rounded animate-pulse" />
          </div>

          {/* Actions Skeleton */}
          <div className="flex items-center gap-6 mt-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
                <div className="h-3 w-8 bg-white/10 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function ProfileSkeleton() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Banner Skeleton */}
      <div className="h-48 bg-white/10 animate-pulse" />

      {/* Profile Info Skeleton */}
      <div className="px-6 -mt-16">
        <div className="flex justify-between items-start mb-6">
          <div className="w-32 h-32 rounded-full bg-white/10 border-4 border-black animate-pulse" />
          <div className="h-10 w-32 bg-white/10 rounded-full animate-pulse" />
        </div>

        <div className="space-y-3">
          <div className="h-6 w-48 bg-white/10 rounded animate-pulse" />
          <div className="h-4 w-32 bg-white/10 rounded animate-pulse" />
          <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
        </div>

        {/* Stats Skeleton */}
        <div className="flex gap-6 mt-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-1">
              <div className="h-6 w-16 bg-white/10 rounded animate-pulse" />
              <div className="h-4 w-20 bg-white/10 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export function CardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass-card rounded-2xl p-6 border border-white/10"
    >
      <div className="space-y-4">
        <div className="h-6 w-3/4 bg-white/10 rounded animate-pulse" />
        <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
        <div className="h-4 w-5/6 bg-white/10 rounded animate-pulse" />
        <div className="flex gap-4 mt-4">
          <div className="h-10 flex-1 bg-white/10 rounded animate-pulse" />
          <div className="h-10 w-32 bg-white/10 rounded animate-pulse" />
        </div>
      </div>
    </motion.div>
  );
}

export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex items-center justify-center p-4">
      <svg
        className={`${sizeClasses[size]} animate-spin text-[#ABFE2C]`}
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
}
