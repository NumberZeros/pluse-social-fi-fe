import { Link } from 'react-router-dom';
import { getNetworkLabel } from '../../utils/constants';
import { getButtonClassName, MotionCard } from '../../design-system';

const STEPS = [
  { step: '01', title: 'Create profile', description: 'Connect your wallet and claim your on-chain creator identity.' },
  { step: '02', title: 'Launch Supporter Shares', description: 'Initialize your supporter pool so fans can back you.' },
  { step: '03', title: 'Post exclusive content', description: 'Share public updates or gate posts to supporters only.' },
  { step: '04', title: 'Fans support & unlock', description: 'Supporters buy shares, unlock your exclusive feed, and can tip you.' },
];

export function HowItWorks() {
  return (
    <section className="relative z-10 py-24 px-6 max-w-[1400px] mx-auto border-t border-border">
      <div className="text-center mb-16">
        <h2 className="text-h2 font-display font-bold mb-4">
          How it works for creators
        </h2>
        <p className="text-body text-muted max-w-2xl mx-auto">
          Go from zero to earning in four steps — about two minutes on {getNetworkLabel()}.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {STEPS.map((item, index) => (
          <MotionCard
            key={item.step}
            variant="glass"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="rounded-2xl p-8 border border-border flex gap-6"
          >
            <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-black text-xl">
              {item.step}
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">{item.title}</h3>
              <p className="text-muted leading-relaxed">{item.description}</p>
            </div>
          </MotionCard>
        ))}
      </div>

      <div className="text-center mt-12">
        <Link to="/dashboard" className={getButtonClassName('secondary', 'md')}>
          Start as creator →
        </Link>
      </div>
    </section>
  );
}
