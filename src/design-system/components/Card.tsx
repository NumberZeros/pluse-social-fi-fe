import { forwardRef, type HTMLAttributes } from 'react';

export type CardVariant = 'default' | 'glass';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

const variantClasses: Record<CardVariant, string> = {
  default: 'bg-surface border border-border',
  glass: 'glass-ds',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', className = '', children, ...props }, ref) => (
    <div
      ref={ref}
      className={[
        'rounded-ds-xl shadow-ds',
        variantClasses[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </div>
  ),
);

Card.displayName = 'Card';
