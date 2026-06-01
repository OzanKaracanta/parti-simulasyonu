import { formatDelta } from '../../engine/weeklyReport';

interface ReportChangeListProps<T extends string> {
  changes: Partial<Record<T, number>>;
  labels: Record<T, string>;
}

export function ReportChangeList<T extends string>({
  changes,
  labels,
}: ReportChangeListProps<T>) {
  const entries = Object.entries(changes).filter(([, v]) => v !== 0);

  if (entries.length === 0) {
    return <p className="report-empty">Değişim yok.</p>;
  }

  return (
    <ul className="report-list">
      {entries.map(([key, value]) => {
        const delta = value as number;
        return (
          <li key={key} className={delta > 0 ? 'positive' : delta < 0 ? 'negative' : ''}>
            {labels[key as T]}: {formatDelta(delta)}
          </li>
        );
      })}
    </ul>
  );
}
