/** Gündem kartına odak — scroll ve geçici vurgu */

export function getAgendaFocusElementId(agendaId: string): string {
  return `agenda-focus-${agendaId}`;
}

export function scrollToAgendaFocus(agendaId: string): void {
  const element = document.getElementById(getAgendaFocusElementId(agendaId));
  if (!element) return;

  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  element.classList.add('agenda-focus-highlight');

  window.setTimeout(() => {
    element.classList.remove('agenda-focus-highlight');
  }, 2000);
}
