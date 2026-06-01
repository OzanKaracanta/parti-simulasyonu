import { useEffect, useState } from 'react';
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

type NavGroupId = 'agendas' | 'campaign' | 'organization';

const topNavItems: NavItem[] = [
  { id: 'overview', label: 'Genel Bakış', icon: '◈', hint: 'Harita ve komuta özeti' },
];

const agendaSubItems: NavItem[] = [
  { id: 'agenda-national', label: 'Ulusal Gündem', icon: '◎', hint: 'Haftalık ulusal olay ve yanıt' },
  { id: 'agenda-regional', label: 'Bölgesel Gündem', icon: '⊕', hint: 'Bölge bazlı mesaj ve kararlar' },
  { id: 'agenda-sub', label: 'Alt Gündemler', icon: '◇', hint: 'Ek gündem kartları ve slotlar' },
];

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
  { id: 'regions', label: 'Bölgeler', icon: '⊞', hint: 'Bölgesel tablo' },
  { id: 'statistics', label: 'İstatistikler', icon: '◫', hint: 'Metrik ve kaynak takibi' },
  { id: 'reports', label: 'Raporlar', icon: '▤', hint: 'Haftalık özet' },
];

function getGroupForView(view: DashboardView): NavGroupId | null {
  if (isAgendaView(view)) return 'agendas';
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
  return (
    <button
      type="button"
      className={
        subItem
          ? `sidebar-nav-item sidebar-nav-subitem ${isActive ? 'active' : ''}`
          : `sidebar-nav-item ${isActive ? 'active' : ''}`
      }
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
        {isActive && !subItem ? <span className="sidebar-nav-hint">{item.hint}</span> : null}
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
            <span className="sidebar-nav-chevron" aria-hidden>
              {expanded ? '▾' : '▸'}
            </span>
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

export function SidebarNav({ active, onChange, pendingAgendaCount = 0 }: SidebarNavProps) {
  const [expandedGroup, setExpandedGroup] = useState<NavGroupId | null>(() => getGroupForView(active));

  useEffect(() => {
    const group = getGroupForView(active);
    setExpandedGroup(group);
  }, [active]);

  const toggleGroup = (groupId: NavGroupId) => {
    setExpandedGroup((current) => (current === groupId ? null : groupId));
  };

  return (
    <nav className="sidebar-nav" aria-label="Kampanya menüsü">
      <span className="sidebar-nav-header">Menü</span>

      {topNavItems.map((item) => (
        <NavButton
          key={item.id}
          item={item}
          isActive={active === item.id}
          onClick={() => onChange(item.id)}
        />
      ))}

      <NavGroup
        label="Gündemler"
        icon="◉"
        hint="Ulusal, bölgesel ve alt gündemler"
        submenuId="sidebar-agenda-submenu"
        submenuLabel="Gündem alt menüsü"
        hasActiveChild={isAgendaView(active)}
        expanded={expandedGroup === 'agendas'}
        onToggle={() => toggleGroup('agendas')}
        badgeCount={pendingAgendaCount}
        subItems={agendaSubItems}
        active={active}
        onChange={onChange}
      />

      <NavGroup
        label="Kampanya"
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
        label="Örgüt Araçları"
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

      {bottomNavItems.map((item) => (
        <NavButton
          key={item.id}
          item={item}
          isActive={active === item.id}
          onClick={() => onChange(item.id)}
        />
      ))}
    </nav>
  );
}
