import { ButtonHTMLAttributes, FC } from 'react';
import clsx from 'clsx';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const Button: FC<ButtonProps> = ({ variant = 'primary', size = 'md', className, ...props }) => {
  const base = 'rounded focus:outline-none focus:ring-2 focus:ring-offset-2 transition';
  const variants = {
    primary: 'bg-brand-500 text-white hover:opacity-95 focus:ring-brand-500',
    secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 focus:ring-slate-400',
    ghost: 'bg-transparent text-slate-900 hover:bg-slate-100 focus:ring-slate-400',
  } as const;
  const sizes = { sm: 'px-2 py-1 text-sm', md: 'px-3 py-2', lg: 'px-4 py-3 text-lg' } as const;
  return <button className={clsx(base, variants[variant], sizes[size], className)} {...props} />;
};

export default Button;