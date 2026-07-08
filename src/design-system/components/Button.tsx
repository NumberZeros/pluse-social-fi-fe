import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { getButtonClassName, type ButtonSize, type ButtonVariant } from './button-styles.ts';

export type { ButtonVariant, ButtonSize };

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled}
      className={getButtonClassName(variant, size, className)}
      {...props}
    />
  ),
);

Button.displayName = 'Button';
