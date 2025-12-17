import type { SVGProps } from 'react';
import { useId } from 'react';

type IconProps = SVGProps<SVGSVGElement> & {
  title?: string;
};

export function PulseMark({ title = 'Pulse', ...props }: IconProps) {
  const ribbonGradId = useId();
  const highlightGradId = useId();

  return (
    <svg viewBox="0 0 64 64" fill="none" aria-label={title} role="img" {...props}>
      <defs>
        <linearGradient id={ribbonGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#14F195" />
          <stop offset="50%" stopColor="#9945FF" />
          <stop offset="100%" stopColor="#7A2CCD" />
        </linearGradient>
        <linearGradient id={highlightGradId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.9} />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
        </linearGradient>
      </defs>

      {/* Back Stem */}
      <path d="M20 12 L20 56 L32 48 L32 20 Z" fill="#9945FF" opacity={0.6} />

      {/* Main Loop */}
      <path 
        d="M20 12 H40 C 52 12, 58 24, 50 36 C 44 44, 32 48, 20 56 V 12 Z" 
        fill={`url(#${ribbonGradId})`}
        stroke="white" 
        strokeWidth="0.5" 
        strokeOpacity="0.3" 
      />

      {/* Fold Highlight */}
      <path 
        d="M20 12 L40 12 C 45 12, 48 16, 46 20 L 20 36 V 12 Z" 
        fill={`url(#${highlightGradId})`} 
        opacity={0.4} 
      />

      {/* Heart/Pulse Dot */}
      <circle cx="34" cy="28" r="4" fill="#14F195" />
      <circle cx="34" cy="28" r="2" fill="white" />
    </svg>
  );
}

function BaseIcon({
  title,
  children,
  ...props
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-label={title} role="img" {...props}>
      {children}
    </svg>
  );
}

export function IconHome(props: IconProps) {
  return (
    <BaseIcon title={props.title ?? 'Home'} {...props}>
      <path
        d="M3.5 11.2 12 4.5l8.5 6.7v8.8a1.5 1.5 0 0 1-1.5 1.5h-4.5v-6.3a1.2 1.2 0 0 0-1.2-1.2h-2.6a1.2 1.2 0 0 0-1.2 1.2v6.3H5a1.5 1.5 0 0 1-1.5-1.5v-8.8Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </BaseIcon>
  );
}

export function IconFeed(props: IconProps) {
  return (
    <BaseIcon title={props.title ?? 'Feed'} {...props}>
      <path
        d="M6.5 6.2h11a1.8 1.8 0 0 1 1.8 1.8v10a1.8 1.8 0 0 1-1.8 1.8h-11A1.8 1.8 0 0 1 4.7 18V8a1.8 1.8 0 0 1 1.8-1.8Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M7.6 9.2h8.8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M7.6 12.4h6.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M7.6 15.6h7.4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </BaseIcon>
  );
}

export function IconExplore(props: IconProps) {
  return (
    <BaseIcon title={props.title ?? 'Explore'} {...props}>
      <path
        d="M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M14.8 9.2 13 13l-3.8 1.8L11 11l3.8-1.8Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </BaseIcon>
  );
}

export function IconBell(props: IconProps) {
  return (
    <BaseIcon title={props.title ?? 'Notifications'} {...props}>
      <path
        d="M18 16.5H6.2c1.2-1.2 1.8-2.5 1.8-4.4V10a4 4 0 0 1 8 0v2.1c0 1.9.6 3.2 2 4.4Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M10 18.2a2 2 0 0 0 4 0"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </BaseIcon>
  );
}

export function IconVerified(props: IconProps) {
  return (
    <BaseIcon title={props.title ?? 'Verified'} {...props}>
      <path
        d="M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="m8.2 12.2 2.3 2.3 5.3-5.3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </BaseIcon>
  );
}

export function IconHeart(props: IconProps) {
  return (
    <BaseIcon title={props.title ?? 'Like'} {...props}>
      <path
        d="M12 20.5s-7-4.4-9.2-8.6C1.1 8.4 3.2 5.5 6.6 5.2c1.7-.1 3.1.7 4 1.9.9-1.2 2.3-2 4-1.9 3.4.3 5.5 3.2 3.8 6.7C19 16.1 12 20.5 12 20.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </BaseIcon>
  );
}

export function IconRepost(props: IconProps) {
  return (
    <BaseIcon title={props.title ?? 'Repost'} {...props}>
      <path
        d="M7.5 7.8h9.2a3 3 0 0 1 3 3V12"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M16.2 16.2H7a3 3 0 0 1-3-3V12"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="m9 5.8-1.9 2 1.9 2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="m15 18.2 1.9-2-1.9-2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </BaseIcon>
  );
}

export function IconIdentity(props: IconProps) {
  return (
    <BaseIcon title={props.title ?? 'Identity'} {...props}>
      <path
        d="M7 6.5h10A2.5 2.5 0 0 1 19.5 9v6A2.5 2.5 0 0 1 17 17.5H7A2.5 2.5 0 0 1 4.5 15V9A2.5 2.5 0 0 1 7 6.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M8.2 10.2h4.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M8.2 13.2h6.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M14.8 11.2a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </BaseIcon>
  );
}

export function IconTip(props: IconProps) {
  return (
    <BaseIcon title={props.title ?? 'Tip'} {...props}>
      <path
        d="M12 3.8c3.2 0 5.8 2.1 5.8 5.1 0 1.5-.7 2.8-1.8 3.7-.8.7-1.3 1.6-1.3 2.6v.6H9.3v-.6c0-1-.5-1.9-1.3-2.6-1.1-.9-1.8-2.2-1.8-3.7 0-3 2.6-5.1 5.8-5.1Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M9.4 19.1h5.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M10.4 21h3.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </BaseIcon>
  );
}

export function IconStorage(props: IconProps) {
  return (
    <BaseIcon title={props.title ?? 'Storage'} {...props}>
      <path
        d="M6.5 6.2h11A2.2 2.2 0 0 1 19.7 8.4v1.2H4.3V8.4A2.2 2.2 0 0 1 6.5 6.2Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M4.3 9.6h15.4v6.1a2.2 2.2 0 0 1-2.2 2.2h-11a2.2 2.2 0 0 1-2.2-2.2V9.6Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M8 13.1h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </BaseIcon>
  );
}

export function IconGraph(props: IconProps) {
  return (
    <BaseIcon title={props.title ?? 'Graph'} {...props}>
      <path
        d="M6.2 17.8V6.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M6.2 17.8h11.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M7.8 14.7 11 11.8l2.4 2.2 3.1-4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="11" cy="11.8" r="1" fill="currentColor" opacity="0.9" />
      <circle cx="13.4" cy="14" r="1" fill="currentColor" opacity="0.9" />
      <circle cx="16.5" cy="10" r="1" fill="currentColor" opacity="0.9" />
    </BaseIcon>
  );
}

export function IconTrend(props: IconProps) {
  return (
    <BaseIcon title={props.title ?? 'Trending'} {...props}>
      <path
        d="M5 15.5 10 10l3 3 6-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 7h4v4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </BaseIcon>
  );
}

export function IconSparkle(props: IconProps) {
  return (
    <BaseIcon title={props.title ?? 'New'} {...props}>
      <path
        d="M12 3l1.1 4 3.9 1-3.9 1L12 13l-1.1-4L7 8l3.9-1L12 3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M18.2 12.2l.6 2.2 2.2.6-2.2.6-.6 2.2-.6-2.2-2.2-.6 2.2-.6.6-2.2Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
        opacity="0.85"
      />
    </BaseIcon>
  );
}

export function IconArt(props: IconProps) {
  return (
    <BaseIcon title={props.title ?? 'Art'} {...props}>
      <path
        d="M7 17.5c2.2-2.2 7.8-7.8 10-10"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M14.8 6.7 17.3 9.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M6.5 18.2h4.3l-4.3-4.3v4.3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </BaseIcon>
  );
}

export function IconGaming(props: IconProps) {
  return (
    <BaseIcon title={props.title ?? 'Gaming'} {...props}>
      <path
        d="M7.2 10.2h9.6a3 3 0 0 1 2.9 3.7l-.6 2.6a2.5 2.5 0 0 1-2.4 1.9h-1.3l-1.8-2H10.4l-1.8 2H7.3a2.5 2.5 0 0 1-2.4-1.9l-.6-2.6a3 3 0 0 1 2.9-3.7Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M8.3 13.6h2.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M9.6 12.3v2.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="15.9" cy="13.1" r="0.9" fill="currentColor" opacity="0.9" />
      <circle cx="17.8" cy="14.8" r="0.9" fill="currentColor" opacity="0.9" />
    </BaseIcon>
  );
}

export function IconCoin(props: IconProps) {
  return (
    <BaseIcon title={props.title ?? 'DeFi'} {...props}>
      <ellipse cx="12" cy="12" rx="7" ry="8" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M9.2 9.2h4.1"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M9.2 12h5.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M9.2 14.8h4.1"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </BaseIcon>
  );
}

export function IconBolt(props: IconProps) {
  return (
    <BaseIcon title={props.title ?? 'Tech'} {...props}>
      <path
        d="M13 2.8 6.8 13H12l-1 8.2 6.2-10.2H12L13 2.8Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </BaseIcon>
  );
}
