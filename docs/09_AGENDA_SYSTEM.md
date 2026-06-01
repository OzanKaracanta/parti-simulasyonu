# 09 — Gündem Sistemi (Ana + Alt Gündem)

Tek sayfalık kural seti. Amaç: ulusal ana gündem ile segment odaklı alt gündemleri ayırmak; “doğru cevap” yerine öncelik ve bedel hissi vermek.

---

## 1. Haftalık yapı

| Katman | Adet | Zorunluluk | Etki alanı |
|--------|------|------------|------------|
| **Ana gündem** (`currentWeeklyEvent`) | 1 | Zorunlu — haftayı bitirmek için 1 tepki | Ulusal metrikler, geniş segmentler, tutarlılık, zincir olay |
| **Alt gündemler** (`subAgenda`) | 4–6 listede; **aktif tepki** sınırlı | Opsiyonel (slot ile) | Seçilen segmentte keskin +/-; diğer segmentlerde gerilim |
| **Radar gündem** (opsiyonel) | 0–2 | Tepki yok | Sonraki hafta slot açar veya rakip mesaj üretir |

Hafta başında `agendaEngine` ana + alt listesini atar. Oyuncu sıra: ana tepki → (isteğe bağlı) alt tepkiler → kampanya aksiyonları (kaynak bütçesiyle sınırlı; erken oyunda ~3–4) → haftayı bitir.

---

## 2. Dikkat bütçesi (slot)

Oyuncu her hafta **sınırlı sayıda** alt gündeme mesaj verebilir; hepsine en iyi cevabı vermek mümkün olmamalı.

| Kampanya evresi | Alt gündem listesi | Aktif tepki slotu |
|-----------------|-------------------|-------------------|
| Faz A (MVP) | 2 | 1 |
| Faz B | 4–5 | 2 |
| Faz C | 5–6 | 3 |

- Slot kullanılmayan alt gündem = **sessiz** (küçük pasif etki veya salience düşüşü; rakip için hafif fırsat).
- Slot aşımı yok; UI seçimi kilitleyerek gösterir.

---

## 3. Maliyetler

| Kaynak | Ana gündem tepkisi | Alt gündem tepkisi |
|--------|-------------------|-------------------|
| Enerji | Tona göre −3 … −8 | −2 … −5 (sert mesaj daha pahalı) |
| İtibar | Nadiren (kriz/çelişki) | Çapraz segment öfkesinde risk |
| Medya kapasitesi (opsiyonel metrik) | Dolaylı | Haftada N slot = N “mesaj kapasitesi” |

Alt gündem **para tüketmez**; örgüt/aksiyonlar para harcar. Böylece “gündem = söylem”, “aksiyon = sahada iş” ayrımı korunur.

---

## 4. Tepki seçenekleri (doğru cevap yok)

Her gündemde **2–3 strateji** (fabrika archetype’ları):

1. **Hedefe net mesaj** — hedef segment +3…+5, karşı/kıyas segment −2…−4, enerji yüksek.
2. **Dengeli / yumuşak** — hedef +1…+2, karşı −0…−1, tutarlılık dostu.
3. **Geç / sessiz** — hedef −1…−2, bazen enerji korur; görünürlük / gündemden kopukluk riski.

**Oyuncuya gösterilmez (seçim öncesi):**

- `Uyumlu` / `Orta uyum` / `Başarılı` rozetleri
- Kesin sayısal delta tablosu

**Gösterilir (seçim öncesi):**

- Tepki metni + ton (Sert / Ölçülü / Pasif)
- **Hedef segment** etiketi: “Özellikle: Genç seçmen”
- **Gerilim uyarısı** (nitel): “Esnaf ve sanayi kesimi hassas” — skor kartı değil
- Tahmini maliyet: “Enerji: orta”

**Gösterilir (hafta sonu raporu):**

- Segment yankıları (coşku / hayal kırıklığı / öfke cümleleri)
- Kimlik uyumu özeti (ideoloji/tutarlılık) — **sonuç** olarak, ipucu olarak değil
- Metrik ve kaynak satırları

`responseLevel` (`success` / `partial` / `ignored`) sadece motor içi; raporda **“Başarılı”** yerine sonuç başlığı: “Genç tabanda ivme”, “İş dünyasında gerilim”.

---

## 5. Segment getiri–götürü

Her alt gündem şablonu taşır:

- `primarySegments[]` — mesajın yöneldiği kesim(ler)
- `tensionSegments[]` — rahatsız olabilecek kesim(ler)
- `policyTopic` — tutarlılık ve ideoloji hesabı için

Örnek (öğrenci / gençlik gündemi):

- Net destek → `youth` +4, `merchants` −3, `industry` −2
- Dengeli → `youth` +2, `merchants` −1
- Geç → `youth` −2, diğerleri nötr

Ana gündem aynı motoru kullanır ama etki **daha geniş ve daha yumuşak** çarpanla uygulanır (×0.7 segment, ×1.0 metrik).

---

## 6. Çapraz kurallar (spam ve çelişki)

| Kural | Koşul | Sonuç |
|-------|--------|--------|
| **Mesaj tutarlılığı** | Aynı `policyTopic`’te son 3 haftada zıt `stanceValue` | `messageConsistency` −3…−6; raporda “çelişen mesajlar” |
| **Aşırı gürültü** | Aynı hafta 2+ “sert” alt tepki | `campaignVisibility` +1 kısa vade, `leaderTrust` −1…−2 |
| **Tam sessizlik** | Ana gündeme tepki yok | Hafta bitmez (mevcut kural) |
| **Çift hedef** | İki alt gündem aynı `tensionSegments`’e sert mesaj | İkincide segment cezası ×1.25 |

---

## 7. Haftalık rapor blokları

Sıra sabit; oyuncu neden-sonuç zincirini okur:

1. **Özet** — tek cümle (oy + ana mesaj)
2. **Ana gündem sonucu** — başlık, hikâye, metrik/kaynak listesi
3. **Alt gündem yankıları** — her slot için: seçilen tepki + 2–4 segment cümlesi
4. **Kimlik ve tutarlılık** — sadece bu hafta değiştiyse
5. **Kampanya aksiyonları** — mevcut blok
6. **Rakip hamleleri** + **yaklaşan gündem** ipucu

`WeeklyHistoryItem` genişletmesi (konsept):

```ts
subAgendaOutcomes: {
  agendaId: string;
  title: string;
  responseLabel: string;
  segmentReactions: SegmentReaction[];
}[];
subAgendaSlotsUsed: number;
subAgendaSlotsMax: number;
```

---

## 8. İçerik üretimi

- **Ana gündem:** `weeklyEvents` havuzu + zamanlanmış zincir (`scheduledStoryEvents`).
- **Alt gündem:** Ana havuzdan `createSubAgendaFromWeeklyEvent` ile türetilir; segment eşlemesi `resolveEventSegments` üzerinden okunur.
- **Radar:** düşük salience kopya; tepki yok; Faz C’de slot veya olay tetikler.

### 8.1 Olay başına segment alanları (Faz 2 — tamamlandı)

Her `WeeklyEvent` kaydında opsiyonel alanlar (`src/data/weeklyEvents.ts`):

| Alan | Açıklama |
|------|----------|
| `reactionAxis` | `socioeconomic` \| `political` \| `mixed` |
| `primarySegments` | Hedef sosyo-ekonomik segmentler |
| `tensionSegments` | Gerilim sosyo-ekonomik segmentler (boş olabilir) |
| `primaryPoliticalSegments` | Olumlu politik yankı blokları |
| `tensionPoliticalSegments` | Ideolojik gerilim blokları |
| `tensionRationale` | UI/rapor: neden gerilim? |
| `politicalRationale` | UI/rapor: politik yankı özeti |

**Öncelik:** Manuel alan → `policyTopic` fallback → boş array. Sistem asla liste sırasına göre gerilim üretmez.

**Politik segmentler (MVP):** `conservative`, `nationalist`, `socialDemocrat`, `liberal`, `populist` — `politicalSegmentSupport` GameState'te tutulur; ulusal oy ince ayarı ±4 puan. Boş `tensionPoliticalSegments` alanlarında lider rakip ideolojisinden otomatik gerilim (Faz 5).

**İçerik yazım kuralı:** Her olay için “kararlı mesajda kim neden mutlu/mutsuz?” sorusu cevaplanmalı. Şeffaflık/yolsuzluk olaylarında gereksiz gerilim atanmamalı.

Mevcut `BackgroundAgendaItem` → `SubAgendaItem` (+ `responseOptions`, segment alanları, `resolveEventSegments`).

---

## 9. UI (dashboard)

```
┌─ Haftanın Gündemi (zorunlu) ─────────────────┐
│  Başlık, açıklama, 2–3 tepki (rozet yok)      │
└──────────────────────────────────────────────┘
┌─ Alt Gündemler — Slot: 1/2 ──────────────────┐
│  [kart] Gençlik protestoları  → tepki seç    │
│  [kart] Esnaf zammı talebi      → sessiz      │
│  [kart] … (liste 4–6, gri = slot doldu)       │
└──────────────────────────────────────────────┘
```

- Seçilen alt kart vurgulu; slot dolunca diğerleri “bu hafta mesaj kapasitesi doldu”.
- Ana panelde **Destekleyici aksiyonlar** alt gündemle **uyumlu** aksiyonları öne çıkarabilir (öneri, zorunlu değil).

---

## 10. Uygulama fazları

| Faz | Kod / içerik | Oyuncu deneyimi |
|-----|----------------|-----------------|
| **A** | `backgroundAgenda` → 2 `SubAgenda` + 1 slot + `evaluateSubAgendaResponses` | Segment yankısı raporda — **tamamlandı** |
| **B** | 5 alt, 2 slot, çapraz kurallar (`subAgendaCrossRules`) | Öncelik oyunu belirgin — **tamamlandı** |
| **C** | 6 alt, 3 slot, radar, rakip alt gündem, zincir — **tamamlandı** | Kampanya hikâyesi derin |
| **D** | Segment revizyonu Faz 1: fabrika düzeltmesi + 10 pilot olay — **tamamlandı** | Anlamlı hedef/gerilim |
| **E** | Segment revizyonu Faz 2: tüm `weeklyEvents` manuel segment alanları — **tamamlandı** | 48/48 olay |
| **F** | Politik segment altyapısı Faz 3: `politicalSegmentSupport`, motor, oy ince ayarı, rapor — **tamamlandı** | GameState + rapor |
| **G** | UI Faz 4: istatistikler sidebar — toplumsal + politik segment panelleri — **tamamlandı** | İstatistikler sayfası |
| **H** | UI Faz 4: eksen rozetleri, eksen-bilinçli kartlar, rapor sidebar/özet — **tamamlandı** | Kart + rapor polish |
| **I** | Rakip + backlash Faz 5: ideoloji→politik gerilim, rakip/backlash politik etki — **tamamlandı** | Motor entegrasyonu |
| **J** | Denge & QA Faz 6: headless sim, 52 hafta segment ölçekleme, sessiz alt gündem tavanı — **tamamlandı** | `npm run simulate` |

**Faz J kabul kriteri (10 headless kampanya):**
- Ulusal oy **15–55%** bandında kalmalı; **9/10 tam uyum**, ort. final **26.2%**
- Agresif/fırsatçı oyun **35%+ zirve** yapabilir (sim-02 max **35.9%**)
- Backlash sayısı **~12–16** / kampanya; ort. **12.3**
- Pasif/ihmal stratejisi cezalandırılır ama ölüm spirali yok (sim-07 uç pasif: min ~14%)

**Faz J denge ayarları:**
- `scaleWeeklySegmentDelta` — kazanç/kayıp asimetrisi (`SEGMENT_GAIN_WEEKLY_SCALE ×2`, kayıp ×1)
- `SUB_AGENDA_MAX_SILENT_PENALTIES_PER_WEEK = 1` — sessiz alt gündem birikimi sınırı
- `applyWeeklySegmentBaselineRecovery` — yalnızca tabanın altında yukarı çekim (üst banda çıkış serbest)
- `applyCampaignMomentumBonus` — tutarlılık ≥55 + cesur hamle → ideoloji segmentlerine haftalık ivme
- `scaleSegmentEffectsByMultiplier` — ±1 taban kaldırıldı (12 haftalık MVP kalıntısı)
- Ulusal oy formülü: segment ağırlığı 0.60, tutarlılık/politik modifier genişletildi (±4)
- Başlangıç segment tabanı yükseltildi; `BACKLASH_FALLBACK_ROLL = 0.45`

**Üst band hedefi (35–45%):** Agresif senaryo sim-02 final **34.4%**, zirve **35.9%**; fırsatçı sim-08 **~31%**. Tutarlı cesur oyun orta-son kampanyada 35%+ zirve yapabilir.

**Simülasyon:** `npm run simulate` → `scripts/balance-sim-results.json` Oyuncu ana tepki + en fazla 1 alt tepki verir; raporda hangi segmentin coştuğu/öfkelendiği net; “uyumlu seçenek” araması UI’da yok.

---

## 11. Mevcut kodla eşleme

| Bu doküman | Mevcut |
|------------|--------|
| Ana gündem | `currentWeeklyEvent`, `evaluateAndApplyEventResponse` |
| Alt gündem listesi | `backgroundAgenda` (şu an pasif, 2 adet) |
| Segment etkisi | `segmentEffects`, `buildSegmentReactions` |
| Tutarlılık | `stanceEngine`, `messageConsistency` |
| Önizleme rozetleri | `previewResponseAlignment` → **kaldır / sadece rapor** |
| Hafta atama | `agendaEngine.assignWeekAgenda` |

---

## 12. Tasarım ilkeleri (özet)

1. Ana gündem = kimlik ve ulusal çizgi; **zorunlu**.
2. Alt gündem = segment avcılığı; **slot ile sınırlı**.
3. Her tepki kazanır ve kaybettirir; rozetler “optimal cevap” göstermez.
4. Sonuçlar hafta sonunda **neden-sonuç diliyle** okunur.
5. İçerik şablon + prosedürel; 52×6 el yapımı hedef değil.

Bu doküman uygulama öncesi referanstır; `03_GAME_LOOP.md` ve `06_DATA_MODEL.md` ile çelişirse önce bu dosya güncellenir, sonra kod.
