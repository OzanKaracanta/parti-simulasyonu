import type { WeeklyHistoryItem } from '../../types/game';
import { buildWeekCompareRows } from './reportComparison';
import './ReportWeekCompare.css';

interface ReportWeekCompareProps {
  current: WeeklyHistoryItem;
  previous: WeeklyHistoryItem | null;
}

export function ReportWeekCompare({ current, previous }: ReportWeekCompareProps) {
  if (!previous) {
    return (
      <section className="report-week-compare report-week-compare--empty" aria-label="Hafta karşılaştırması">
        <p className="report-week-compare-empty">
          Hafta {current.week} — önceki hafta olmadığı için karşılaştırma yok.
        </p>
      </section>
    );
  }

  const rows = buildWeekCompareRows(current, previous);

  return (
    <section className="report-week-compare" aria-label="Hafta karşılaştırması">
      <header className="report-week-compare-header">
        <h3 className="report-week-compare-title">Hafta Karşılaştırması</h3>
        <span className="report-week-compare-range">
          H{previous.week} → H{current.week}
        </span>
      </header>

      <table className="report-week-compare-table">
        <thead>
          <tr>
            <th scope="col">Gösterge</th>
            <th scope="col" className="num">
              H{previous.week}
            </th>
            <th scope="col" className="num">
              H{current.week}
            </th>
            <th scope="col" className="num">
              Fark
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <th scope="row">{row.label}</th>
              <td className="num">{row.previousValue}</td>
              <td className="num">{row.currentValue}</td>
              <td className={`num compare-trend ${row.tone}`}>{row.trendValue}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
