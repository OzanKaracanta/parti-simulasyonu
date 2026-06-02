import type { GameState } from '../../../types/game';
import type { DashboardView } from '../DashboardScreen';
import './AgendaWeekFlowStrip.css';

interface AgendaWeekFlowStripProps {
  state: GameState;
  /** Bu sayfada vurgulanacak adım */
  activeStepId: 'response' | 'sub-agenda' | 'regional';
  onNavigate?: (view: DashboardView) => void;
}

type StripStepId = 'response' | 'regional' | 'sub-agenda' | 'operations' | 'headquarters';

interface StripStep {
  id: StripStepId;
  label: string;
  done: boolean;
  nav: DashboardView;
  kind: 'step' | 'action';
}

function renderFlowStep(
  step: StripStep,
  stepNumber: number,
  activeStepId: AgendaWeekFlowStripProps['activeStepId'],
  onNavigate?: (view: DashboardView) => void,
) {
  const isActive = step.id === activeStepId;
  const isNavigable = Boolean(onNavigate && !isActive);

  const stepClassName = [
    'agenda-week-flow-step',
    step.done ? 'done' : '',
    isActive ? 'current' : '',
    isNavigable ? 'is-link' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      <span className="agenda-week-flow-index">{step.done ? '✓' : stepNumber}</span>
      <span className="agenda-week-flow-label">{step.label}</span>
    </>
  );

  return (
    <li key={step.id}>
      {isNavigable ? (
        <button type="button" className={stepClassName} onClick={() => onNavigate!(step.nav)}>
          {content}
        </button>
      ) : (
        <span className={stepClassName} aria-current={isActive ? 'step' : undefined}>
          {content}
        </span>
      )}
    </li>
  );
}

function renderActionStep(
  step: StripStep,
  onNavigate?: (view: DashboardView) => void,
) {
  const stepClassName = [
    'agenda-week-flow-step',
    'is-action-btn',
    step.done ? 'done' : '',
    onNavigate ? 'is-link' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      <span className="agenda-week-flow-label">{step.label}</span>
      <span className="agenda-week-flow-action-arrow" aria-hidden>
        →
      </span>
    </>
  );

  return (
    <li key={step.id}>
      {onNavigate ? (
        <button type="button" className={stepClassName} onClick={() => onNavigate(step.nav)}>
          {content}
        </button>
      ) : (
        <span className={stepClassName}>{content}</span>
      )}
    </li>
  );
}

export function AgendaWeekFlowStrip({
  state,
  activeStepId,
  onNavigate,
}: AgendaWeekFlowStripProps) {
  const hasMainResponse = Boolean(state.selectedEventResponseId);
  const subCount = state.selectedSubAgendaSelections.length;
  const regionalCount = state.selectedRegionalAgendaSelections.length;
  const hasActions = state.selectedActionIds.length > 0;

  const flowSteps: StripStep[] = [
    {
      id: 'response',
      label: 'Ulusal yanıt',
      done: hasMainResponse,
      nav: 'agenda-national',
      kind: 'step',
    },
    ...(state.regionalAgendas.length > 0
      ? [
          {
            id: 'regional' as const,
            label: 'Bölgesel',
            done: regionalCount > 0,
            nav: 'agenda-regional' as DashboardView,
            kind: 'step' as const,
          },
        ]
      : []),
    ...(state.subAgendas.length > 0
      ? [
          {
            id: 'sub-agenda' as const,
            label: 'Alt gündem',
            done: subCount > 0,
            nav: 'agenda-sub' as DashboardView,
            kind: 'step' as const,
          },
        ]
      : []),
  ];

  const actionSteps: StripStep[] = [
    {
      id: 'operations',
      label: 'Operasyonlara Git',
      done: hasActions,
      nav: 'campaign-national',
      kind: 'action',
    },
    {
      id: 'headquarters',
      label: 'Karargâha Git',
      done: false,
      nav: 'overview',
      kind: 'action',
    },
  ];

  return (
    <nav className="agenda-week-flow-strip" aria-label="Haftalık karar akışı">
      <div className="agenda-week-flow-row">
        <ol className="agenda-week-flow-steps agenda-week-flow-steps--flow">
          {flowSteps.map((step, index) => renderFlowStep(step, index + 1, activeStepId, onNavigate))}
        </ol>

        <div className="agenda-week-flow-separator" role="separator" aria-orientation="vertical" />

        <ol className="agenda-week-flow-steps agenda-week-flow-steps--actions">
          {actionSteps.map((step) => renderActionStep(step, onNavigate))}
        </ol>
      </div>
    </nav>
  );
}
