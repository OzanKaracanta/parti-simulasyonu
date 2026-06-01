/** Haftalık karar akışı — gündem → operasyon → haftayı bitir */

import { canFinishWeek } from '../../engine/eventEvaluation';
import { getEffectiveSubAgendaMaxSlots } from '../../engine/subAgendaSlots';
import type { GameState } from '../../types/game';
import { Panel } from '../ui/Panel';
import './WeekFlowPanel.css';

interface WeekFlowPanelProps {
  state: GameState;
}

export function WeekFlowPanel({ state }: WeekFlowPanelProps) {
  const hasMainResponse = Boolean(state.selectedEventResponseId);
  const subCount = state.selectedSubAgendaSelections.length;
  const hasSubResponse = subCount > 0;
  const hasActions = state.selectedActionIds.length > 0;
  const finishCheck = canFinishWeek(state);

  const steps = [
    {
      id: 'response',
      label: 'Ana gündem tepkisi',
      detail: hasMainResponse ? 'Tepki seçildi' : 'Zorunlu — haftayı bitirmeden önce seç',
      done: hasMainResponse,
      required: true,
    },
    {
      id: 'sub-agenda',
      label: 'Alt gündem mesajı',
      detail: hasSubResponse
        ? `${subCount} alt gündeme mesaj verildi`
        : `İsteğe bağlı — en fazla ${getEffectiveSubAgendaMaxSlots(state)} slot`,
      done: hasSubResponse,
      required: false,
    },
    {
      id: 'actions',
      label: 'Operasyonel destek',
      detail: hasActions
        ? `${state.selectedActionIds.length} aksiyon seçili`
        : 'İsteğe bağlı — tepkiyi sahaya taşı',
      done: hasActions,
      required: false,
    },
    {
      id: 'finish',
      label: 'Haftayı bitir',
      detail: finishCheck.ok ? 'Hazır' : finishCheck.reason ?? 'Bekliyor',
      done: false,
      required: true,
      active: finishCheck.ok,
    },
  ];

  return (
    <Panel title="Haftalık Plan" variant="command" compact className="week-flow-panel">
      <ol className="week-flow-steps">
        {steps.map((step, index) => (
          <li
            key={step.id}
            className={`week-flow-step ${step.done ? 'done' : ''} ${step.active ? 'active' : ''}`}
          >
            <span className="week-flow-index">{step.done ? '✓' : index + 1}</span>
            <div className="week-flow-content">
              <span className="week-flow-label">
                {step.label}
                {step.required ? <span className="week-flow-required">*</span> : null}
              </span>
              <span className="week-flow-detail">{step.detail}</span>
            </div>
          </li>
        ))}
      </ol>
    </Panel>
  );
}
