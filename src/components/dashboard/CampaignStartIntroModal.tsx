/** Yeni kampanya — oyun döngüsü özeti (tur 1) */

import { createPortal } from 'react-dom';
import './CampaignStartIntroModal.css';

interface CampaignStartIntroModalProps {
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
    title: 'Teşkilat',
    text: 'Binaları kurar, yükseltir veya bakımını yönetirsin — uzun vadeli güç ve seçim yeterliliği burada.',
  },
  {
    title: 'Turu bitir',
    text: 'Kararlar uygulanır, kaynaklar güncellenir, yeni tur başlar.',
  },
];

export function CampaignStartIntroModal({
  partyName,
  onDismiss,
}: CampaignStartIntroModalProps) {
  return createPortal(
    <div
      className="campaign-intro-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="campaign-intro-title"
    >
      <div className="campaign-intro-modal">
        <span className="campaign-intro-kicker">Kampanya özeti</span>
        <h2 id="campaign-intro-title">{partyName} — Başlangıç</h2>
        <p className="campaign-intro-lead">
          52 turluk kampanyada her tur aynı döngüyü oynarsın. Mecliste küçük bir gruptan
          başlıyorsun: ulusal desteğin düşük; merkez bölgenizde Genel Merkez ve İl Bürosu, iki
          komşu bölgede İl Bürosu kurulu. Seçime girmek için dört il bürosu ve en az %15 ulusal
          destek gerekir.
        </p>
        <ol className="campaign-intro-steps">
          {LOOP_STEPS.map((step, index) => (
            <li key={step.title}>
              <span className="campaign-intro-index">{index + 1}</span>
              <div>
                <strong>{step.title}</strong>
                <p>{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <footer className="campaign-intro-footer">
          <button type="button" className="ps-btn ps-btn--primary" onClick={onDismiss}>
            Anladım, başla
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
