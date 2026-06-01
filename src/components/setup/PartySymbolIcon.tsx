import type { PartySymbolId } from '../../types/game';

interface PartySymbolIconProps {
  symbolId: PartySymbolId;
  size?: number;
  className?: string;
}

const SYMBOL_PATHS: Record<PartySymbolId, string> = {
  sun: 'M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32 1.41-1.41M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z',
  star: 'M12 3.5 14.2 9l5.8.5-4.4 3.8 1.4 5.7L12 16.8 7 19l1.4-5.7L4 9.5l5.8-.5L12 3.5Z',
  tree: 'M12 4 8 11h3v2H7l5 9 5-9h-4v-2h3L12 4Z',
  olive: 'M6 14c2-5 5-7 8-8 1 4-1 8-4 10M8 16c3-1 6-4 7-8',
  scales: 'M5 7h14M12 7v13M8 7 5 12h6M16 7l3 5h-6M9 20h6',
  torch: 'M12 3c-2 3-4 5-4 8a4 4 0 0 0 8 0c0-3-2-5-4-8Zm0 11v6M10 22h4',
  pen: 'M14 4l6 6-9 9H5v-6l9-9Zm-2 2-7 7v3h3l7-7',
  gear: 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm7.5 3 1.2.2.4 1.1-.9.9.9.9-.4 1.1-1.2.2-.2 1.2-1.2.2-1.2-.2-.4-1.1.9-.9-.9-.9.4-1.1 1.2-.2.2-1.2 1.2-.2Z',
  hand: 'M8 11V8.5a1.5 1.5 0 0 1 3 0V11m0-2.5a1.5 1.5 0 0 1 3 0V12m0-3a1.5 1.5 0 0 1 3 0v6.5a5 5 0 0 1-10 0V10a1.5 1.5 0 0 1 3 0v1',
  bridge: 'M4 14h16M6 14v3h2v-3M10 14v3h2v-3M14 14v3h2v-3M18 14v3h2v-3M8 10l4-4 4 4',
  wave: 'M3 14c2-2 4-2 6 0s4 2 6 0 4-2 6 0M3 18c2-2 4-2 6 0s4 2 6 0 4-2 6 0',
  shield: 'M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z',
};

export function PartySymbolIcon({ symbolId, size = 24, className }: PartySymbolIconProps) {
  const path = SYMBOL_PATHS[symbolId];
  const classes = ['party-symbol-icon', className].filter(Boolean).join(' ');

  return (
    <svg
      className={classes}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={path} />
    </svg>
  );
}
