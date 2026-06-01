import type { OrganizationValuePart } from '../../utils/organizationFormat';
import './organization.css';

interface OrganizationValueListProps {
  parts: OrganizationValuePart[];
  empty?: string;
}

export function OrganizationValueList({ parts, empty = '—' }: OrganizationValueListProps) {
  if (parts.length === 0) {
    return <span className="org-value-empty">{empty}</span>;
  }

  return (
    <span className="org-value-list">
      {parts.map((part, index) => (
        <span key={part.id}>
          {index > 0 ? ', ' : null}
          <span className={`org-value-part tone-${part.tone}`}>{part.text}</span>
        </span>
      ))}
    </span>
  );
}
