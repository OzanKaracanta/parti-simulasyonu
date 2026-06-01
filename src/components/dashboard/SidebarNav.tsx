import type { DashboardView } from './DashboardScreen';
import './dashboard.css';

interface SidebarNavProps {
  active: DashboardView;
  onChange: (view: DashboardView) => void;
  pendingAgendaCount?: number;
}

const navItems: {
  id: DashboardView;
  label: string;
  icon: string;
  hint: string;
}[] = [
  { id: 'overview', label: 'Genel Bakış', icon: '◈', hint: 'Harita ve komuta özeti' },
  { id: 'agendas', label: 'Gündemler', icon: '◉', hint: 'Ulusal ve bölgesel yanıtlar' },
  { id: 'campaign', label: 'Kampanya', icon: '⚡', hint: 'Tüm operasyonlar' },
  { id: 'regions', label: 'Bölgeler', icon: '⊞', hint: 'Bölgesel tablo' },
  { id: 'organization', label: 'Örgüt', icon: '⬡', hint: 'Teşkilat araçları' },
  { id: 'statistics', label: 'İstatistikler', icon: '◫', hint: 'Metrik ve kaynak takibi' },
  { id: 'reports', label: 'Raporlar', icon: '▤', hint: 'Haftalık özet' },
];

export function SidebarNav({ active, onChange, pendingAgendaCount = 0 }: SidebarNavProps) {
  return (
    <nav className="sidebar-nav" aria-label="Kampanya menüsü">
      <span className="sidebar-nav-header">Menü</span>
      {navItems.map((item) => {
        const isActive = active === item.id;
        const showBadge = item.id === 'agendas' && pendingAgendaCount > 0;

        return (
          <button
            key={item.id}
            type="button"
            className={isActive ? 'sidebar-nav-item active' : 'sidebar-nav-item'}
            onClick={() => onChange(item.id)}
            aria-current={isActive ? 'page' : undefined}
            title={item.hint}
          >
            <span className="sidebar-nav-icon" aria-hidden>
              {item.icon}
            </span>
            <span className="sidebar-nav-text">
              <span className="sidebar-nav-label">
                {item.label}
                {showBadge ? (
                  <span className="sidebar-nav-badge" aria-label={`${pendingAgendaCount} bekleyen gündem`}>
                    {pendingAgendaCount}
                  </span>
                ) : null}
              </span>
              {isActive ? <span className="sidebar-nav-hint">{item.hint}</span> : null}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
