import { TabBar } from '../../ui/TabBar';
import './weeklyAgenda.css';

export type AgendaTabId = 'main' | 'sub' | 'radar' | 'regional';

interface AgendaTabsProps {
  tabs: { id: AgendaTabId; label: string }[];
  active: AgendaTabId;
  onChange: (id: AgendaTabId) => void;
}

export function AgendaTabs({ tabs, active, onChange }: AgendaTabsProps) {
  if (tabs.length <= 1) return null;

  return (
    <div className="agenda-tabs-wrap">
      <TabBar tabs={tabs} active={active} onChange={onChange} />
    </div>
  );
}
