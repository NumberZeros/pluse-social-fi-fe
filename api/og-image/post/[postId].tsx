import { ImageResponse } from '@vercel/og';
import { OG_BACKGROUND, OG_COLORS, OG_MARK } from '../../_lib/og-brand';

export const config = {
  runtime: 'nodejs',
};

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const segments = url.pathname.split('/');
  const postId = segments[segments.length - 1] || '';

  const title = postId ? `Post ${postId.slice(0, 8)}…` : 'Pulse Social Post';
  const description = 'View on Pulse Social — Supporter Shares on Solana';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px',
          background: OG_BACKGROUND,
          color: OG_COLORS.foreground,
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          <svg width="56" height="56" viewBox={OG_MARK.viewBox}>
            <path d={OG_MARK.squircle} fill={OG_COLORS.surface} />
            <path d={OG_MARK.squircle} fill="none" stroke={OG_COLORS.border} strokeWidth="1" />
            <path d={OG_MARK.pTop} fill={OG_COLORS.primary} fillRule="evenodd" />
            <path d={OG_MARK.pLeg} fill={OG_COLORS.primary} />
          </svg>
          <span style={{ fontSize: '30px', fontWeight: 700, color: OG_COLORS.foreground }}>
            Pulse Social
          </span>
        </div>
        <div style={{ fontSize: '48px', fontWeight: 800, lineHeight: 1.2, marginBottom: '24px' }}>
          {title.slice(0, 80)}
        </div>
        <div style={{ fontSize: '24px', color: OG_COLORS.muted, lineHeight: 1.4 }}>
          {description}
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
