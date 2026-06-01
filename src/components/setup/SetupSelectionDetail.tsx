interface SetupSelectionDetailProps {
  children: string;
}

/** Seçili seçeneğin kısa açıklaması — kartların içinde değil, altında */
export function SetupSelectionDetail({ children }: SetupSelectionDetailProps) {
  return <p className="setup-selection-detail">{children}</p>;
}
