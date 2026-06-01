/** Aksiyon → hedef segment eşlemesi */

import type { SegmentId } from '../types/game';

export const ACTION_TARGET_SEGMENTS: Record<string, SegmentId[]> = {
  'local-meeting': ['retirees', 'merchants', 'farmers'],
  'merchant-visit': ['merchants'],
  'volunteer-training': ['youth', 'workers'],
  'regional-tour': ['farmers', 'retirees', 'merchants'],
  'youth-event': ['youth'],
  'women-platform': ['youth', 'workers', 'civilServants'],
  'retiree-forum': ['retirees'],
  'worker-visit': ['workers', 'industry'],
  'merchant-roundtable': ['merchants', 'industry'],
  'social-media-campaign': ['youth', 'civilServants'],
  'local-press-visit': ['retirees', 'merchants', 'civilServants'],
  'video-address': ['youth', 'civilServants', 'retirees'],
  'crisis-statement': ['civilServants', 'retirees'],
  'agenda-commentary': ['youth', 'civilServants', 'workers'],
  'small-donation-drive': ['merchants', 'industry'],
  'supporter-dinner': ['merchants', 'industry'],
  'membership-fee-campaign': ['workers', 'civilServants'],
  'donor-network': ['merchants', 'industry'],
  'poll-commission': ['civilServants', 'workers'],
  'data-team': ['civilServants', 'industry'],
  'campaign-consultant': ['civilServants', 'merchants'],
  'legal-team': ['civilServants', 'retirees'],
  'policy-workshop': ['civilServants', 'workers', 'retirees'],
};

export function getActionTargetSegments(actionId: string): SegmentId[] {
  return ACTION_TARGET_SEGMENTS[actionId] ?? [];
}
