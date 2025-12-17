import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export function Community() {
  return (
    <section className="relative z-10 py-20 px-6 max-w-[1400px] mx-auto border-t border-white/5">
      <div className="grid md:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-8">
            Join the <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-solana-green)] to-blue-400">Revolution</span>
          </h2>
          <p className="text-lg text-gray-400 mb-10 leading-relaxed">
            We are building in public. Whether you are a developer, a creator, or an investor, there is a place for you in the Pulse ecosystem.
          </p>

          <div className="space-y-6">
            <CommunityItem
              icon="👨‍💻"
              title="Developers"
              description="Contribute to the core protocol. Build specialized clients."
              link="https://github.com/NumberZeros/pluse-social-fi-fe"
              linkText="GitHub"
            />
            <CommunityItem
              icon="🚀"
              title="Early Adopters"
              description="Test the network, give feedback, and earn retrospective rewards."
              link="/airdrop"
              linkText="Join Airdrop"
              isInternal
            />
          </div>
        </div>

        <div className="relative">
           {/* Decorative Elements */}
           <div className="absolute -inset-4 bg-gradient-to-r from-[var(--color-solana-green)]/20 to-purple-500/20 rounded-full blur-3xl opacity-30" />
           <div className="relative bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
             <h3 className="text-2xl font-bold mb-6">Live Network Stats</h3>
             <div className="grid grid-cols-2 gap-6">
               <StatBox label="Transactions" value="2.4M+" />
               <StatBox label="Active Wallets" value="85K+" />
               <StatBox label="Posts Created" value="120K+" />
               <StatBox label="Total Value Locked" value="$4.2M" />
             </div>
           </div>
        </div>
      </div>
    </section>
  );
}

function CommunityItem({ icon, title, description, link, linkText, isInternal }: { icon: string, title: string, description: string, link: string, linkText: string, isInternal?: boolean }) {
  return (
    <motion.div 
      whileHover={{ x: 5 }}
      className="flex gap-4 items-start"
    >
      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl shrink-0">
        {icon}
      </div>
      <div>
        <h4 className="text-lg font-bold mb-1">{title}</h4>
        <p className="text-sm text-gray-400 mb-2">{description}</p>
        {isInternal ? (
          <Link to={link} className="text-[var(--color-solana-green)] text-sm font-medium hover:underline">
            {linkText} →
          </Link>
        ) : (
          <a href={link} target="_blank" rel="noopener noreferrer" className="text-[var(--color-solana-green)] text-sm font-medium hover:underline">
            {linkText} →
          </a>
        )}
      </div>
    </motion.div>
  );
}

function StatBox({ label, value }: { label: string, value: string }) {
  return (
    <div className="p-4 rounded-xl bg-black/40 border border-white/5">
      <div className="text-2xl font-mono font-bold text-white mb-1">{value}</div>
      <div className="text-xs text-gray-500 uppercase tracking-wider">{label}</div>
    </div>
  );
}
