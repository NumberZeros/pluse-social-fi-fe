import { motion } from 'framer-motion';

export function Pulse3D({ className = "" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className} w-[500px] h-[500px]`}>
      <div className="relative w-64 h-64 perspective-[1000px] transform-style-3d">
        {/* Central Beating Core - The Heart of Pulse */}
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 m-auto w-32 h-32 rounded-full transform-style-3d z-20"
        >
           <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-solana-green)] to-[#ABFE2C] rounded-full blur-[20px] opacity-60" />
           <div className="absolute inset-0 bg-white/20 rounded-full blur-md" />
           {/* Inner geometric core */}
           <div className="absolute inset-4 m-auto bg-black/80 rounded-full border border-[var(--color-solana-green)] flex items-center justify-center overflow-hidden">
               <motion.div 
                 animate={{ rotate: 360 }}
                 transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                 className="w-full h-full bg-gradient-to-tr from-transparent via-[var(--color-solana-green)]/30 to-transparent"
               />
               <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-white rounded-full mix-blend-overlay blur-sm animate-pulse" />
               </div>
           </div>
        </motion.div>

        {/* Gyroscopic Rings - Represents Connectivity */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`ring-${i}`}
            className="absolute inset-0 m-auto border-[1px] border-[var(--color-solana-green)]/40 rounded-full transform-style-3d"
            style={{
              width: `${240 + i * 60}px`,
              height: `${240 + i * 60}px`,
            }}
            animate={{ rotateX: 360, rotateY: 360, rotateZ: 360 }}
            transition={{
              duration: 15 + i * 5,
              repeat: Infinity,
              ease: "linear",
              delay: i * 2, // Staggered rotation
            }}
          >
             {/* Data Nodes on Rings */}
             <div className="absolute top-0 left-1/2 w-3 h-3 -ml-1.5 -mt-1.5 bg-white rounded-full shadow-[0_0_15px_var(--color-solana-green)]" />
             <div className="absolute bottom-0 left-1/2 w-2 h-2 -ml-1 -mb-1 bg-[var(--color-solana-purple)] rounded-full shadow-[0_0_10px_var(--color-solana-purple)]" />
          </motion.div>
        ))}

        {/* Outer Tech Shell - Glassmorphism segments */}
        <motion.div
          animate={{ rotateZ: -360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 m-auto w-[400px] h-[400px] border border-white/5 rounded-full flex items-center justify-center transform-style-3d"
        >
             <div className="absolute top-0 w-[1px] h-full bg-gradient-to-b from-transparent via-white/20 to-transparent transform rotate-45" />
             <div className="absolute top-0 w-[1px] h-full bg-gradient-to-b from-transparent via-white/20 to-transparent transform -rotate-45" />
        </motion.div>

        {/* Ethereal Glow - Atmosphere */}
        <div className="absolute inset-0 m-auto w-[500px] h-[500px] bg-gradient-to-tr from-[var(--color-solana-green)]/5 via-transparent to-[var(--color-solana-purple)]/5 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
      </div>
    </div>
  );
}
