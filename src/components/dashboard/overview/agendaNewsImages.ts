/** Gündem haber kartı görselleri — imageUrl veya kategori placeholder */

export type AgendaNewsImageKind = 'national' | 'regional';

const PLACEHOLDER_PATHS: Record<AgendaNewsImageKind, string> = {
  national: '/placeholders/national-news-placeholder.svg',
  regional: '/placeholders/regional-news-placeholder.svg',
};

export function resolveAgendaNewsImageUrl(
  imageUrl: string | undefined,
  kind: AgendaNewsImageKind,
): string {
  if (imageUrl?.trim()) return imageUrl;
  return PLACEHOLDER_PATHS[kind];
}
