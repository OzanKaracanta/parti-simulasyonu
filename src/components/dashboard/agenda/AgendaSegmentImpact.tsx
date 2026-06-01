/** Gündem kartı segment etki — satır içi dipnot (kutu yok) */

import { politicalSegmentLabels } from '../../../data/politicalSegments';
import { segmentLabels } from '../../../data/segments';
import type { ReactionAxis, SegmentId } from '../../../types/game';
import type { PoliticalSegmentId } from '../../../types/politicalSegments';
import './AgendaSegmentImpact.css';

export interface AgendaSegmentImpactProps {
  reactionAxis: ReactionAxis;
  primarySegments: SegmentId[];
  tensionSegments: SegmentId[];
  primaryPoliticalSegments: PoliticalSegmentId[];
  tensionPoliticalSegments: PoliticalSegmentId[];
  tensionRationale?: string;
  politicalRationale?: string;
  variant?: 'main' | 'sub';
}

const MAX_CHIPS = 3;

function toLabels<T extends string>(
  ids: T[],
  labels: Record<T, string>,
): string[] {
  return ids.slice(0, MAX_CHIPS).map((id) => labels[id]);
}

interface InlineGroup {
  groupId: string;
  label: string;
  items: string[];
  tone: 'socio' | 'political' | 'tension';
}

function InlineGroupRow({ label, items, tone }: InlineGroup) {
  if (items.length === 0) return null;

  return (
    <span className="agenda-impact-inline-group">
      <span className="agenda-impact-inline-label">{label}</span>
      {items.map((item) => (
        <span key={item} className={`agenda-impact-inline-val tone-${tone}`}>
          {item}
        </span>
      ))}
    </span>
  );
}

export function AgendaSegmentImpact({
  reactionAxis,
  primarySegments,
  tensionSegments,
  primaryPoliticalSegments,
  tensionPoliticalSegments,
  tensionRationale,
  politicalRationale,
  variant = 'main',
}: AgendaSegmentImpactProps) {
  const showSocioPrimary =
    reactionAxis !== 'political' && primarySegments.length > 0;
  const showSocioTension =
    reactionAxis !== 'political' && tensionSegments.length > 0;
  const showPoliticalPrimary =
    reactionAxis !== 'socioeconomic' && primaryPoliticalSegments.length > 0;
  const showPoliticalTension =
    reactionAxis !== 'socioeconomic' && tensionPoliticalSegments.length > 0;

  const socioLabels = toLabels(primarySegments, segmentLabels);
  const tensionSocioLabels = toLabels(tensionSegments, segmentLabels);
  const politicalLabels = toLabels(primaryPoliticalSegments, politicalSegmentLabels);
  const tensionPoliticalLabels = toLabels(
    tensionPoliticalSegments,
    politicalSegmentLabels,
  );

  const groups: InlineGroup[] = [
    ...(showSocioPrimary
      ? [{ groupId: 'socio', label: 'Hedef', items: socioLabels, tone: 'socio' as const }]
      : []),
    ...(showPoliticalPrimary
      ? [
          {
            groupId: 'pol',
            label: reactionAxis === 'political' ? 'Hedef' : 'Politik',
            items: politicalLabels,
            tone: 'political' as const,
          },
        ]
      : []),
    ...(showSocioTension
      ? [{ groupId: 'tension-socio', label: 'Gerilim', items: tensionSocioLabels, tone: 'tension' as const }]
      : []),
    ...(showPoliticalTension
      ? [
          {
            groupId: 'tension-pol',
            label: 'Gerilim',
            items: tensionPoliticalLabels,
            tone: 'tension' as const,
          },
        ]
      : []),
  ];

  const hasRationale = Boolean(tensionRationale || politicalRationale);

  if (groups.length === 0 && !hasRationale) return null;

  return (
    <div className={`agenda-segment-impact variant-${variant}`} aria-label="Etki özeti">
      {groups.length > 0 ? (
        <p className="agenda-impact-inline">
          {groups.map((group, index) => (
            <span key={group.groupId} className="agenda-impact-inline-segment">
              {index > 0 ? <span className="agenda-impact-sep">·</span> : null}
              <InlineGroupRow {...group} />
            </span>
          ))}
        </p>
      ) : null}

      {hasRationale ? (
        <details className="agenda-impact-rationale-wrap">
          <summary className="agenda-impact-rationale-toggle">Neden?</summary>
          {tensionRationale ? (
            <p className="agenda-impact-rationale">
              <span className="agenda-impact-rationale-kind">Gerilim:</span> {tensionRationale}
            </p>
          ) : null}
          {politicalRationale ? (
            <p className="agenda-impact-rationale">
              <span className="agenda-impact-rationale-kind">Politik:</span> {politicalRationale}
            </p>
          ) : null}
        </details>
      ) : null}
    </div>
  );
}
