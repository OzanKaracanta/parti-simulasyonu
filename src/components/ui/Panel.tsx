import { useState, type ReactNode } from 'react';
import './ui.css';

export type PanelVariant = 'default' | 'command' | 'critical' | 'operation';

interface PanelProps {
  title: string;
  headerExtra?: ReactNode;
  children: ReactNode;
  compact?: boolean;
  className?: string;
  variant?: PanelVariant;
  collapsible?: boolean;
  defaultOpen?: boolean;
}

export function Panel({
  title,
  headerExtra,
  children,
  compact,
  className,
  variant = 'default',
  collapsible = false,
  defaultOpen = true,
}: PanelProps) {
  const [open, setOpen] = useState(defaultOpen);
  const variantClass = variant !== 'default' ? `variant-${variant}` : '';
  const isOpen = !collapsible || open;

  return (
    <section
      className={`fm-panel ${variantClass} ${collapsible && !open ? 'is-collapsed' : ''} ${className ?? ''}`.trim()}
    >
      <div className={`fm-panel-header ${collapsible ? 'fm-panel-header--collapsible' : ''}`}>
        {collapsible ? (
          <button
            type="button"
            className="fm-panel-toggle"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
          >
            <span className="fm-panel-chevron" aria-hidden>
              {open ? '▾' : '▸'}
            </span>
            <h2>{title}</h2>
          </button>
        ) : (
          <h2>{title}</h2>
        )}
        {headerExtra}
      </div>
      <div
        className={[
          compact ? 'fm-panel-body compact' : 'fm-panel-body',
          collapsible ? 'fm-panel-body--collapsible' : '',
          isOpen ? 'is-open' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-hidden={collapsible ? !open : undefined}
      >
        <div className="fm-panel-body-inner">{children}</div>
      </div>
    </section>
  );
}
