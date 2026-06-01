import type { ReactNode } from 'react';
import './ui.css';

interface TooltipProps {
  content: string | null | undefined;
  children: ReactNode;
  className?: string;
}

export function Tooltip({ content, children, className }: TooltipProps) {
  if (!content) {
    return <>{children}</>;
  }

  return (
    <span className={`fm-tooltip-host ${className ?? ''}`.trim()}>
      {children}
      <span className="fm-tooltip" role="tooltip">
        {content}
      </span>
    </span>
  );
}
