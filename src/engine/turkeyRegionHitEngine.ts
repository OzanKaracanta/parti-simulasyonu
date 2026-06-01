/** Harita tıklama — özel hitmap görselinden kesin bölge tespiti */

import type { RegionId } from '../types/game';

export const TURKEY_MAP_HIT_IMAGE = '/turkey-7-regions-hitmap.png';

/** Hitmap R kanalı → bölge id eşlemesi */
const HIT_ID_TO_REGION: Record<number, RegionId> = {
  1: 'marmara',
  2: 'karadeniz',
  3: 'ege',
  4: 'ic-anadolu',
  5: 'akdeniz',
  6: 'dogu-anadolu',
  7: 'guneydogu-anadolu',
};

export function resolveRegionFromHitPixel(r: number): RegionId | null {
  return HIT_ID_TO_REGION[r] ?? null;
}

export function viewBoxToImagePixel(
  viewX: number,
  viewY: number,
  viewBox: string,
  imageWidth: number,
  imageHeight: number,
): { x: number; y: number } {
  const parts = viewBox.split(/\s+/).map(Number);
  const vbX = parts[0] ?? 0;
  const vbY = parts[1] ?? 0;
  const vbW = parts[2] ?? imageWidth;
  const vbH = parts[3] ?? imageHeight;

  return {
    x: ((viewX - vbX) / vbW) * imageWidth,
    y: ((viewY - vbY) / vbH) * imageHeight,
  };
}

export function clientPointToViewBox(
  svg: SVGSVGElement,
  clientX: number,
  clientY: number,
): { x: number; y: number } | null {
  const ctm = svg.getScreenCTM();
  if (!ctm) return null;

  const point = svg.createSVGPoint();
  point.x = clientX;
  point.y = clientY;
  const local = point.matrixTransform(ctm.inverse());
  return { x: local.x, y: local.y };
}

export function resolveRegionFromMapEvent(
  svg: SVGSVGElement,
  ctx: CanvasRenderingContext2D,
  clientX: number,
  clientY: number,
  viewBox: string,
): RegionId | null {
  const viewPoint = clientPointToViewBox(svg, clientX, clientY);
  if (!viewPoint) return null;

  const { width, height } = ctx.canvas;
  const pixel = viewBoxToImagePixel(viewPoint.x, viewPoint.y, viewBox, width, height);
  const x = Math.round(pixel.x);
  const y = Math.round(pixel.y);
  if (x < 0 || y < 0 || x >= width || y >= height) return null;

  const [r] = ctx.getImageData(x, y, 1, 1).data;
  return resolveRegionFromHitPixel(r);
}

export async function loadTurkeyMapHitCanvas(src: string): Promise<CanvasRenderingContext2D> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Harita hitmap yüklenemedi'));
    img.src = src;
  });

  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas oluşturulamadı');
  ctx.drawImage(image, 0, 0);
  return ctx;
}
