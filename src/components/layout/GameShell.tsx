import type { ReactNode } from 'react';
import './GameShell.css';

type GameShellVariant = 'dashboard' | 'setup' | 'result';

interface GameShellProps {
  children: ReactNode;
  variant?: GameShellVariant;
  className?: string;
}

export function GameShell({ children, variant, className }: GameShellProps) {
  const classes = [
    'game-shell',
    variant ? `game-shell--${variant}` : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');
  return <main className={classes}>{children}</main>;
}
