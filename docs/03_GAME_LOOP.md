# 03 — Game Loop

## Ana döngü

```text
Yeni Hafta Başlar
→ Oyuncu kaynaklarını ve metriklerini inceler
→ Haftalık olay veya gündem görünür
→ Oyuncu aksiyonlar seçer
→ Aksiyon maliyetleri düşülür
→ Aksiyon etkileri metriklere uygulanır
→ Kamuoyu desteği hesaplanır
→ Haftalık rapor gösterilir
→ Sonraki haftaya geçilir
```

## Kampanya yapısı

- Toplam süre: 52 hafta
- **Sabit aksiyon limiti yok** — haftalık operasyon sayısı kaynak bütçesiyle sınırlanır
- Başlangıçta tipik bir hafta: **3–4 operasyon** (para + enerji + gönüllü + örgüt yükü birlikte dolar)
- Örgüt araçları, finansman altyapısı ve saha yatırımları ilerledikçe aynı haftada daha fazla operasyon mümkün olur
- Bazı aksiyonlar para tüketir
- Bazı aksiyonlar enerji tüketir (haftalık sınırlı yenilenir)
- Bazı aksiyonlar gönüllü gücü tüketir (saha ekibi; haftalık kısmi toparlanma)
- Bazı aksiyonlar örgüt kapasitesi yükü tahsis eder (hafta bitince yük serbest kalır)
- Bazı aksiyonlar itibar riski yaratır

## Operasyonel bütçe (yumuşak limit)

Oyuncunun aynı haftada yapabileceği operasyon sayısı, dört kaynak tavanının **kesişimiyle** belirlenir:

| Kaynak | Rol | Erken oyun etkisi |
|--------|-----|-------------------|
| **Para** | Nakit akışı; saha ve medya maliyetleri | 3–4 orta operasyon sonrası bağış/finansman baskısı |
| **Enerji** | Lider ve merkez ekibinin haftalık iş gücü | 3–4 operasyon sonrası tükenmeye yakın |
| **Gönüllü** | Saha temas kapasitesi | Yoğun yerel/toplu grup operasyonlarında sınır |
| **Örgüt yükü** | Koordinasyon tavanı (`organizationLoad`) | Ağır operasyonlar slot doldurur |

**İlerleme döngüsü:** Finansman operasyonları para kazandırır → örgüt araçları yük tavanını ve yeni aksiyonları açar → gönüllü eğitimi saha kapasitesini büyütür → oyuncu haftalık operasyon setini genişletir.

## Karar baskısı

Oyuncu aynı anda her şeyi yapamamalı. Örneğin:

- Sosyal medya kampanyası görünürlüğü artırır ama yerel örgütlenmeyi artırmaz.
- Bağış gecesi para kazandırır ama itibar riski doğurabilir.
- Gençlik buluşması genç erişimini artırır ama yaşlı seçmenlerde etkisi sınırlıdır.
- Kriz açıklaması kriz etkisini azaltır ama enerji tüketir.

## Haftalık rapor

Her hafta sonunda oyuncuya kısa bir rapor gösterilir:

- Bu hafta ne yaptın?
- Hangi metrikler arttı/azaldı?
- Kamuoyu desteği nasıl değişti?
- Hangi riskler oluştu?
- Bir sonraki hafta için hangi konu öne çıkıyor?

## Seçim skoru

Final skorunu etkileyen ana faktörler:

- Ulusal oy oranı
- Bölgesel dengeli yayılım
- İtibar seviyesi
- Finansal sürdürülebilirlik
- Kriz yönetimi performansı
- Kampanya boyunca yapılan stratejik çeşitlilik
