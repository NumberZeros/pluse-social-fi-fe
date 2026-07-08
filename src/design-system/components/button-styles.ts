export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'cta' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-background hover:bg-primary-hover border border-transparent',
  secondary:
    'bg-surface-2 text-foreground border border-border hover:bg-surface hover:border-primary/30',
  ghost:
    'bg-transparent text-foreground border border-transparent hover:bg-surface-2',
  danger:
    'bg-danger text-foreground border border-transparent hover:opacity-90',
  cta: 'bg-gradient-cta text-background border border-transparent hover:opacity-90',
  outline:
    'bg-transparent text-foreground border border-border hover:bg-surface-2 hover:border-primary/30',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-10 px-4 text-sm',
  md: 'h-12 px-6 text-base',
  lg: 'h-14 px-8 text-lg',
};

const BASE_BUTTON_CLASS =
  'inline-flex items-center justify-center gap-2 rounded-pill font-bold transition-colors ' +
  'focus-visible:outline-primary disabled:opacity-50 disabled:cursor-not-allowed';

/**
 * Returns the composed Button class string so non-`<button>` elements
 * (`<a>`, `<Link>`, `motion.button`) can reuse the same styling.
 */
export function getButtonClassName(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  className = '',
): string {
  return [BASE_BUTTON_CLASS, variantClasses[variant], sizeClasses[size], className]
    .filter(Boolean)
    .join(' ');
}
