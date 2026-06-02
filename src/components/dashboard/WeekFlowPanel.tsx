/** Haftalık karar akışı — gündem → operasyon → haftayı bitir */

import type { DashboardView } from './DashboardScreen';
import { canFinishWeek } from '../../engine/eventEvaluation';
import { getEffectiveSubAgendaMaxSlots } from '../../engine/subAgendaSlots';
import type { GameState } from '../../types/game';
import { Panel } from '../ui/Panel';
import './WeekFlowPanel.css';

interface WeekFlowPanelProps {
  state: GameState;
  finishCheck?: { ok: boolean; reason?: string };
  onNavigate?: (view: DashboardView) => void;
}

type WeekFlowStepId =
  | 'response'
  | 'sub-agenda'
  | 'actions'
  | 'organization'
  | 'finish';

export function WeekFlowPanel({
  state,
  finishCheck,
  onNavigate,
}: WeekFlowPanelProps) {
  const hasMainResponse = Boolean(state.selectedEventResponseId);
  const subCount = state.selectedSubAgendaSelections.length;
  const hasSubResponse = subCount > 0;
  const hasActions = state.selectedActionIds.length > 0;
  const hasOrgActivity = state.weekOrganizationChanged;
  const resolvedFinish = finishCheck ?? canFinishWeek(state);

  const steps: Array<{
    id: WeekFlowStepId;
    label: string;
    detail: string;
    done: boolean;
    required: boolean;
    active?: boolean;
    nav: DashboardView | null;
  }> = [
    {
      id: 'response',
      label: 'Ana gündem tepkisi',
      detail: hasMainResponse ? 'Tepki seçildi' : 'Zorunlu — turu bitirmeden önce seç',
      done: hasMainResponse,
      required: true,
      nav: 'agenda-national',
    },
    {
      id: 'sub-agenda',
      label: 'Alt gündem mesajı',
      detail: hasSubResponse
        ? `${subCount} alt gündeme mesaj verildi`
        : `İsteğe bağlı — en fazla ${getEffectiveSubAgendaMaxSlots(state)} slot`,
      done: hasSubResponse,
      required: false,
      nav: 'agenda-sub',
    },
    {
      id: 'actions',
      label: 'Operasyonel destek',
      detail: hasActions
        ? `${state.selectedActionIds.length} aksiyon seçili`
        : 'İsteğe bağlı — tepkiyi sahaya taşı',
      done: hasActions,
      required: false,
      nav: 'campaign-national',
    },
    {
      id: 'organization',
      label: 'Teşkilatını yönet',
      detail: hasOrgActivity
        ? 'Bu tur teşkilatta değişiklik yapıldı'
        : 'İsteğe bağlı — kur, yükselt veya bakım',
      done: hasOrgActivity,
      required: false,
      nav: 'organization-regional',
    },
    {
      id: 'finish',
      label: 'Turu bitir',
      detail: resolvedFinish.ok ? 'Hazır' : resolvedFinish.reason ?? 'Bekliyor',
      done: false,
      required: true,
      active: resolvedFinish.ok,
      nav: null,
    },
  ];

  const nextStepIndex = steps.findIndex((step) => !step.done && step.id !== 'finish');
  const completedCount = steps.filter((step) => step.done).length;

  return (
    <Panel
      title="Haftalık Plan"
      variant="command"
      className="week-flow-panel week-flow-panel--featured"
      headerExtra={
        <span className="week-flow-progress-badge" aria-label={`${completedCount} adım tamamlandı`}>
          {completedCount}/{steps.length - 1}
        </span>
      }
    >
      <p className="week-flow-lead">
        Tur {state.campaignWeek} — önce gündem, sonra saha ve teşkilat; en son turu bitir.
      </p>
      <ol className="week-flow-steps">
        {steps.map((step, index) => (
          <li
            key={step.id}
            className={[
              'week-flow-step',
              step.done ? 'done' : '',
              step.active ? 'active' : '',
              step.required && !step.done ? 'week-flow-step--required' : '',
              index === nextStepIndex ? 'current' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <span className="week-flow-index">{step.done ? '✓' : index + 1}</span>
            <div className="week-flow-content">
              <span className="week-flow-label">
                {step.label}
                {step.required ? <span className="week-flow-required">*</span> : null}
              </span>
              <span className="week-flow-detail">{step.detail}</span>
            </div>
            {!step.done && step.nav && onNavigate ? (
              <button
                type="button"
                className="week-flow-go-btn"
                onClick={() => onNavigate(step.nav!)}
              >
                Git
              </button>
            ) : null}
          </li>
        ))}
      </ol>
    </Panel>
  );
}
