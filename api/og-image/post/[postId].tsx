import { ImageResponse } from '@vercel/og';

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
          background: 'linear-gradient(135deg, #000000 0%, #0a1a0a 100%)',
          color: 'white',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: '#ABFE2C',
            }}
          />
          <span style={{ fontSize: '28px', fontWeight: 700, color: '#ABFE2C' }}>
            Pulse Social
          </span>
        </div>
        <div style={{ fontSize: '48px', fontWeight: 800, lineHeight: 1.2, marginBottom: '24px' }}>
          {title.slice(0, 80)}
        </div>
        <div style={{ fontSize: '24px', color: '#9ca3af', lineHeight: 1.4 }}>
          {description}
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
