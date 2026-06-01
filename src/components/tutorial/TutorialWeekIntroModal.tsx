/** Tur 1 — kampanya başlangıç özeti */

import { createPortal } from 'react-dom';
import './TutorialWeekIntroModal.css';

interface TutorialWeekIntroModalProps {
  partyName: string;
  onDismiss: () => void;
}

const LOOP_STEPS = [
  {
    title: 'Gündem',
    text: 'Ana (zorunlu) ve alt gündemlere mesaj verirsin — seçtiğin anda enerji düşer, söylemini belirler.',
  },
  {
    title: 'Kampanya',
    text: 'Operasyonlar sahada iş yapar — seçimde para, enerji ve gönüllü düşer; koordinasyon kotası haftalık planı sınırlar.',
  },
  {
    title: 'Turu bitir',
    text: 'Kararlar uygulanır, kaynaklar güncellenir, yeni tur başlar.',
  },
];

export function TutorialWeekIntroModal({ partyName, onDismiss }: TutorialWeekIntroModalProps) {
  return createPortal(
    <div className="tutorial-intro-overlay" role="dialog" aria-labelledby="tutorial-intro-title">
      <div className="tutorial-intro-modal">
        <span className="tutorial-intro-kicker">Öğretici tur · 1/5</span>
        <h2 id="tutorial-intro-title">{partyName} — İlk tur</h2>
        <p className="tutorial-intro-lead">
          52 turluk kampanyada her tur aynı döngüyü oynarsın. Mecliste küçük bir gruptan
          başlıyorsun: ulusal desteğin düşük; merkez bölgenizde Genel Merkez ve İl Bürosu, iki
          komşu bölgede İl Bürosu kurulu. Seçime girmek için dört il bürosu ve en az %15 ulusal
          destek gerekir.
        </p>
        <ol className="tutorial-intro-steps">
          {LOOP_STEPS.map((step, index) => (
            <li key={step.title}>
              <span className="tutorial-intro-index">{index + 1}</span>
              <div>
                <strong>{step.title}</strong>
                <p>{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <footer className="tutorial-intro-footer">
          <button type="button" className="ps-btn ps-btn--primary" onClick={onDismiss}>
            Anladım, başla
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
