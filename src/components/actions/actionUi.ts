export function synergyBadgeClass(label: string): string {
  if (label.includes('Tepki sinerjisi')) return 'synergy-strong';
  if (label.includes('Destekleyici')) return 'synergy-moderate';
  if (label.includes('Mesaj çelişkisi')) return 'synergy-misaligned';
  if (label.includes('Zayıf bağ')) return 'synergy-weak';
  if (label.includes('Fırsat')) return 'opportunity';
  if (label.includes('Kriz')) return 'crisis';
  return 'agenda';
}
