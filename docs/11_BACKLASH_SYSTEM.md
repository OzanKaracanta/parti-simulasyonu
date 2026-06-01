# 11 — Gölge Yankı Sistemi (Hafta Açılışı Backlash)

Taslak — kod öncesi içerik ve tetik kuralları. Amaç: oyuncu “doğru” veya ölçülü hamle yapsa bile **ertesi haftanın ilk anında** ironik / olumsuz bir pop-up ile siyasi bedel hissi vermek.

Bu sistem **ana gündem olayını değiştirmez** (zincir olaylar / `scheduledStoryEvents` ayrı kalır). **Opinion echo**’dan farkı: daha güçlü anlatı, hafta başı modal, ve “başarılı sayılan” tepkilere de tetiklenebilir.

---

## 1. Konumlandırma

| Sistem | Ne zaman | Oyuncu hissi |
|--------|----------|--------------|
| Ana gündem tepkisi | Hafta içi | “Kararımın anlık etkisi” |
| Opinion echo | Hafta sonu → 1–2 hafta sonra feed | “Medyada yankı” |
| Olay zinciri (`eventChains`) | 1–3 hafta sonra **yeni ana olay** | “Gündem evrildi” |
| **Gölge yankı (bu doc)** | Haftayı bitir → **yeni hafta açılışı pop-up** | “İyi niyetim ters tepti” |

---

## 2. Zamanlama ve UX

1. Oyuncu **Haftayı Bitir**’e basar → mevcut hafta etkileri uygulanır (gündem, operasyon, rapor).
2. `finishWeek` sonunda motor, **gelecek hafta** için en fazla **1** gölge yankı adayı seçer (`pendingBacklash`).
3. Hafta sayacı artınca (`advanceWeekWithPolitics` / yeni hafta UI) pop-up açılır:
   - **Başlık** (manşet)
   - **Gövde** (2–3 cümle, ironi / çerçeveleme)
   - **Etki özeti** (1 satır: hangi segment / metrik)
   - Tek buton: **“Yeni haftaya devam”**
4. Aynı metin haftalık raporun “Çevre” bölümünde kısa satır olarak da görünebilir (opsiyonel).

**Sıklık kuralları (öneri):**

- Kampanyada ortalama: **her 3–4 haftada 1** gölge yankı (52 haftada ~12–16).
- Üst üste en fazla **1** hafta boşluk yok — yani iki hafta üst üste backlash yok (`lastBacklashWeek` + cooldown).
- Ana olay zinciri (`scheduledStoryEvents`) ile **aynı hafta** çakışırsa: önce zincir olayı atanır, gölge yankı **ertelenir veya düşük öncelikli tetik iptal** (çift ceza önleme).

---

## 3. Hafta sonu anlık görüntü (tetik sinyalleri)

`finishWeek` anında okunacak alanlar:

| Sinyal | Kaynak | Not |
|--------|--------|-----|
| `eventType` | `currentWeeklyEvent.type` | `crisis` \| `agenda` \| `opportunity` |
| `eventId`, `eventTitle`, `policyTopic` | `currentWeeklyEvent` | İçerik bağlamı |
| `responseId`, `responseLabel`, `tone` | seçilen ana tepki | `bold` \| `measured` \| `passive` |
| `responseLevel` | ana tepki | `success` \| `partial` \| `ignored` |
| `ideologyMatch`, `leadershipMatch` | `alignmentFeedback` | `strong` \| `moderate` \| `weak` \| `clash` |
| `consistencyImpact` | `alignmentFeedback` | ≤ −4 “çelişki” |
| `actionCount` | `selectedActionIds.length` | 0 = operasyon yok |
| `hasRecommendedAction` | önerilen aksiyonlardan ≥1 seçildi mi | `recommendedActionIds` |
| `worstSynergy` | seçilen operasyonların en kötü sinerjisi | `misaligned` > `weak` > … |
| `rivalNarrativeWin` | ana gündem rakip hamlesi | skor > oyuncu (mevcut `simulateRivalMoves`) |
| `subBoldCount` | alt gündem `tone === 'bold'` sayısı | |
| `subSilentCount` | listede kalan alt gündem − cevaplanan | |
| `leaderTrust`, `mediaPower`, `campaignVisibility`, `crisisManagement` | `metrics` | eşik tetikleri |
| `messageConsistency` | state | yüksek + ölçülü = bürokrat algısı |

---

## 4. Tetik matrisi

Her satır bir **tetik kimliği** (`BL-xx`). Birden fazla koşul sağlanırsa **en yüksek `priority`** kazanır; eşitlikte **`weight`** ile zar atılır.

### 4.1 Ana gündem — görünürlük ve ton

| ID | Koşul (hepsi AND, aksi belirtilmede) | Öncelik | Ağırlık | Cooldown |
|----|--------------------------------------|---------|---------|----------|
| **BL-01** | `eventType === 'crisis'` AND `tone === 'measured'` AND `responseLevel !== 'ignored'` AND `actionCount === 0` | 90 | 1.0 | 3 hafta |
| **BL-02** | `eventType === 'crisis'` AND `tone === 'measured'` AND `actionCount >= 1` AND `hasRecommendedAction === false` | 75 | 0.9 | 3 hafta |
| **BL-03** | `eventType === 'crisis'` AND `tone === 'passive'` OR `responseLevel === 'ignored'` | 85 | 1.0 | 2 hafta |
| **BL-04** | `eventType === 'opportunity'` AND (`tone === 'passive'` OR `responseLevel === 'ignored'`) | 80 | 0.95 | 3 hafta |
| **BL-05** | `tone === 'bold'` AND `responseLevel === 'success'` AND `rivalNarrativeWin === true` | 88 | 1.0 | 2 hafta |
| **BL-06** | `tone === 'bold'` AND `responseLevel === 'success'` AND (`ideologyMatch === 'clash'` OR `leadershipMatch === 'weak'`) | 82 | 0.85 | 3 hafta |
| **BL-07** | `responseLevel === 'partial'` AND `messageConsistency >= 65` AND `eventType === 'crisis'` | 70 | 0.75 | 4 hafta |
| **BL-08** | `consistencyImpact <= -8` (ana tepki) | 78 | 0.9 | 3 hafta |

### 4.2 Operasyon ve sinerji

| ID | Koşul | Öncelik | Ağırlık | Cooldown |
|----|-------|---------|---------|----------|
| **BL-10** | `actionCount >= 1` AND `worstSynergy === 'misaligned'` | 86 | 1.0 | 2 hafta |
| **BL-11** | `actionCount >= 2` AND tüm operasyonlar `mediaCommunication` veya `fundraising` AND `eventType === 'crisis'` AND `affectedCategory` ∈ `socialGroups`, `localOrganization` | 72 | 0.7 | 4 hafta |
| **BL-12** | `actionCount === 0` AND `tone === 'bold'` AND `responseLevel === 'success'` | 84 | 0.95 | 3 hafta |

### 4.3 Alt gündem ve çoklu mesaj

| ID | Koşul | Öncelik | Ağırlık | Cooldown |
|----|-------|---------|---------|----------|
| **BL-20** | `subBoldCount >= 2` (aynı hafta) | 76 | 0.8 | 3 hafta |
| **BL-21** | `subSilentCount >= 3` AND `eventType === 'crisis'` | 68 | 0.65 | 4 hafta |

### 4.4 Metrik eşikleri (bağlam)

| ID | Koşul | Öncelik | Ağırlık | Cooldown |
|----|-------|---------|---------|----------|
| **BL-30** | `leaderTrust >= 55` AND `mediaPower < 40` AND (`tone === 'measured'` OR `responseLevel === 'partial'`) | 74 | 0.8 | 4 hafta |
| **BL-31** | `crisisManagement >= 50` AND `campaignVisibility < 35` AND `eventType === 'crisis'` | 71 | 0.75 | 4 hafta |

### 4.5 Deterministik içerik (yüksek öncelik, `eventChains`’ten ayrı)

Belirli `eventId + responseId` için **%100** gölge yankı (zincir olayı olmasa bile). Motor önce bu satırlara bakar.

| ID | sourceEventId | sourceResponseIds (örnek slug) | Not |
|----|---------------|--------------------------------|-----|
| **BL-C01** | `pazar-fiyatlari-krizi` | ölçülü / yumuşak ekonomi tepkisi slug’ları | “Pazar ziyareti yok” |
| **BL-C02** | `emekli-maasi-tepkisi` | `measured` refah dili | “Meydan yok” |
| **BL-C03** | `belediye-ihale-dosyasi` | `ihale-dosyasi-hukuki-surec` | “Hukuk süreci = kaçış” |
| **BL-C04** | `afet-yardim-organizasyonu` | koordinasyon merkezi / telefon hattı (saha yok) | “Masadan yönetim” |
| **BL-C05** | `parti-ici-liste-krizi` | `liste-krizi-gormezden-gel` | “İç kriz büyüdü” |
| **BL-C06** | `rakip-lider-gaffi` | `rakip-gaffi-olculu-yanit` | “Fırsatı kaçırdın” |

> Slug’lar `customEventResponses` / master havuz ile eşleştirilir; implementasyonda `sourceResponseIds` dizisi doldurulur.

---

## 5. Seçim algoritması (özet)

```text
1. lastBacklashWeek + cooldown → uygun değilse çık
2. scheduledStoryEvents.triggerWeek === nextWeek → gölge yankıyı iptal veya ertele (+1 hafta)
3. BL-Cxx deterministik eşleşme varsa → onu seç (storyFlag ile tek sefer)
4. Aksi halde BL-01 … BL-31 arası sağlananları topla
5. priority max grubunda: weight’li rastgele seç
6. Hafta başına en fazla 1 pendingBacklash yaz
```

**Zar eşiği (öneri):** Hiç yüksek öncelik yoksa, en yüksek `weight` aday için `roll < 0.35` ile tetikle (seyrek ama sürpriz). İlk 4 kampanya haftası: tetik yok (öğrenme).

---

## 6. Etki şeması

Gölge yankı **ana haftanın etkisini tekrarlamaz**; küçük “gölge” darbesi:

| Şiddet | Segment (örnek) | Metrik (örnek) | Kaynak |
|--------|-----------------|----------------|--------|
| Hafif | 1 segment −1 | — | BL-07, BL-21 |
| Orta | 2 segment −1 | `mediaPower` −2 | BL-01, BL-10, BL-30 |
| Sert | 2 segment −2 | `leaderTrust` −2, `campaignVisibility` −3 | BL-03, BL-05, BL-C05 |

Pozitif segment verilmez (echo’dan fark).

---

## 7. Örnek metin havuzu

Her tetik için: **manşet**, **gövde**, **etki satırı (UI)**, **önceki hafta ipucu** (raporda, tetik kesinleşmeden).

### BL-01 — Krizde ölçülü, sahada yok

- **Manşet:** Kriz masasında değil, kulisde
- **Gövde:** “{eventTitle}” için verdiğin ölçülü açıklama teknik olarak tutarlı bulundu; ancak o hafta sahada görünür bir hamlen olmadı. Sosyal medyada “parti lideri kriz anında ortalıkta değil” tartışması hızla yayıldı.
- **Etki:** Genç ve emekçi segmentlerde güven kaybı; görünürlük düşer.
- **İpucu (W−1):** Ekibin, ölçülü metnin sahaya taşınmadığını konuşmaya başladı.

**Alternatif gövde (tatil metaforu):**

> Kriz açıklamanı yaparken kamuoyuna uzak kaldığın izlenimi oluştu. Şimdi medyanın birçok kanalında “neredeydin?” sorusu gündemi işgal ediyor.

---

### BL-02 — Ölçülü ama önerilen operasyon yok

- **Manşet:** Doğru cümle, yanlış sahne
- **Gövde:** Mesajın {policyTopic} ekseninde dengeli kaldı; fakat önerilen saha veya iletişim adımlarını atladın. Rakip partiler “sadece basın bülteni” diyerek seni pasif konuma çekti.
- **Etki:** Etkilenen segmentlerde −1; medya gücü hafif düşer.
- **İpucu:** Saha planı boş kaldı; yerel örgüt “merkez konuştu, biz yapmadık” diyor.

---

### BL-03 — Krizde sessiz / zayıf tepki

- **Manşet:** Sessizlik manşet oldu
- **Gövde:** “{eventTitle}” gündeminde net bir duruş sergilemedin. Sessizlik, zayıflık olarak yorumlandı; muhalif taban seni “kaçınan” olarak çerçeveledi.
- **Etki:** Emekli ve kamu çalışanı segmentlerinde −2; lider güveni −2.
- **İpucu:** Anket odaklarında “parti ne diyor?” sorusu boş kaldı.

---

### BL-04 — Fırsat kaçırıldı

- **Manşet:** Fırsat penceresi kapandı
- **Gövde:** “{eventTitle}” senin için olumlu bir gündem penceresiydi; düşük profilli kaldın. Destekçiler “neden konuşmadı?” derken, rakipler boş alanı doldurdu.
- **Etki:** Görünürlük −3; seçilmiş 1 pozitif segment hedefinde momentum kaybı.
- **İpucu:** Fırsat haftası kapanmadan medya ilgisi başka isimlere kaydı.

---

### BL-05 — Cesur kazandı ama rakip anlatıyı çaldı

- **Manşet:** Sen konuştun, o kazandı
- **Gövde:** “{responseLabel}” mesajın destekçi tabanda karşılık buldu; ancak rakip aynı gün daha görünür bir counter-narrative ile gündemi yeniden çerçeveledi. Manşetlerde ikinci plana düştün.
- **Etki:** Ulusal destek değişmezken geniş kitlede “kaybeden hafta” algısı; 2 segment −1.
- **İpucu:** Rakip medya turunu aynı gün planlamış görünüyor.

---

### BL-06 — Cesur ama kimlik dışı

- **Manşet:** Sert konuştun, inandıramadın
- **Gövde:** Cesur duruşun dikkat çekti; fakat parti çizgisi ve liderlik tarzınla uyumsuz bulundu. “Taktiksel sertleşme” yorumları parti içinde ve medyada yayıldı.
- **Etki:** Tutarlılık zaten düşmüşse ek −2 politika güvenilirliği; 2 segment −1.
- **İpucu:** Genel merkez, mesajın “tek seferlik” olduğunu telkin etmeye çalışıyor.

---

### BL-07 — Ölçülü bürokrat algısı

- **Manşet:** Teknik doğru, siyasi soğuk
- **Gövde:** Kriz haftasında ölçülü çizgide kaldın; tutarlılık skorun yüksek. Kamuoyu bunu “soğuk ve mesafeli yönetim” olarak okudu — özellikle dar gelirli kesimlerde.
- **Etki:** Emekçi ve emekli −1; kriz yönetimi metriği +1 ama görünürlük −2 (paradoks hissi).
- **İpucu:** “Çok kontrollü, az insani” yorumları artıyor.

---

### BL-08 — Tutarsızlık yankısı

- **Manşet:** Dünkü sen, bugünkü sen
- **Gövde:** “{eventTitle}” konusundaki bu haftaki mesajın, önceki haftalardaki duruşunla çelişti. Medya karşılaştırmalı haber formatına geçti; güvenilirlik tartışması açıldı.
- **Etki:** Mesaj tutarlılığı zaten düştü; `policyCredibility` −3.
- **İpucu:** Arşiv videoların editöryal “montaj” haberine dönüşüyor.

---

### BL-10 — Operasyon mesajla çelişiyor

- **Manşet:** Saha ile söylem ayrıldı
- **Gövde:** Verdiğin siyasi mesajla aynı hafta yürüttüğün operasyonlar farklı bir hikâye anlattı. “Parti ne istiyor belli değil” yorumu ulusal basına taşındı.
- **Etki:** Seçilen operasyonun hedef segmentlerinde −1; itibar −2.
- **İpucu:** Saha ekipleri, merkez mesajıyla sahayı hizalamakta zorlanıyor.

---

### BL-11 — Krizde sadece medya/para operasyonu

- **Manşet:** Kriz PR’ı gibi göründün
- **Gövde:** Sosyal ve ekonomik kriz haftasında sahayı ziyaret veya yerel temas yerine ağırlıklı olarak medya veya finansman odaklı operasyon seçtin. “Kriz turizmi” eleştirisi gündeme geldi.
- **Etki:** Etkilenen sosyal segmentler −1; yerel örgüt metriği −2.
- **İpucu:** Yerel yöneticiler, “fotoğraf kampanyası” diyalogunu başlattı.

---

### BL-12 — Cesur söz, sıfır operasyon

- **Manşet:** Konuştun, yapmadın
- **Gövde:** “{responseLabel}” ile güçlü bir söylem kurdun; aynı hafta bunu taşıyacak saha veya iletişim adımı atmadın. Rakipler “boş vaat” narratifini başlattı.
- **Etki:** Genç ve işçi −2; lider güveni −2.
- **İpucu:** Destekçi taban “sözünü tut” hashtag’lerini deniyor.

---

### BL-20 — Çok sayıda cesur alt gündem

- **Manşet:** Her yere aynı anda bağırdın
- **Gövde:** Aynı hafta birden fazla alt gündeme agresif mesaj verdin. Ulusal ana mesajın dağınıklaştı; “parti her konuda kutuplaşıyor” çerçevesi güçlendi.
- **Etki:** 3 farklı segmentte −1 (çapraz gerilim).
- **İpucu:** Medya analistleri “mesaj disiplini” uyarısı yaptı.

---

### BL-21 — Alt gündemlere sessiz kalma (kriz haftası)

- **Manşet:** Alt sesler yükseldi
- **Gövde:** Ulusal kriz gündeminde ana mesaj verdin; alt gündemlerde ise çoğuna ses çıkarmadın. Yerel ve segment bazlı tartışmalar “parti ilgisiz” yorumuna döndü.
- **Etki:** Sessiz kalan alt gündem segmentlerinde −1.
- **İpucu:** Bölgesel basın, “merkez dinlemiyor” klişesini kullanıyor.

---

### BL-30 — Güvenilir ama görünmez

- **Manşet:** Güvenilir ama ekranda yok
- **Gövde:** Lider güvenin yüksek; medya erişimin düşük. Ölçülü haftanın ardından “parti iyi yönetiyor ama anlatamıyor” klişesi sabitlendi — rakipler görünürlük alanını doldurdu.
- **Etki:** `campaignVisibility` −3; genç −1.
- **İpucu:** Dijital etkileşim rakiplerin gerisinde kaldı.

---

### BL-31 — Kriz yönetimi iyi, hikâye kötü

- **Manşet:** İşi yaptın, anlatamadın
- **Gövde:** Kriz yönetimi kapasiten yüksek görünüyor; kamuoyuna ise düşük görünürlükle ulaştın. Teknik başarı siyasi kazanıma dönüşmedi.
- **Etki:** `crisisManagement` +1 (iç), `campaignVisibility` −3 (dış).
- **İpucu:** Uzman yorumları “arka planda kalan lider” diyor.

---

## 8. Deterministik örnekler (BL-Cxx)

### BL-C01 — Pazar fiyatları, ölçülü ekonomi dili

- **Manşet:** Pazar yolu boş kaldı
- **Gövde:** Enflasyon krizinde ölçülü ekonomi mesajı seçtin; pazar ve esnaf ziyareti yapılmadı. “Dar gelirliyle empati yok” başlıkları emekli ve esnaf segmentlerinde yankılandı.
- **Etki:** `workers`, `retirees`, `merchants` −1.

### BL-C02 — Emekli maaşı, yumuşak refah dili

- **Manşet:** Meydan sende değildi
- **Gövde:** Emekli tepkisine dengeli bir dil kullandın; sahada görünür destek göstermedin. Dernekler “açıklama yetmez” diyerek medyayı besledi.
- **Etki:** `retirees` −2.

### BL-C03 — İhale dosyası, hukuki süreç vurgusu

- **Manşet:** Şeffaflık süreçte kayboldu
- **Gövde:** Yolsuzluk iddiasına “süreç işlesin” çerçevesiyle yanıt verdin. Muhalefet bunu “soruşturmayı geciktirme” olarak yorumladı; güvenilirlik tartışması büyüdü.
- **Etki:** `civilServants` −1; `policyCredibility` −3.

### BL-C04 — Afet yardımı, masa başı koordinasyon

- **Manşet:** Koordinasyon masası, saha değil
- **Gövde:** Afet gündeminde koordinasyon merkezi ve telefon hattı vurgusu yaptın; sahaya iniş yapılmadı. “Kriz masası liderliği” eleştirisi viral oldu.
- **Etki:** Etkilenen bölge segmentlerinde −2; `leaderTrust` −2.

### BL-C05 — Liste krizi, görmezden gelme

- **Manşet:** İç ses dışarı taştı
- **Gövde:** Parti içi liste krizine müdahale etmedin. Disiplin krizi medyaya sızdı; “kontrolsüz parti” imajı güçlendi.
- **Etki:** `civilServants` −2; `localOrganization` −3.

### BL-C06 — Rakip gaffi, ölçülü yanıt

- **Manşet:** Fırsatı ölçülülükle harcadın
- **Gövde:** Rakip liderin hatasına ölçülü yanıt verdin; destekçilerin “neden saldırmadın?” baskısı, muhaliflerin “zayıf lider” narratifini aynı anda besledi.
- **Etki:** `youth` −1; `campaignVisibility` −2.

---

## 9. İpucu satırları (telegraph şablonları)

Hafta sonu raporunda veya gündem panelinde **tek satır** (tetik kesinleşmeden):

| Tetik ailesi | İpucu şablonu |
|--------------|---------------|
| BL-01 / 02 | Sahaya taşınmayan ölçülü mesaj merak uyandırıyor. |
| BL-05 / 06 | Cesur mesajın rakip gündemiyle çarpışacak gibi. |
| BL-10 | Operasyon planı ana mesajla aynı hikâyeyi anlatmıyor. |
| BL-20 | Birden fazla sert alt mesaj disiplin uyarısı aldı. |
| BL-30 | Güven yüksek, görünürlük düşük — anlatım boşluğu riski. |
| BL-Cxx | (Deterministik satırdaki `hint` alanı; içerik ekibinden) |

---

## 10. Veri modeli (implementasyon için taslak)

```ts
interface BacklashDefinition {
  id: string; // BL-01, BL-C01, ...
  triggerKind: 'rule' | 'content';
  priority: number;
  weight: number;
  cooldownWeeks: number;
  storyFlag?: string; // tek seferlik BL-Cxx
  // rule: koşul ağacı (motor tarafı)
  // content: sourceEventId + sourceResponseIds[]
  headline: string;
  bodyTemplate: string; // {eventTitle}, {responseLabel}, {leaderName}
  effectSummary: string;
  segmentEffects: Partial<Record<SegmentId, number>>;
  metricEffects?: Partial<Record<MetricKey, number>>;
  hintTemplate?: string;
}

interface PendingBacklash {
  id: string;
  triggerWeek: number;
  definitionId: string;
  resolvedHeadline: string;
  resolvedBody: string;
}
```

Dosya önerisi: `src/data/backlashDefinitions.ts` + master doc bu bölümün genişletilmiş kopyası.

---

## 11. Denge kontrol listesi

- [ ] İlk 4 hafta kapalı
- [ ] Haftada en fazla 1 pop-up
- [ ] Zincir olay haftasıyla çakışma kuralı
- [ ] `success + measured + crisis + 0 action` en sık hissedilen “adil sürpriz” — BL-01 ağırlığı izlenmeli
- [ ] Opinion echo ile aynı metni tekrar etme
- [x] 52 haftalık playtest: ortalama backlash sayısı 12–16 (`npm run simulate`, ort. 12.4)

---

## 12. Uygulama (tamamlandı)

| Dosya | Rol |
|-------|-----|
| `src/data/backlashDefinitions.ts` | Tetik tanımları + metin havuzu |
| `src/engine/backlashEngine.ts` | Seçim, planlama, etki uygulama |
| `src/engine/gameEngine.ts` | `finishWeek` entegrasyonu |
| `src/components/dashboard/WeekBacklashModal.tsx` | Hafta açılışı pop-up |
| `src/store/gameReducer.ts` | `DISMISS_WEEK_BACKLASH` |

İlk oynanabilir hafta: **5** (`BACKLASH_FIRST_WEEK`). Zincir olayı ile aynı hafta çakışırsa gölge yankı planlanmaz.

İlgili doc’lar: `09_AGENDA_SYSTEM.md`, `10_EVENT_CONTENT_MASTER.md`, `07_UI_STRUCTURE.md`.
