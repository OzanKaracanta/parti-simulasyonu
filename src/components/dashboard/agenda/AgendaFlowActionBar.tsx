import './AgendaFlowActionBar.css';

interface AgendaFlowActionBarProps {
  /** Seçim yapıldı mı — metin ve vurgu durumu */
  hasSelection: boolean;
  nextStepLabel: string;
  onContinue?: () => void;
  /** false ise devam butonu seçim olmadan da aktif (isteğe bağlı adımlar) */
  required?: boolean;
  emptyMessage?: string;
  savedMessage?: string;
  savedDetail?: string;
  continueDisabledLabel?: string;
}

export function AgendaFlowActionBar({
  hasSelection,
  nextStepLabel,
  onContinue,
  required = true,
  emptyMessage = 'Yukarıdaki kartlardan birini seç — seçim anında kaydedilir.',
  savedMessage = 'Yanıt kaydedildi',
  savedDetail = 'Başka bir kartla değiştirebilirsin; sonraki adıma geçmek için devam et.',
  continueDisabledLabel = 'Önce bir tepki seç',
}: AgendaFlowActionBarProps) {
  const canContinue = required ? hasSelection : true;

  return (
    <div
      className={`agenda-flow-action-bar${hasSelection ? ' is-ready' : ''}`}
      aria-live="polite"
    >
      <div className="agenda-flow-action-copy">
        {hasSelection ? (
          <>
            <span className="agenda-flow-action-status" aria-hidden>
              ✓
            </span>
            <p className="agenda-flow-action-message">
              <strong>{savedMessage}</strong> {savedDetail}
            </p>
          </>
        ) : (
          <p className="agenda-flow-action-message">{emptyMessage}</p>
        )}
      </div>

      {onContinue ? (
        <button
          type="button"
          className="agenda-flow-continue-btn"
          disabled={!canContinue}
          onClick={onContinue}
        >
          {canContinue ? nextStepLabel : continueDisabledLabel}
        </button>
      ) : null}
    </div>
  );
}
