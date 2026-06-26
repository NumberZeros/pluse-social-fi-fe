import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export function Community() {
  return (
    <section className="relative z-10 py-20 px-6 max-w-[1400px] mx-auto border-t border-white/5">
      <div className="grid md:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-8">
            Join early on{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-solana-green)] to-blue-400">
              devnet
            </span>
          </h2>
          <p className="text-lg text-gray-400 mb-10 leading-relaxed">
            We&apos;re building in public on Solana devnet. Be among the first creators to
            launch a supporter community.
          </p>

          <div className="space-y-6">
            <CommunityItem
              icon="🎨"
              title="Creators"
              description="Launch Supporter Shares, post exclusive content, and earn directly."
              link="/dashboard"
              linkText="Open Dashboard"
              isInternal
            />
            <CommunityItem
              icon="👨‍💻"
              title="Developers"
              description="Contribute to the open-source frontend and on-chain program."
              link="https://github.com/NumberZeros/pluse-social-fi-fe"
              linkText="GitHub"
            />
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-[var(--color-solana-green)]/20 to-purple-500/20 rounded-full blur-3xl opacity-30" />
          <div className="relative bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
            <h3 className="text-2xl font-bold mb-4">Early access</h3>
            <p className="text-gray-400 leading-relaxed mb-6">
              Building on devnet — be an early creator. Real on-chain stats will appear here
              as the network grows.
            </p>
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 text-[var(--color-solana-green)] font-medium hover:underline"
            >
              Explore creators →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function CommunityItem({
  icon,
  title,
  description,
  link,
  linkText,
  isInternal,
}: {
  icon: string;
  title: string;
  description: string;
  link: string;
  linkText: string;
  isInternal?: boolean;
}) {
  return (
    <motion.div whileHover={{ x: 5 }} className="flex gap-4 items-start">
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
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-solana-green)] text-sm font-medium hover:underline"
          >
            {linkText} →
          </a>
        )}
      </div>
    </motion.div>
  );
}
