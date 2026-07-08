import { useId, type SVGProps } from 'react';
import {
  MARK_VIEWBOX,
  P_GRADIENT_STOPS,
  P_LEG_PATH,
  P_TOP_PATH,
  SQUIRCLE_PATH,
} from './mark-paths.ts';

export type PulseLogoVariant = 'horizontal' | 'stacked' | 'mark-only';
export type PulseLogoTone = 'color' | 'white' | 'black' | 'solid-green';

export interface PulseLogoProps {
  variant?: PulseLogoVariant;
  tone?: PulseLogoTone;
  className?: string;
  markClassName?: string;
  /** Tile size in px (default 32) */
  size?: number;
}

interface MarkProps extends SVGProps<SVGSVGElement> {
  tone: PulseLogoTone;
}

function PulseMarkSvg({ tone, className, ...props }: MarkProps) {
  const gradId = useId();

  const tileFill =
    tone === 'white' ? 'var(--color-foreground)' : 'var(--color-surface)';

  const pFill =
    tone === 'color'
      ? `url(#${gradId})`
      : tone === 'white'
        ? 'var(--color-background)'
        : tone === 'black'
          ? 'var(--color-foreground)'
          : 'var(--color-primary)';

  return (
    <svg
      viewBox={MARK_VIEWBOX}
      fill="none"
      aria-hidden="true"
      className={className}
      {...props}
    >
      {tone === 'color' && (
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            {P_GRADIENT_STOPS.map((stop) => (
              <stop key={stop.offset} offset={stop.offset} stopColor={stop.color} />
            ))}
          </linearGradient>
        </defs>
      )}

      <path d={SQUIRCLE_PATH} fill={tileFill} />
      {tone !== 'white' && (
        <path
          d={SQUIRCLE_PATH}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth="1"
        />
      )}

      <path d={P_TOP_PATH} fill={pFill} fillRule="evenodd" />
      <path d={P_LEG_PATH} fill={pFill} />
    </svg>
  );
}

export function PulseLogo({
  variant = 'horizontal',
  tone = 'color',
  className = '',
  markClassName = '',
  size = 32,
}: PulseLogoProps) {
  const gap = Math.round(size * 0.28);
  const wordmarkClass =
    'font-display font-bold tracking-tight text-foreground whitespace-nowrap';

  if (variant === 'mark-only') {
    return (
      <PulseMarkSvg
        tone={tone}
        className={markClassName || className}
        style={{ width: size, height: size }}
      />
    );
  }

  if (variant === 'stacked') {
    return (
      <div
        className={`inline-flex flex-col items-center ${className}`}
        style={{ gap }}
      >
        <PulseMarkSvg
          tone={tone}
          className={markClassName}
          style={{ width: size, height: size }}
        />
        <span className={wordmarkClass} style={{ fontSize: size * 0.55 }}>
          Pulse Social
        </span>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center ${className}`}
      style={{ gap }}
    >
      <PulseMarkSvg
        tone={tone}
        className={markClassName}
        style={{ width: size, height: size }}
      />
      <span className={wordmarkClass} style={{ fontSize: size * 0.55 }}>
        Pulse Social
      </span>
    </div>
  );
}

export { PulseMarkSvg as PulseMark };
