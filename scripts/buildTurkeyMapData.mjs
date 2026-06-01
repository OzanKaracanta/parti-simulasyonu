/** turkey_map.svg → il path'leri + 7 bölge eşlemesi üretir */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { nearestProvince, TURKEY_PROVINCES } from './turkeyProvinceAnchors.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const svgPath = path.join(root, 'src/assets/turkey_map.svg');
const outPath = path.join(root, 'src/data/turkeyProvinceMap.generated.json');

const svg = fs.readFileSync(svgPath, 'utf8');
const viewBoxMatch = svg.match(/viewBox="([^"]+)"/);
const viewBox = viewBoxMatch?.[1] ?? '0 0 972.22 409.63';
const [vbX, vbY, vbW, vbH] = viewBox.split(/\s+/).map(Number);

function pathBBox(d) {
  const tokens = d.match(/[a-zA-Z]|-?\d*\.?\d+(?:e[-+]?\d+)?/gi) ?? [];
  let i = 0;
  let cmd = '';
  let x = 0;
  let y = 0;
  let sx = 0;
  let sy = 0;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  const add = (px, py) => {
    if (!Number.isFinite(px) || !Number.isFinite(py)) return;
    minX = Math.min(minX, px);
    maxX = Math.max(maxX, px);
    minY = Math.min(minY, py);
    maxY = Math.max(maxY, py);
  };
  const read = () => parseFloat(tokens[i++]);

  while (i < tokens.length) {
    if (/[a-zA-Z]/.test(tokens[i])) cmd = tokens[i++];
    else if (!cmd) break;
    const rel = cmd === cmd.toLowerCase();
    const c = cmd.toUpperCase();
    switch (c) {
      case 'M': {
        let first = true;
        while (i < tokens.length && !/[a-zA-Z]/.test(tokens[i])) {
          let px = read();
          let py = read();
          if (rel) {
            px += x;
            py += y;
          }
          x = px;
          y = py;
          add(px, py);
          if (first) {
            sx = x;
            sy = y;
            first = false;
            cmd = rel ? 'l' : 'L';
          }
        }
        break;
      }
      case 'L':
        while (i < tokens.length && !/[a-zA-Z]/.test(tokens[i])) {
          let px = read();
          let py = read();
          if (rel) {
            px += x;
            py += y;
          }
          x = px;
          y = py;
          add(px, py);
        }
        break;
      case 'H':
        while (i < tokens.length && !/[a-zA-Z]/.test(tokens[i])) {
          let px = read();
          if (rel) px += x;
          x = px;
          add(x, y);
        }
        break;
      case 'V':
        while (i < tokens.length && !/[a-zA-Z]/.test(tokens[i])) {
          let py = read();
          if (rel) py += y;
          y = py;
          add(x, y);
        }
        break;
      case 'C':
        while (i + 5 < tokens.length && !/[a-zA-Z]/.test(tokens[i])) {
          let x1 = read();
          let y1 = read();
          let x2 = read();
          let y2 = read();
          let px = read();
          let py = read();
          if (rel) {
            x1 += x;
            y1 += y;
            x2 += x;
            y2 += y;
            px += x;
            py += y;
          }
          add(x1, y1);
          add(x2, y2);
          x = px;
          y = py;
          add(px, py);
        }
        break;
      case 'S':
        while (i + 3 < tokens.length && !/[a-zA-Z]/.test(tokens[i])) {
          let x2 = read();
          let y2 = read();
          let px = read();
          let py = read();
          if (rel) {
            x2 += x;
            y2 += y;
            px += x;
            py += y;
          }
          add(x2, y2);
          x = px;
          y = py;
          add(px, py);
        }
        break;
      case 'Q':
        while (i + 3 < tokens.length && !/[a-zA-Z]/.test(tokens[i])) {
          let x1 = read();
          let y1 = read();
          let px = read();
          let py = read();
          if (rel) {
            x1 += x;
            y1 += y;
            px += x;
            py += y;
          }
          add(x1, y1);
          x = px;
          y = py;
          add(px, py);
        }
        break;
      case 'T':
        while (i + 1 < tokens.length && !/[a-zA-Z]/.test(tokens[i])) {
          let px = read();
          let py = read();
          if (rel) {
            px += x;
            py += y;
          }
          x = px;
          y = py;
          add(px, py);
        }
        break;
      case 'Z':
        x = sx;
        y = sy;
        cmd = rel ? 'z' : 'Z';
        break;
      default:
        i++;
    }
  }

  return {
    cx: (minX + maxX) / 2,
    cy: (minY + maxY) / 2,
    area: (maxX - minX) * (maxY - minY),
  };
}

/** Çok küçük parçalar veya eşleşme hataları için isteğe bağlı düzeltmeler */
const MANUAL_OVERRIDES = {
  94: 'karadeniz', // Artvin — SVG parçası Ardahan'a en yakın eşleşiyordu
};

const provinces = [...svg.matchAll(/<path class="cls-2" d="([^"]+)"/g)].map((match, index) => {
  const d = match[1];
  const bbox = pathBBox(d);
  const matched = nearestProvince(bbox.cx, bbox.cy, vbW, vbH);
  const regionId = MANUAL_OVERRIDES[index] ?? matched.regionId;
  return {
    id: `province-${index}`,
    regionId,
    provinceName: matched.name,
    path: d,
    cx: Math.round(bbox.cx * 10) / 10,
    cy: Math.round(bbox.cy * 10) / 10,
  };
});

// Eşleşme özeti
const matchedNames = {};
for (const p of provinces) {
  matchedNames[p.provinceName] = (matchedNames[p.provinceName] ?? 0) + 1;
}
const expectedCounts = Object.fromEntries(
  ['marmara', 'ege', 'akdeniz', 'ic-anadolu', 'karadeniz', 'dogu-anadolu', 'guneydogu-anadolu'].map(
    (id) => [id, TURKEY_PROVINCES.filter((p) => p.regionId === id).length],
  ),
);

const regionCentroids = {};
const regionCounts = {};
for (const province of provinces) {
  regionCounts[province.regionId] = (regionCounts[province.regionId] ?? 0) + 1;
  if (!regionCentroids[province.regionId]) {
    regionCentroids[province.regionId] = { sx: 0, sy: 0, n: 0 };
  }
  regionCentroids[province.regionId].sx += province.cx;
  regionCentroids[province.regionId].sy += province.cy;
  regionCentroids[province.regionId].n += 1;
}

const regionLabels = Object.fromEntries(
  Object.entries(regionCentroids).map(([id, { sx, sy, n }]) => [
    id,
    { labelX: Math.round((sx / n) * 10) / 10, labelY: Math.round((sy / n) * 10) / 10 },
  ]),
);

const output = {
  viewBox,
  provinces,
  regionLabels,
  regionCounts,
};

fs.writeFileSync(outPath, `${JSON.stringify(output, null, 2)}\n`);
console.log('Wrote', outPath);
console.log('Region counts:', regionCounts);
console.log('Expected (TÜİK):', expectedCounts);

// Artvin ve Sivas kontrolü
for (const name of ['Artvin', 'Sivas', 'Yozgat', 'Kayseri', 'Çorum', 'Tokat', 'Kahramanmaraş']) {
  const hits = provinces.filter((p) => p.provinceName === name);
  if (hits.length) console.log(`${name}:`, hits.map((p) => p.regionId).join(', '));
}
