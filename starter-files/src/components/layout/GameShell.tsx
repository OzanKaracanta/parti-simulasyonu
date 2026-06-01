import type { ReactNode } from 'react';
import './GameShell.css';

interface GameShellProps {
  children: ReactNode;
}

export function GameShell({ children }: GameShellProps) {
  return <main className="game-shell">{children}</main>;
}
