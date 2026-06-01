import type { ReactNode } from 'react';
import './CommandCenterPanel.css';

interface CommandCenterPanelProps {
  children: ReactNode;
  subtitle?: string;
}

/** Sağ kolon — haftalık komuta özeti */
export function CommandCenterPanel({
  children,
  subtitle = 'Bölge sahası, nakit ve gündem özeti',
}: CommandCenterPanelProps) {
  return (
    <aside className="command-center" aria-label="Haftalık komuta merkezi">
      <header className="command-center-header">
        <span className="command-center-icon" aria-hidden>
          ◉
        </span>
        <div>
          <h2 className="command-center-title">Komuta Merkezi</h2>
          <p className="command-center-subtitle">{subtitle}</p>
        </div>
      </header>
      <div className="command-center-modules">{children}</div>
    </aside>
  );
}
