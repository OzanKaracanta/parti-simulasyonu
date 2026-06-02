import { useEffect, useState, type ReactNode } from 'react';
import {
  isAgendaView,
  isCampaignView,
  isOrganizationView,
  type DashboardView,
} from './DashboardScreen';
import './dashboard.css';

interface SidebarNavProps {
  active: DashboardView;
  onChange: (view: DashboardView) => void;
  pendingAgendaCount?: number;
}

type NavItem = {
  id: DashboardView;
  label: string;
  icon: string;
  hint: string;
};

type NavGroupId = 'campaign' | 'organization';

const topNavItems: NavItem[] = [
  { id: 'overview', label: 'Karargâh', icon: '◈', hint: 'Harita ve komuta özeti' },
];

const agendaNavItem: NavItem = {
  id: 'agenda-national',
  label: 'Gündem',
  icon: '◉',
  hint: 'Haftalık ulusal olay ve yanıt',
};

const campaignSubItems: NavItem[] = [
  { id: 'campaign-national', label: 'Ulusal Kampanya', icon: '⚡', hint: 'Ülke çapında operasyonlar' },
  { id: 'campaign-regional', label: 'Bölgesel Kampanya', icon: '⊕', hint: 'Bölge seçerek kampanya operasyonları' },
];

const organizationSubItems: NavItem[] = [
  {
    id: 'organization-national',
    label: 'Ulusal Örgüt Araçları',
    icon: '⬡',
    hint: 'Merkez teşkilat ve ulusal altyapı',
  },
  {
    id: 'organization-regional',
    label: 'Bölgesel Örgüt Araçları',
    icon: '⊕',
    hint: 'Bölge bazlı kurulum ve yükseltme',
  },
];

const bottomNavItems: NavItem[] = [
  { id: 'regions', label: 'Seçim Haritası', icon: '⊞', hint: 'Bölgesel tablo' },
  { id: 'statistics', label: 'Analiz Odası', icon: '◫', hint: 'Metrik ve kaynak takibi' },
  { id: 'reports', label: 'Haftalık Raporlar', icon: '▤', hint: 'Haftalık özet' },
];

function getGroupForView(view: DashboardView): NavGroupId | null {
  if (isCampaignView(view)) return 'campaign';
  if (isOrganizationView(view)) return 'organization';
  return null;
}

function NavButton({
  item,
  isActive,
  badgeCount,
  onClick,
  subItem = false,
}: {
  item: NavItem;
  isActive: boolean;
  badgeCount?: number;
  onClick: () => void;
  subItem?: boolean;
}) {
  if (subItem) {
    return (
      <button
        type="button"
        className={`sidebar-nav-subitem ${isActive ? 'active' : ''}`}
        onClick={onClick}
        aria-current={isActive ? 'page' : undefined}
        title={item.hint}
      >
        <span className="sidebar-nav-subitem-label">{item.label}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
      title={item.hint}
    >
      <span className="sidebar-nav-icon" aria-hidden>
        {item.icon}
      </span>
      <span className="sidebar-nav-text">
        <span className="sidebar-nav-label">
          {item.label}
          {badgeCount && badgeCount > 0 ? (
            <span className="sidebar-nav-badge" aria-label={`${badgeCount} bekleyen gündem`}>
              {badgeCount}
            </span>
          ) : null}
        </span>
      </span>
    </button>
  );
}

interface NavGroupProps {
  label: string;
  icon: string;
  hint: string;
  submenuId: string;
  submenuLabel: string;
  hasActiveChild: boolean;
  expanded: boolean;
  onToggle: () => void;
  badgeCount?: number;
  subItems: NavItem[];
  active: DashboardView;
  onChange: (view: DashboardView) => void;
}

function NavSection({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="sidebar-nav-section">
      <span className="sidebar-nav-section-label">{label}</span>
      <div className="sidebar-nav-section-body">{children}</div>
    </div>
  );
}

function NavGroup({
  label,
  icon,
  hint,
  submenuId,
  submenuLabel,
  hasActiveChild,
  expanded,
  onToggle,
  badgeCount,
  subItems,
  active,
  onChange,
}: NavGroupProps) {
  return (
    <div className={`sidebar-nav-group ${expanded ? 'expanded' : ''}`}>
      <button
        type="button"
        className={[
          'sidebar-nav-item',
          'sidebar-nav-group-toggle',
          expanded ? 'is-expanded' : '',
          hasActiveChild ? 'has-active-child' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={submenuId}
        title={hint}
      >
        <span className="sidebar-nav-icon" aria-hidden>
          {icon}
        </span>
        <span className="sidebar-nav-text">
          <span className="sidebar-nav-label">
            {label}
            {badgeCount && badgeCount > 0 ? (
              <span className="sidebar-nav-badge" aria-label={`${badgeCount} bekleyen`}>
                {badgeCount}
              </span>
            ) : null}
          </span>
        </span>
      </button>

      {expanded ? (
        <div id={submenuId} className="sidebar-nav-submenu" role="group" aria-label={submenuLabel}>
          {subItems.map((item) => (
            <NavButton
              key={item.id}
              item={item}
              isActive={active === item.id}
              subItem
              onClick={() => onChange(item.id)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function SidebarNav({
  active,
  onChange,
  pendingAgendaCount = 0,
}: SidebarNavProps) {
  const [expandedGroup, setExpandedGroup] = useState<NavGroupId | null>(() =>
    getGroupForView(active),
  );

  useEffect(() => {
    setExpandedGroup(getGroupForView(active));
  }, [active]);

  const toggleGroup = (groupId: NavGroupId) => {
    setExpandedGroup((current) => (current === groupId ? null : groupId));
  };

  return (
    <nav className="sidebar-nav" aria-label="Kampanya menüsü">
      <span className="sidebar-nav-header">Komuta Paneli</span>

      <NavSection label="Karargâh">
        {topNavItems.map((item) => (
          <NavButton
            key={item.id}
            item={item}
            isActive={active === item.id}
            onClick={() => onChange(item.id)}
          />
        ))}
      </NavSection>

      <div className="sidebar-nav-divider" role="presentation" aria-hidden />

      <NavSection label="Gündem">
        <NavButton
          item={agendaNavItem}
          isActive={isAgendaView(active)}
          badgeCount={pendingAgendaCount}
          onClick={() => onChange('agenda-national')}
        />
      </NavSection>

      <div className="sidebar-nav-divider" role="presentation" aria-hidden />

      <NavSection label="Saha">
        <NavGroup
          label="Operasyonlar"
          icon="⚡"
          hint="Ulusal ve bölgesel operasyonlar"
          submenuId="sidebar-campaign-submenu"
          submenuLabel="Kampanya alt menüsü"
          hasActiveChild={isCampaignView(active)}
          expanded={expandedGroup === 'campaign'}
          onToggle={() => toggleGroup('campaign')}
          subItems={campaignSubItems}
          active={active}
          onChange={onChange}
        />

        <NavGroup
          label="Teşkilat"
          icon="⬡"
          hint="Ulusal ve bölgesel teşkilat yatırımları"
          submenuId="sidebar-organization-submenu"
          submenuLabel="Örgüt araçları alt menüsü"
          hasActiveChild={isOrganizationView(active)}
          expanded={expandedGroup === 'organization'}
          onToggle={() => toggleGroup('organization')}
          subItems={organizationSubItems}
          active={active}
          onChange={onChange}
        />
      </NavSection>

      <div className="sidebar-nav-divider" role="presentation" aria-hidden />

      <NavSection label="İstihbarat">
        {bottomNavItems.map((item) => (
          <NavButton
            key={item.id}
            item={item}
            isActive={active === item.id}
            onClick={() => onChange(item.id)}
          />
        ))}
      </NavSection>
    </nav>
  );
}
