import { ImageResponse } from '@vercel/og';

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
          background: 'linear-gradient(135deg, #000000 0%, #0a1a0a 100%)',
          color: 'white',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #ABFE2C, #14C58E)',
            marginBottom: '32px',
          }}
        />
        <div style={{ fontSize: '56px', fontWeight: 800, marginBottom: '16px' }}>
          @{displayName}
        </div>
        <div style={{ fontSize: '24px', color: '#9ca3af' }}>
          Creator on Pulse Social
        </div>
        <div
          style={{
            marginTop: '40px',
            fontSize: '20px',
            color: '#ABFE2C',
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
