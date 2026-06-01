# Segment tepkisi — uygulama fazları

Tasarım özeti: toplumsal–siyasal gündemlerde ideolojik segmentler öncelikli; geçim gündemlerinde sosyo + ideoloji; rakip olaylarında gerilim = hedef rakibin ideoloji tabanı.

## Faz 1 — Motor + UI (bu dalga)

- `reactionAxisEngine`: `political` eksende emekli/işçi/memur vb. sosyo etkilerini filtreler; dar sosyo yalnızca `tensionSegments` içindeyse.
- Rakip saldırısı: `tensionPoliticalSegments` = hedef rakip ideolojisi; `primaryPolitical` = oyuncu ideolojisi (rakiple çakışan primary temizlenir).
- Karar kartlarında `politicalSegmentEffects` (ve ton fallback önizlemesi) gösterilir.

## Faz 2 — Öncelikli içerik

- `crisis-protest-clash` (Miting çevresinde gerilim)
- `crisis-opponent-attack`, `rakip-lider-gaffi`, `rakip-belediye-skandali`
- `targetRivalId` zorunluluğu rakip olaylarında

## Faz 3 — Havuz auditi ✅

- `security` / `mediaPolitics` / `transparency` olayları `political` eksene taşındı (12 ulusal olay)
- `resolveEffectiveReactionAxis` — bu konularda ve `attacksRival` için varsayılan political
- `customEventResponses` — 14 olay seti ideolojik `politicalSegmentEffects` ile güncellendi
- `policyTopic: security` fallback artık emekli/memur çekmiyor

## Faz 4 — İnce ayar ✅

- `MIXED_SOCIO_EFFECT_SCALE` (0.75) — `filterSocioSegmentEffectsByAxis` içinde mixed sosyo yumuşatma
- `getPoliticalAgendaScale` — mixed ana gündem 0.9, alt/bölgesel 0.85
- `TOPIC_POLITICAL_FALLBACKS` — `resolvePoliticalSegments` konu bazlı ideolojik primary/gerilim
- `calculatePoliticalSupportModifier` — katsayı 0.21, cap ±5
- Örnek mixed içerik: `asgari-ucret-beklentisi`, `emekli-maasi-tepkisi`, `vergi-paketi-sizintisi`, `isci-servisi-kazasi`, `genclerin-yurt-protestosu`

## Faz 5 — Oyuncu ideolojisi ✅

- `playerIdeologyPoliticalEngine` — boş `primaryPolitical` → oyuncu tabanı; gerilim listesinden oyuncu segmentleri çıkarılır
- `modulatePoliticalEffectsForPlayerIdeology` — kendi tabanında ±%15–20 güçlü yankı (ana/alt/bölgesel + kart önizlemesi)
- `enrichResolvedForPlayerContext` — rakip saldırısı + oyuncu zenginleştirme tek giriş noktası
- Alt/bölgesel gündem atamasında `enrichSubAgendaWithPlayerIdeology`
- Gölge yankı (`kind: rule`) — tanımlı politik etki yoksa oyuncu tabanına −1; varsa modülasyon
- Kalan mixed olaylara `politicalSegmentEffects` (akaryakıt, OSB, imar, kuraklık, vb.)

## Faz 6 — Denge & QA ✅

- `npm run simulate` — 10 headless kampanya; JSON: `scripts/balance-sim-results.json`
- Politik segment metrikleri: aktif hafta sayısı, oyuncu tabanı net Δ, taban destek ortalaması
- `POLITICAL_ACTIVITY_WEEKS_MIN` (24) — ideolojik yankının kampanyada görünür kalması
- Haftalık rapor metni: `enrichResolvedForPlayerContext` ile oyuncu tabanına göre politik yankı
- `BACKLASH_TARGET_MIN` 11 (segment revizyonu sonrası), `BACKLASH_FALLBACK_ROLL` 0.48
- Kabul: ulusal destek 15–55%, backlash 11–16, politik aktif hafta ≥24
- Son koşu (10 senaryo): destek 0 ihlal, politik 0 ihlal, backlash 2 ihlal (çoğunlukla dengeli/rastgele botlarda 10 — bandın alt sınırına yakın)
