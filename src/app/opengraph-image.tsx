import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Signa Labs - Learn to Code by Doing';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f0a1a 0%, #1a1025 40%, #0f0a1a 100%)',
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 80,
            height: 80,
            borderRadius: 20,
            background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
            marginBottom: 32,
          }}
        >
          <span style={{ color: 'white', fontSize: 48, fontWeight: 700 }}>S</span>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 56,
            fontWeight: 800,
            color: 'white',
            letterSpacing: '-0.03em',
            marginBottom: 16,
          }}
        >
          Signa Labs
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 24,
            color: '#a78bfa',
            letterSpacing: '-0.01em',
          }}
        >
          Learn to Code by Doing
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: 18,
            color: '#9ca3af',
            marginTop: 16,
            maxWidth: 600,
            textAlign: 'center',
          }}
        >
          AI-powered coding exercises that adapt to your skill level
        </div>
      </div>
    ),
    { ...size }
  );
}
