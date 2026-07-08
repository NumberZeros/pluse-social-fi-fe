import { Hero } from '../components/landing/Hero';
import { Features } from '../components/landing/Features';
import { HowItWorks } from '../components/landing/HowItWorks';
import { Community } from '../components/landing/Community';
import { CTA } from '../components/landing/CTA';
import { SEO } from '../components/SEO';
import { PAGE_SEO_CONFIG } from '../lib/seo/page-config';
import { buildHomepageSchema } from '../lib/seo/schema';
import { SiteLayout } from '../components/layout/AppLayout';

export function Landing() {
  const homeConfig = PAGE_SEO_CONFIG['/'];

  return (
    <SiteLayout fullBleed>
      <SEO
        title={homeConfig.title}
        description={homeConfig.description}
        keywords={homeConfig.keywords}
        image={homeConfig.ogImage}
        url="/"
        schema={buildHomepageSchema()}
      />
      <div className="fixed inset-0 z-0 mesh-gradient-lens opacity-40 pointer-events-none" />

      <Hero />
      <Features />
      <HowItWorks />
      <Community />
      <CTA />
    </SiteLayout>
  );
}
