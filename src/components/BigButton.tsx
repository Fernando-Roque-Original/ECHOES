import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';

type BigButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'quiet';
  icon?: ReactNode;
  showArrow?: boolean;
};

export function BigButton({
  children,
  variant = 'primary',
  icon,
  showArrow = false,
  className = '',
  type = 'button',
  ...props
}: BigButtonProps) {
  return (
    <button
      type={type}
      className={`big-button big-button--${variant} ${className}`.trim()}
      {...props}
    >
      {icon ? <span className="big-button__icon">{icon}</span> : null}
      <span>{children}</span>
      {showArrow ? <ArrowRight aria-hidden="true" size={20} /> : null}
    </button>
  );
}

