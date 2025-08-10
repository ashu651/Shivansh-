import { FC, ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

export interface UIButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
}

export const UIButton: FC<UIButtonProps> = ({ variant = 'primary', className, ...props }) => (
  <button className={clsx('px-3 py-2 rounded', variant === 'primary' ? 'bg-purple-600 text-white' : variant === 'secondary' ? 'bg-slate-200' : 'bg-transparent', className)} {...props} />
);