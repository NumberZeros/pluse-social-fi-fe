import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Users, Wallet, Shield } from 'lucide-react';

export function Features() {
  return (
    <section id="for-creators" className="relative z-10 py-32 px-6 max-w-[1400px] mx-auto">
      <div className="text-center mb-20">
        <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
          Built for <span className="text-[var(--color-solana-green)]">creators</span>
        </h2>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          One loop: post exclusive content → fans support you → supporters unlock access.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <FeatureCard
          icon={<Users className="w-8 h-8" />}
          title="Supporter Shares"
          description="Fans support you; early supporters pay less as your community grows. Supporters unlock exclusive posts."
          delay={0}
        />
        <FeatureCard
          icon={<Wallet className="w-8 h-8" />}
          title="Direct earnings"
          description="Tips go to your wallet; share support flows to your on-chain pool — no platform middleman."
          delay={0.1}
        />
        <FeatureCard
          icon={<Shield className="w-8 h-8" />}
          title="Own your audience"
          description="On-chain profile and followers you control, not a platform algorithm."
          delay={0.2}
        />
      </div>

      <div className="text-center mt-16">
        <Link
          to="/what"
          className="inline-flex items-center gap-2 text-[var(--color-solana-green)] hover:text-white transition-colors border-b border-[var(--color-solana-green)]/30 hover:border-white pb-1"
        >
          Learn how Supporter Shares work <span>→</span>
        </Link>
      </div>
    </section>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -5 }}
      className="group p-8 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-[var(--color-solana-green)]/30 transition-all duration-300"
    >
      <div className="w-16 h-16 rounded-2xl bg-[var(--color-solana-green)]/10 flex items-center justify-center mb-6 text-[var(--color-solana-green)] group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-2xl font-bold mb-4">{title}</h3>
      <p className="text-base text-gray-400 leading-relaxed">{description}</p>
    </motion.div>
  );
}
