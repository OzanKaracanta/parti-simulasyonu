/** TÜİK 7 coğrafi bölge — 81 il (lat/lon → resmi bölge) */

export const TURKEY_BOUNDS = { minLon: 25.5, maxLon: 45.2, minLat: 35.8, maxLat: 42.15 };

/** @type {{ name: string, lat: number, lon: number, regionId: string }[]} */
export const TURKEY_PROVINCES = [
  // Marmara (11)
  { name: 'Edirne', lat: 41.68, lon: 26.56, regionId: 'marmara' },
  { name: 'Kırklareli', lat: 41.73, lon: 27.22, regionId: 'marmara' },
  { name: 'Tekirdağ', lat: 40.98, lon: 27.51, regionId: 'marmara' },
  { name: 'İstanbul', lat: 41.01, lon: 28.97, regionId: 'marmara' },
  { name: 'Kocaeli', lat: 40.77, lon: 29.95, regionId: 'marmara' },
  { name: 'Sakarya', lat: 40.78, lon: 30.4, regionId: 'marmara' },
  { name: 'Yalova', lat: 40.65, lon: 29.28, regionId: 'marmara' },
  { name: 'Bursa', lat: 40.19, lon: 29.06, regionId: 'marmara' },
  { name: 'Bilecik', lat: 40.14, lon: 29.98, regionId: 'marmara' },
  { name: 'Balıkesir', lat: 39.65, lon: 27.88, regionId: 'marmara' },
  { name: 'Çanakkale', lat: 40.15, lon: 26.41, regionId: 'marmara' },
  // Ege (8)
  { name: 'İzmir', lat: 38.42, lon: 27.14, regionId: 'ege' },
  { name: 'Manisa', lat: 38.62, lon: 27.43, regionId: 'ege' },
  { name: 'Aydın', lat: 37.85, lon: 27.84, regionId: 'ege' },
  { name: 'Muğla', lat: 37.22, lon: 28.36, regionId: 'ege' },
  { name: 'Denizli', lat: 37.77, lon: 29.09, regionId: 'ege' },
  { name: 'Uşak', lat: 38.68, lon: 29.41, regionId: 'ege' },
  { name: 'Kütahya', lat: 39.42, lon: 29.98, regionId: 'ege' },
  { name: 'Afyonkarahisar', lat: 38.76, lon: 30.54, regionId: 'ege' },
  // Akdeniz (8)
  { name: 'Burdur', lat: 37.72, lon: 30.29, regionId: 'akdeniz' },
  { name: 'Isparta', lat: 37.76, lon: 30.56, regionId: 'akdeniz' },
  { name: 'Antalya', lat: 36.89, lon: 30.71, regionId: 'akdeniz' },
  { name: 'Mersin', lat: 36.8, lon: 34.64, regionId: 'akdeniz' },
  { name: 'Adana', lat: 37.0, lon: 35.32, regionId: 'akdeniz' },
  { name: 'Osmaniye', lat: 37.07, lon: 36.25, regionId: 'akdeniz' },
  { name: 'Hatay', lat: 36.2, lon: 36.16, regionId: 'akdeniz' },
  { name: 'Kahramanmaraş', lat: 37.59, lon: 36.93, regionId: 'akdeniz' },
  // İç Anadolu (13)
  { name: 'Eskişehir', lat: 39.78, lon: 30.52, regionId: 'ic-anadolu' },
  { name: 'Ankara', lat: 39.92, lon: 32.85, regionId: 'ic-anadolu' },
  { name: 'Çankırı', lat: 40.6, lon: 33.62, regionId: 'ic-anadolu' },
  { name: 'Kırıkkale', lat: 39.85, lon: 33.51, regionId: 'ic-anadolu' },
  { name: 'Kırşehir', lat: 39.15, lon: 34.16, regionId: 'ic-anadolu' },
  { name: 'Yozgat', lat: 39.82, lon: 34.81, regionId: 'ic-anadolu' },
  { name: 'Sivas', lat: 39.75, lon: 37.02, regionId: 'ic-anadolu' },
  { name: 'Nevşehir', lat: 38.62, lon: 34.72, regionId: 'ic-anadolu' },
  { name: 'Kayseri', lat: 38.73, lon: 35.48, regionId: 'ic-anadolu' },
  { name: 'Aksaray', lat: 38.37, lon: 34.03, regionId: 'ic-anadolu' },
  { name: 'Niğde', lat: 37.97, lon: 34.69, regionId: 'ic-anadolu' },
  { name: 'Konya', lat: 37.87, lon: 32.49, regionId: 'ic-anadolu' },
  { name: 'Karaman', lat: 37.18, lon: 33.22, regionId: 'ic-anadolu' },
  // Karadeniz (18)
  { name: 'Düzce', lat: 40.84, lon: 31.16, regionId: 'karadeniz' },
  { name: 'Bolu', lat: 40.74, lon: 31.61, regionId: 'karadeniz' },
  { name: 'Karabük', lat: 41.2, lon: 32.63, regionId: 'karadeniz' },
  { name: 'Zonguldak', lat: 41.45, lon: 31.79, regionId: 'karadeniz' },
  { name: 'Bartın', lat: 41.63, lon: 32.34, regionId: 'karadeniz' },
  { name: 'Kastamonu', lat: 41.38, lon: 33.78, regionId: 'karadeniz' },
  { name: 'Sinop', lat: 42.03, lon: 35.15, regionId: 'karadeniz' },
  { name: 'Çorum', lat: 40.55, lon: 34.95, regionId: 'karadeniz' },
  { name: 'Amasya', lat: 40.65, lon: 35.83, regionId: 'karadeniz' },
  { name: 'Samsun', lat: 41.29, lon: 36.33, regionId: 'karadeniz' },
  { name: 'Tokat', lat: 40.32, lon: 36.55, regionId: 'karadeniz' },
  { name: 'Ordu', lat: 40.98, lon: 37.88, regionId: 'karadeniz' },
  { name: 'Giresun', lat: 40.92, lon: 38.39, regionId: 'karadeniz' },
  { name: 'Gümüşhane', lat: 40.46, lon: 39.48, regionId: 'karadeniz' },
  { name: 'Trabzon', lat: 41.0, lon: 39.72, regionId: 'karadeniz' },
  { name: 'Bayburt', lat: 40.26, lon: 40.23, regionId: 'karadeniz' },
  { name: 'Rize', lat: 41.02, lon: 40.52, regionId: 'karadeniz' },
  { name: 'Artvin', lat: 41.18, lon: 41.18, regionId: 'karadeniz' },
  // Doğu Anadolu (14)
  { name: 'Ardahan', lat: 41.11, lon: 42.7, regionId: 'dogu-anadolu' },
  { name: 'Kars', lat: 40.6, lon: 43.1, regionId: 'dogu-anadolu' },
  { name: 'Erzurum', lat: 39.9, lon: 41.27, regionId: 'dogu-anadolu' },
  { name: 'Iğdır', lat: 39.92, lon: 44.04, regionId: 'dogu-anadolu' },
  { name: 'Ağrı', lat: 39.72, lon: 43.05, regionId: 'dogu-anadolu' },
  { name: 'Erzincan', lat: 39.75, lon: 39.49, regionId: 'dogu-anadolu' },
  { name: 'Tunceli', lat: 39.11, lon: 39.55, regionId: 'dogu-anadolu' },
  { name: 'Bingöl', lat: 38.89, lon: 40.5, regionId: 'dogu-anadolu' },
  { name: 'Muş', lat: 38.74, lon: 41.49, regionId: 'dogu-anadolu' },
  { name: 'Elazığ', lat: 38.68, lon: 39.22, regionId: 'dogu-anadolu' },
  { name: 'Malatya', lat: 38.35, lon: 38.31, regionId: 'dogu-anadolu' },
  { name: 'Bitlis', lat: 38.4, lon: 42.11, regionId: 'dogu-anadolu' },
  { name: 'Van', lat: 38.49, lon: 43.38, regionId: 'dogu-anadolu' },
  { name: 'Hakkari', lat: 37.57, lon: 43.74, regionId: 'dogu-anadolu' },
  // Güneydoğu Anadolu (9)
  { name: 'Kilis', lat: 36.72, lon: 37.12, regionId: 'guneydogu-anadolu' },
  { name: 'Gaziantep', lat: 37.07, lon: 37.38, regionId: 'guneydogu-anadolu' },
  { name: 'Adıyaman', lat: 37.76, lon: 38.28, regionId: 'guneydogu-anadolu' },
  { name: 'Şanlıurfa', lat: 37.17, lon: 38.79, regionId: 'guneydogu-anadolu' },
  { name: 'Diyarbakır', lat: 37.91, lon: 40.23, regionId: 'guneydogu-anadolu' },
  { name: 'Mardin', lat: 37.32, lon: 40.72, regionId: 'guneydogu-anadolu' },
  { name: 'Batman', lat: 37.88, lon: 41.13, regionId: 'guneydogu-anadolu' },
  { name: 'Siirt', lat: 37.93, lon: 41.94, regionId: 'guneydogu-anadolu' },
  { name: 'Şırnak', lat: 37.52, lon: 42.46, regionId: 'guneydogu-anadolu' },
];

export function projectToSvg(lat, lon, viewBoxW = 972.22, viewBoxH = 409.63) {
  const { minLon, maxLon, minLat, maxLat } = TURKEY_BOUNDS;
  return {
    x: ((lon - minLon) / (maxLon - minLon)) * viewBoxW,
    y: ((maxLat - lat) / (maxLat - minLat)) * viewBoxH,
  };
}

export function nearestProvince(cx, cy, viewBoxW = 972.22, viewBoxH = 409.63) {
  let best = null;
  let bestDist = Infinity;
  for (const province of TURKEY_PROVINCES) {
    const { x, y } = projectToSvg(province.lat, province.lon, viewBoxW, viewBoxH);
    const dist = (x - cx) ** 2 + (y - cy) ** 2;
    if (dist < bestDist) {
      bestDist = dist;
      best = province;
    }
  }
  return best;
}
