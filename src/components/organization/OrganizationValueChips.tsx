import type { OrganizationValuePart } from '../../utils/organizationFormat';
import './organization.css';

interface OrganizationValueChipsProps {
  parts: OrganizationValuePart[];
  empty?: string;
  maxVisible?: number;
}

export function OrganizationValueChips({
  parts,
  empty = '—',
  maxVisible,
}: OrganizationValueChipsProps) {
  if (parts.length === 0) {
    return <span className="org-value-empty">{empty}</span>;
  }

  const visible = maxVisible ? parts.slice(0, maxVisible) : parts;
  const hiddenCount = maxVisible ? Math.max(0, parts.length - maxVisible) : 0;

  return (
    <span className="org-chip-row">
      {visible.map((part) => (
        <span key={part.id} className={`org-chip tone-${part.tone}`}>
          {part.text}
        </span>
      ))}
      {hiddenCount > 0 ? (
        <span className="org-chip tone-muted">+{hiddenCount}</span>
      ) : null}
    </span>
  );
}
