/** Haftalık karar akışı — gündem → operasyon → haftayı bitir */

import type { DashboardView } from './DashboardScreen';
import { getEffectiveSubAgendaMaxSlots } from '../../engine/subAgendaSlots';
import { getTutorialProgress } from '../../tutorial/tutorialEngine';
import type { TutorialStepId } from '../../tutorial/tutorialTypes';
import type { GameState } from '../../types/game';
import { Panel } from '../ui/Panel';
import './WeekFlowPanel.css';

interface WeekFlowPanelProps {
  state: GameState;
  tutorialSkipped?: boolean;
  finishCheck?: { ok: boolean; reason?: string };
  onNavigate?: (view: DashboardView) => void;
}

function tutorialRequiresStep(
  week: number,
  stepId: TutorialStepId,
): boolean {
  if (week === 2 && stepId === 'sub_agenda') return true;
  if (week === 4 && stepId === 'campaign_action') return true;
  if (week === 5 && stepId === 'org_investment') return true;
  return false;
}

export function WeekFlowPanel({
  state,
  tutorialSkipped = false,
  finishCheck,
  onNavigate,
}: WeekFlowPanelProps) {
  const hasMainResponse = Boolean(state.selectedEventResponseId);
  const subCount = state.selectedSubAgendaSelections.length;
  const hasSubResponse = subCount > 0;
  const hasActions = state.selectedActionIds.length > 0;
  const resolvedFinish = finishCheck ?? { ok: hasMainResponse };

  const progress = getTutorialProgress(state, tutorialSkipped);
  const tutorialWeek = progress?.week ?? 0;

  const subRequiredByTutorial = tutorialRequiresStep(tutorialWeek, 'sub_agenda');
  const actionsRequiredByTutorial = tutorialRequiresStep(tutorialWeek, 'campaign_action');

  const steps = [
    {
      id: 'response',
      label: 'Ana gündem tepkisi',
      detail: hasMainResponse ? 'Tepki seçildi' : 'Zorunlu — turu bitirmeden önce seç',
      done: hasMainResponse,
      required: true,
      nav: 'agenda-national' as DashboardView,
    },
    {
      id: 'sub-agenda',
      label: 'Alt gündem mesajı',
      detail: hasSubResponse
        ? `${subCount} alt gündeme mesaj verildi`
        : subRequiredByTutorial
          ? 'Öğretici — bu tur en az 1 slot kullan'
          : `İsteğe bağlı — en fazla ${getEffectiveSubAgendaMaxSlots(state)} slot`,
      done: hasSubResponse,
      required: subRequiredByTutorial,
      nav: 'agenda-sub' as DashboardView,
    },
    {
      id: 'actions',
      label: 'Operasyonel destek',
      detail: hasActions
        ? `${state.selectedActionIds.length} aksiyon seçili`
        : actionsRequiredByTutorial
          ? 'Öğretici — en az bir operasyon ekle'
          : 'İsteğe bağlı — tepkiyi sahaya taşı',
      done: hasActions,
      required: actionsRequiredByTutorial,
      nav: 'campaign-national' as DashboardView,
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

  return (
    <Panel title="Haftalık Plan" variant="command" compact className="week-flow-panel">
      {progress ? (
        <p className="week-flow-tutorial-theme">
          <span className="week-flow-tutorial-badge">Öğretici</span>
          {progress.theme}
        </p>
      ) : null}
      <ol className="week-flow-steps">
        {steps.map((step, index) => (
          <li
            key={step.id}
            className={`week-flow-step ${step.done ? 'done' : ''} ${step.active ? 'active' : ''} ${step.required && !step.done ? 'tutorial-required' : ''}`}
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
