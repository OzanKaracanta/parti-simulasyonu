import type { ReactNode } from 'react';
import './ReportAccordion.css';

interface ReportAccordionProps {
  title: string;
  hint?: string;
  children: ReactNode;
}

export function ReportAccordion({ title, hint, children }: ReportAccordionProps) {
  return (
    <details className="report-accordion">
      <summary className="report-accordion-summary">
        <span className="report-accordion-title">{title}</span>
        {hint ? <span className="report-accordion-hint">{hint}</span> : null}
      </summary>
      <div className="report-accordion-body">{children}</div>
    </details>
  );
}
