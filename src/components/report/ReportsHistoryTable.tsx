import type { WeeklyHistoryItem } from '../../types/game';

interface ReportsHistoryTableProps {
  historyRows: WeeklyHistoryItem[];
  activeWeek: number | null;
  latestWeek: number | null;
  onSelectWeek: (week: number) => void;
}

export function ReportsHistoryTable({
  historyRows,
  activeWeek,
  latestWeek,
  onSelectWeek,
}: ReportsHistoryTableProps) {
  if (historyRows.length === 0) return null;

  return (
    <div className="history-log reports-history">
      <h3>Geçmiş Haftalar</h3>
      <p className="reports-history-hint">Satıra tıklayarak o haftanın raporunu aç.</p>
      <table className="fm-table reports-history-table">
        <thead>
          <tr>
            <th>Hafta</th>
            <th>Özet</th>
            <th>Destek Δ</th>
            <th>Olay</th>
          </tr>
        </thead>
        <tbody>
          {historyRows.map((item) => {
            const isSelected = activeWeek === item.week;
            const isLatest = item.week === latestWeek;
            return (
              <tr
                key={item.week}
                className={[
                  isSelected ? 'selected' : '',
                  isLatest ? 'reports-history-row--latest' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => onSelectWeek(item.week)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectWeek(item.week);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-pressed={isSelected}
                aria-label={`Hafta ${item.week} raporu`}
              >
                <td className="num">
                  {item.week}
                  {isLatest ? <span className="reports-history-latest"> güncel</span> : null}
                </td>
                <td className="reports-history-summary">{item.summary}</td>
                <td
                  className={`num ${item.supportChange > 0 ? 'positive' : item.supportChange < 0 ? 'negative' : ''}`}
                >
                  {item.supportChange > 0 ? '+' : ''}
                  {item.supportChange.toFixed(1)}
                </td>
                <td>{item.eventTitle || '—'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
