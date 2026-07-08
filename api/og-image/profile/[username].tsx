import { ImageResponse } from '@vercel/og';
import { OG_BACKGROUND, OG_COLORS, OG_MARK } from '../../_lib/og-brand';

export const config = {
  runtime: 'nodejs',
};

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const segments = url.pathname.split('/');
  const username = decodeURIComponent(segments[segments.length - 1] || '');

  const displayName = username || 'Creator';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '60px',
          background: OG_BACKGROUND,
          color: OG_COLORS.foreground,
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <svg width="120" height="120" viewBox={OG_MARK.viewBox} style={{ marginBottom: '32px' }}>
          <path d={OG_MARK.squircle} fill={OG_COLORS.surface} />
          <path d={OG_MARK.squircle} fill="none" stroke={OG_COLORS.border} strokeWidth="1" />
          <path d={OG_MARK.pTop} fill={OG_COLORS.primary} fillRule="evenodd" />
          <path d={OG_MARK.pLeg} fill={OG_COLORS.primary} />
        </svg>
        <div style={{ fontSize: '56px', fontWeight: 800, marginBottom: '16px' }}>
          @{displayName}
        </div>
        <div style={{ fontSize: '24px', color: OG_COLORS.muted }}>
          Creator on Pulse Social
        </div>
        <div
          style={{
            marginTop: '40px',
            fontSize: '20px',
            color: OG_COLORS.primary,
            fontWeight: 600,
          }}
        >
          pulsesol.xyz
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
