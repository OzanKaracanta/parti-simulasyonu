import './weeklyAgenda.css';

interface SupportOperationsSectionProps {
  operationNames: string[];
}

export function SupportOperationsSection({ operationNames }: SupportOperationsSectionProps) {
  if (operationNames.length === 0) return null;

  return (
    <section className="agenda-support-section">
      <h5 className="agenda-section-title">Önerilen Destekleyici Operasyonlar</h5>
      <ul className="agenda-support-names" aria-label="Önerilen destekleyici operasyonlar">
        {operationNames.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
    </section>
  );
}
