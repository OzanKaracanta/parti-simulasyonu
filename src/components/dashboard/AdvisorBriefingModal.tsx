import { splitAdvisorBriefingBullets } from '../../engine/advisorEngine';
import type { AdvisorBriefingBullet, AdvisorBriefingItem, AdvisorBriefingTextSegment } from '../../types/game';
import './AdvisorBriefingModal.css';

interface AdvisorBriefingModalProps {
  briefing: AdvisorBriefingItem;
  onDismiss: () => void;
}

const BULLET_ICONS: Record<AdvisorBriefingBullet['kind'], string> = {
  support: '◆',
  agenda: '◉',
  segments: '▣',
  resources: '⚡',
  rivals: '⚠',
  outlook: '→',
  insight: '✦',
};

function toneClass(tone: AdvisorBriefingTextSegment['tone']): string {
  switch (tone) {
    case 'positive':
      return 'advisor-briefing-tone--positive';
    case 'negative':
      return 'advisor-briefing-tone--negative';
    default:
      return '';
  }
}

function renderSegments(segments: AdvisorBriefingTextSegment[]) {
  return segments.map((segment, index) => (
    <span className={toneClass(segment.tone)} key={`${index}-${segment.text.slice(0, 12)}`}>
      {segment.text}
    </span>
  ));
}

function severityClass(severity: AdvisorBriefingBullet['severity']): string {
  switch (severity) {
    case 'positive':
      return 'advisor-briefing-bullet--positive';
    case 'warning':
      return 'advisor-briefing-bullet--warning';
    case 'critical':
      return 'advisor-briefing-bullet--critical';
    default:
      return '';
  }
}

function AdvisorBulletCard({ bullet, featured = false }: { bullet: AdvisorBriefingBullet; featured?: boolean }) {
  return (
    <li
      className={`advisor-briefing-bullet ${severityClass(bullet.severity)} ${
        featured ? 'advisor-briefing-bullet--featured' : ''
      }`}
    >
      <div className="advisor-briefing-bullet-head">
        <span className="advisor-briefing-bullet-icon" aria-hidden>
          {BULLET_ICONS[bullet.kind]}
        </span>
        <span className="advisor-briefing-bullet-label">{bullet.label}</span>
      </div>
      <p className="advisor-briefing-bullet-text">{renderSegments(bullet.segments)}</p>
    </li>
  );
}

export function AdvisorBriefingModal({ briefing, onDismiss }: AdvisorBriefingModalProps) {
  const dismissLabel = briefing.isFinalWeek ? 'Sonuçları gör »' : 'Yeni haftaya devam »';
  const { overviewBullets, politicalBullets } = splitAdvisorBriefingBullets(briefing.bullets);
  const supportBullet = politicalBullets.find((item) => item.kind === 'support');
  const rivalBullets = politicalBullets.filter((item) => item.kind === 'rivals');

  return (
    <div className="advisor-briefing-overlay" role="presentation">
      <div
        className="advisor-briefing-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="advisor-briefing-title"
      >
        <header className="advisor-briefing-header">
          <div className="advisor-briefing-header-bar">
            <span className="advisor-briefing-kicker">
              {briefing.isFinalWeek
                ? `Tur ${briefing.completedWeek} · Kampanya sonu`
                : `Tur ${briefing.completedWeek} → ${briefing.displayWeek}`}
            </span>
            <button
              type="button"
              className="advisor-briefing-close"
              onClick={onDismiss}
              aria-label="Kapat"
            >
              ×
            </button>
          </div>

          <div className="advisor-briefing-header-main">
            <div className="advisor-briefing-identity">
              <span className="advisor-briefing-avatar" aria-hidden>
                ◈
              </span>
              <div>
                <p className="advisor-briefing-name">{briefing.advisorName}</p>
                <p className="advisor-briefing-role">{briefing.advisorTitle}</p>
              </div>
            </div>
            <h2 id="advisor-briefing-title">{briefing.headline}</h2>
          </div>
        </header>

        <div className="advisor-briefing-body">
          <p className="advisor-briefing-opening">{briefing.openingLine}</p>

          <div className="advisor-briefing-columns">
            <div className="advisor-briefing-overview-column">
              {overviewBullets.length > 0 ? (
                <ul className="advisor-briefing-list advisor-briefing-list--overview">
                  {overviewBullets.map((bullet) => (
                    <AdvisorBulletCard bullet={bullet} key={`${bullet.kind}-${bullet.label}`} />
                  ))}
                </ul>
              ) : (
                <p className="advisor-briefing-empty-note">
                  Bu turda öne çıkan ek başlık yok; siyasi tablo sağ sütunda.
                </p>
              )}
            </div>

            <div className="advisor-briefing-political-column">
              <ul className="advisor-briefing-list advisor-briefing-list--political">
                {supportBullet ? <AdvisorBulletCard bullet={supportBullet} featured /> : null}
                {rivalBullets.map((bullet) => (
                  <AdvisorBulletCard bullet={bullet} key={`${bullet.kind}-${bullet.label}`} />
                ))}
              </ul>

              {briefing.backlashNote ? (
                <section className="advisor-briefing-backlash" aria-label="Gölge yankı">
                  <div className="advisor-briefing-backlash-head">
                    <span className="advisor-briefing-backlash-icon" aria-hidden>
                      ☁
                    </span>
                    <span className="advisor-briefing-backlash-kicker">Gölge yankı</span>
                  </div>
                  <h3 className="advisor-briefing-backlash-headline">
                    {briefing.backlashNote.headline}
                  </h3>
                  <p className="advisor-briefing-backlash-body">{briefing.backlashNote.body}</p>
                  <p className="advisor-briefing-backlash-effects">
                    {renderSegments(briefing.backlashNote.effectSegments)}
                  </p>
                </section>
              ) : null}
            </div>
          </div>

          <p className="advisor-briefing-closing">{briefing.closingLine}</p>
        </div>

        <footer className="advisor-briefing-footer">
          <button type="button" className="ps-btn ps-btn--primary" onClick={onDismiss}>
            {dismissLabel}
          </button>
        </footer>
      </div>
    </div>
  );
}
