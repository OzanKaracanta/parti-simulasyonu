import { Button } from '../ui/Button';
import './ReportWeekNav.css';

interface ReportWeekNavProps {
  weeks: number[];
  selectedWeek: number;
  latestWeek: number;
  onSelectWeek: (week: number) => void;
}

export function ReportWeekNav({
  weeks,
  selectedWeek,
  latestWeek,
  onSelectWeek,
}: ReportWeekNavProps) {
  const index = weeks.indexOf(selectedWeek);
  const canGoOlder = index > 0;
  const canGoNewer = index < weeks.length - 1;
  const isLatest = selectedWeek === latestWeek;

  return (
    <div className="report-week-nav" role="group" aria-label="Hafta seçici">
      <Button
        variant="ghost"
        size="sm"
        disabled={!canGoOlder}
        onClick={() => canGoOlder && onSelectWeek(weeks[index - 1])}
        aria-label="Önceki hafta"
      >
        ‹
      </Button>

      <label className="report-week-select-wrap">
        <span className="report-week-select-label">Hafta</span>
        <select
          className="report-week-select"
          value={selectedWeek}
          onChange={(e) => onSelectWeek(Number(e.target.value))}
          aria-label="Rapor haftası seç"
        >
          {[...weeks].reverse().map((week) => (
            <option key={week} value={week}>
              Hafta {week}
              {week === latestWeek ? ' (güncel)' : ''}
            </option>
          ))}
        </select>
      </label>

      <Button
        variant="ghost"
        size="sm"
        disabled={!canGoNewer}
        onClick={() => canGoNewer && onSelectWeek(weeks[index + 1])}
        aria-label="Sonraki hafta"
      >
        ›
      </Button>

      {!isLatest ? (
        <Button variant="ghost" size="sm" onClick={() => onSelectWeek(latestWeek)}>
          Güncele
        </Button>
      ) : (
        <span className="report-week-latest-badge">Güncel</span>
      )}
    </div>
  );
}
