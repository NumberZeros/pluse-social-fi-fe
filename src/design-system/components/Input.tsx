import { forwardRef, type InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error = false, ...props }, ref) => (
    <input
      ref={ref}
      className={[
        'h-12 w-full rounded-ds-md bg-surface border px-4 text-foreground placeholder:text-muted',
        'transition-colors focus:outline-none focus:border-primary',
        error ? 'border-danger' : 'border-border',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  ),
);

Input.displayName = 'Input';
