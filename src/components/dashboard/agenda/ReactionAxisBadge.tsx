import { reactionAxisLabels } from '../../../data/labels';
import type { ReactionAxis } from '../../../types/game';
import './ReactionAxisBadge.css';

interface ReactionAxisBadgeProps {
  axis: ReactionAxis;
  compact?: boolean;
}

export function ReactionAxisBadge({ axis, compact = false }: ReactionAxisBadgeProps) {
  return (
    <span
      className={`reaction-axis-badge axis-${axis}${compact ? ' compact' : ''}`}
      title={`Tepki ekseni: ${reactionAxisLabels[axis]}`}
    >
      {reactionAxisLabels[axis]}
    </span>
  );
}
