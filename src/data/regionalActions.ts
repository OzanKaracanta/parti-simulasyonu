/** Bölgeye özel kampanya aksiyonları — harita panelinden seçilir */

export const REGIONAL_ACTION_IDS = new Set<string>([
  'local-meeting',
  'merchant-visit',
  'volunteer-training',
  'regional-tour',
  'local-press-visit',
  'small-donation-drive',
]);

export function isRegionalAction(actionId: string): boolean {
  return REGIONAL_ACTION_IDS.has(actionId);
}
