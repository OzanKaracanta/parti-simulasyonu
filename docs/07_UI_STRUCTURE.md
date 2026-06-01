# 07 — UI Structure

Görsel dil ve token referansı: [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)

## Ana ekran düzeni (Seviye 2)

Genel bakış ve kampanya ekranı **komuta merkezi** düzenini kullanır:

```text
Üst Bar
- Parti · tur · destek · kaynaklar · haftayı bitir

Sol sütun (`dashboard-sidebar`)
- Üstten ana içerikle hizalı; menü kartı yuvarlatılmış köşe + gölge
- Genel Bakış: menü altında `SidebarSegmentSupport` (ulusal segment desteği)
- Menü altına ek modüller eklenebilir
- Genel Bakış / Kampanya / Bölgeler / Örgüt / Raporlar

Ana İçerik (Genel Bakış)
┌─────────────────────────────┬──────────────────┐
│  Gündem (Ana / Alt / Radar) │  Komuta Merkezi  │
│                             │  - Haftalık akış │
│  Operasyonlar (kart grid)   │  - Stratejik özet│
│                             │  - Haftanın planı│
│                             │  - Metrikler     │
│                             │  - Rakipler      │
│                             │  - Harita        │
└─────────────────────────────┴──────────────────┘

Alt Şerit: Canlı olay akışı (EventFeed)
```

### Rol ayrımı

| Alan | Rol |
|------|-----|
| Gündem | Kriz merkezi — tepki kararları |
| Operasyonlar | Sahaya aksiyon kartları (kategori / önerilen sekmeleri) |
| Komuta merkezi | Haftalık özet, plan, metrik, rakip |

## Görsel yön

- Koyu, katmanlı, strateji oyunu paneli (Football Manager + Paradox çizgisi)
- Kart tabanlı; tablo yalnızca rapor / geçmiş ekranlarında
- Renkler anlam taşır: kriz=kırmızı, fırsat=yeşil, gündem=amber, bilgi=mavi
- İlk hedef: desktop web

## MVP ekranları

### Setup Screen

- Parti adı, lider, başlangıç bölgesi, oyuna başla

### Dashboard — Genel Bakış

- Üst bar kaynakları
- Merkez: haftalık gündem + operasyon kartları
- Sağ: komuta merkezi modülleri

### Dashboard — Kampanya

- Sol: tüm operasyon kartları (kategorili)
- Sağ: nakit akışı, akış, plan, radar gündem

### Dashboard — Raporlar (Faz 1–2)

```text
┌──────────────────────────────┬──────────────┐
│  Hafta seçici                │  Parti       │
│  Haftalık Rapor              │  kimliği     │
│  (hero → operasyon → gündem) │  Segment Δ   │
│  [▸ Çevre etkileri]         │              │
├──────────────────────────────┴──────────────┤
│  Geçmiş haftalar (tıklanabilir satırlar)    │
└─────────────────────────────────────────────┘
```

- Rakip / medya / tam segment panelleri kaldırıldı (içerik haftalık raporda)
- Yan panel: kompakt kimlik + yalnızca haftalık segment değişimleri
- Faz 2: hafta navigasyonu, alt gündem mini kartları, çevre etkileri accordion, geçmiş tablo seçimi
- Faz 3: H(n-1)→H(n) karşılaştırma tablosu, `ReportsScreen` modüler yapı

### Rapor bileşenleri (Faz 3)

- `ReportsScreen`, `ReportWeekNav`, `ReportsHistoryTable`
- `ReportWeekCompare`, `useReportWeekSelection`, `reportComparison`
- `WeeklyReport` → `WeeklyReportHero`, `WeeklyReportOperations`, `WeeklyReportAgendaSection`, `WeeklyReportEnvironmentSection`

### Weekly Report / Final Result

- Değişim özeti, skor, yeniden başla

## Bileşenler

- `GameShell`, `TopBar`, `SidebarNav`
- `AgendaHubPanel`, `WeeklyEventPanel`
- `ActionList`, `OperationCard`, `SelectedActionsPanel`
- `CommandCenterPanel`, `WeekFlowPanel`, `StrategicBriefPanel`
- `MetricGrid`, `RegionMap`, `EventFeed`
- `Badge`, `Button` (design system primitives)
- `Panel` — `variant`: default | critical | command | operation
