import { Link } from 'react-router-dom';

export function CTA() {
  return (
    <section className="relative z-10 py-32 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-5xl md:text-6xl font-display font-bold mb-8 tracking-tight">
          Ready to <span className="text-white">dive in?</span>
        </h2>
        <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
          Join thousands of other users building their on-chain social graph.
          It's free, fast, and fully decentralized.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
             <Link
               to="/feed"
               className="px-10 py-4 bg-white text-black rounded-full font-bold text-lg hover:scale-105 transition-transform hover:bg-[var(--color-solana-green)]"
             >
               Launch App
             </Link>
             <a
               href="https://github.com/NumberZeros/pluse-social-fi-fe"
               target="_blank"
               rel="noopener noreferrer"
               className="px-10 py-4 border border-white/20 rounded-full font-bold text-lg hover:bg-white/10 transition-colors"
             >
               View Source
             </a>
        </div>
      </div>
    </section>
  );
}
