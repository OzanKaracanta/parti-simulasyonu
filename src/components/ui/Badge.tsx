import type { ReactNode } from 'react';
import './ui.css';

export type BadgeTone =
  | 'crisis'
  | 'opportunity'
  | 'agenda'
  | 'info'
  | 'category'
  | 'neutral'
  | 'success'
  | 'partial'
  | 'ignored'
  | 'warning'
  | 'danger'
  | 'week'
  | 'synergy-strong'
  | 'synergy-moderate'
  | 'synergy-misaligned'
  | 'synergy-weak';

interface BadgeProps {
  tone: BadgeTone;
  children: ReactNode;
  className?: string;
}

export function Badge({ tone, children, className }: BadgeProps) {
  return <span className={`fm-badge ${tone} ${className ?? ''}`.trim()}>{children}</span>;
}
