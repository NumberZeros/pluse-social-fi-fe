import { useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PulseLogo, Card } from '../../design-system';

const LEARN_CHIPS = [
  { label: 'What is Pulse?', href: '/what' },
  { label: 'Why Pulse?', href: '/why' },
  { label: 'User Guide', href: '/guide' },
] as const;

type AccordionSection = 'product' | 'community' | 'developers';

function FooterLink({
  href,
  label,
  external,
}: {
  href: string;
  label: string;
  external?: boolean;
}) {
  const className =
    'text-muted hover:text-primary transition-colors text-sm';

  if (external || href.startsWith('http')) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {label}
      </a>
    );
  }

  return (
    <Link to={href} className={className}>
      {label}
    </Link>
  );
}

function AccordionSection({
  title,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className="border-b border-border last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between py-4 text-left"
        aria-expanded={isOpen}
      >
        <h3 className="font-bold text-foreground">{title}</h3>
        <svg
          className={`w-5 h-5 text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && <ul className="space-y-3 pb-4">{children}</ul>}
    </div>
  );
}

export function Footer() {
  const location = useLocation();
  const [openSections, setOpenSections] = useState<Record<AccordionSection, boolean>>({
    product: false,
    community: false,
    developers: false,
  });

  const toggleSection = (section: AccordionSection) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const footerLinks = {
    product: [
      { label: 'Feed', href: '/feed' },
      { label: 'Explore', href: '/explore' },
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Creator Guide', href: '/guide' },
    ],
    learn: [
      { label: 'What is Pulse?', href: '/what' },
      { label: 'Why Pulse?', href: '/why' },
      { label: 'How Supporter Shares work', href: '/what#how-it-works' },
      { label: 'User Guide', href: '/guide' },
    ],
    community: [
      { label: 'Discord', href: 'https://discord.gg/pulse' },
      { label: 'Twitter', href: 'https://twitter.com/pulsesocial' },
      { label: 'Telegram', href: 'https://t.me/pulsesocial' },
    ],
    developers: [
      { label: 'GitHub', href: 'https://github.com/NumberZeros/pluse-social-fi-fe' },
      { label: 'Documentation', href: '/what' },
    ],
  };

  const socialLinks = [
    {
      label: 'Twitter',
      href: 'https://twitter.com/pulsesocial',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      label: 'Discord',
      href: 'https://discord.gg/pulse',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
        </svg>
      ),
    },
    {
      label: 'GitHub',
      href: 'https://github.com/NumberZeros/pluse-social-fi-fe',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      label: 'Telegram',
      href: 'https://t.me/pulsesocial',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
        </svg>
      ),
    },
  ];

  const isLearnChipActive = (href: string) => {
    const path = href.split('#')[0];
    return location.pathname === path;
  };

  const hasMobileNav = location.pathname !== '/';

  return (
    <footer
      className={`bg-background border-t border-border pt-12 lg:pt-20 relative overflow-hidden ${
        hasMobileNav
          ? 'pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pb-10'
          : 'pb-8 lg:pb-10'
      }`}
    >
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-8 lg:gap-12 mb-10 lg:mb-16">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center mb-4 lg:mb-6 group">
              <PulseLogo variant="horizontal" size={32} />
            </Link>
            <p className="text-muted mb-6 lg:mb-8 max-w-sm leading-relaxed text-sm lg:text-base">
              The creator platform where fans become supporters — built on Solana.
            </p>

            <Card variant="glass" className="lg:hidden mb-6 rounded-2xl p-4 border border-border">
              <p className="text-xs font-bold uppercase tracking-wider text-muted mb-3">Learn</p>
              <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
                {LEARN_CHIPS.map((chip) => (
                  <Link
                    key={chip.href}
                    to={chip.href}
                    className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                      isLearnChipActive(chip.href)
                        ? 'bg-primary/10 border-primary/30 text-primary'
                        : 'bg-surface-2 border-border text-muted hover:bg-surface-2 hover:text-foreground'
                    }`}
                  >
                    {chip.label}
                  </Link>
                ))}
              </div>

              <div className="mt-4 border-t border-border">
                <AccordionSection
                  title="Product"
                  isOpen={openSections.product}
                  onToggle={() => toggleSection('product')}
                >
                  {footerLinks.product.map((link) => (
                    <li key={link.label}>
                      <FooterLink href={link.href} label={link.label} />
                    </li>
                  ))}
                </AccordionSection>
                <AccordionSection
                  title="Community"
                  isOpen={openSections.community}
                  onToggle={() => toggleSection('community')}
                >
                  {footerLinks.community.map((link) => (
                    <li key={link.label}>
                      <FooterLink href={link.href} label={link.label} external />
                    </li>
                  ))}
                </AccordionSection>
                <AccordionSection
                  title="Developers"
                  isOpen={openSections.developers}
                  onToggle={() => toggleSection('developers')}
                >
                  {footerLinks.developers.map((link) => (
                    <li key={link.label}>
                      <FooterLink
                        href={link.href}
                        label={link.label}
                        external={link.href.startsWith('http')}
                      />
                    </li>
                  ))}
                </AccordionSection>
              </div>
            </Card>

            <div className="flex gap-3 justify-start">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center text-muted hover:bg-surface-2 hover:text-foreground transition-all hover:scale-110"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          <div className="hidden lg:col-span-4 lg:grid grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-foreground mb-6">Product</h3>
              <ul className="space-y-4">
                {footerLinks.product.map((link) => (
                  <li key={link.label}>
                    <FooterLink href={link.href} label={link.label} />
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-foreground mb-6">Learn</h3>
              <ul className="space-y-4">
                {footerLinks.learn.map((link) => (
                  <li key={link.label}>
                    <FooterLink href={link.href} label={link.label} />
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-foreground mb-6">Community</h3>
              <ul className="space-y-4">
                {footerLinks.community.map((link) => (
                  <li key={link.label}>
                    <FooterLink href={link.href} label={link.label} external />
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-foreground mb-6">Developers</h3>
              <ul className="space-y-4">
                {footerLinks.developers.map((link) => (
                  <li key={link.label}>
                    <FooterLink
                      href={link.href}
                      label={link.label}
                      external={link.href.startsWith('http')}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>

        <div className="pt-6 lg:pt-8 border-t border-border flex flex-col items-center gap-3 lg:flex-row lg:justify-between lg:gap-4">
          <div className="text-muted text-xs lg:text-sm text-center lg:text-left">
            © 2025 Pulse Social. All rights reserved.
          </div>
          <div className="text-xs lg:text-sm text-muted text-center">
            Designed & Built by{' '}
            <a
              href="https://www.linkedin.com/in/th%E1%BB%8D-nguy%E1%BB%85n-941348360/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              Tho Nguyen
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
