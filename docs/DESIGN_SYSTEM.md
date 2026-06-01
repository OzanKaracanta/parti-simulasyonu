# Design System — Parti Simülasyonu (Seviye 3)

**Stil cümlesi:** Dark, premium, tactical, information-dense political strategy interface.

## Token dosyası

Tüm renk, tipografi ve spacing değerleri `src/styles/tokens.css` içinde `--ps-*` olarak tanımlıdır. Parti rengi runtime’da `--party-color` ile set edilir.

## Semantik renkler

| Token / sınıf | Anlam | Kullanım |
|---------------|--------|----------|
| `--ps-crisis` / `.crisis` | Kriz, risk, maliyet | Olay tipi, uyarı, negatif delta |
| `--ps-opportunity` / `.opportunity` | Fırsat, başarı | Bonus, seçili kart, pozitif delta |
| `--ps-agenda` / `.agenda` | Gündem, uyarı | Zorunlu tepki, kısmi sonuç |
| `--ps-info` / `.info` | Bilgi, nötr vurgu | Konu rozeti, ipuçları |
| `.positive` | Artış | Metrik / destek Δ |
| `.negative` | Düşüş | Metrik / destek Δ |

## Kart tipleri

| Sınıf | Rol |
|-------|-----|
| `.fm-panel` + `variant-critical` | Ana gündem / kriz merkezi |
| `.fm-panel` + `variant-command` | Komuta merkezi modülleri |
| `.fm-panel` + `variant-operation` | Operasyon listesi |
| `.ps-card` | Genel içerik bölümü (setup, rapor) |
| `.ps-card--selectable` | Seçilebilir seçenek (renk, sembol) |
| `.operation-card-grid` | Tam operasyon kartı |
| `.ps-surface--hero` | Büyük istatistik kutusu |

## Rozetler (`.fm-badge`)

```html
<span class="fm-badge crisis">Kriz</span>
<span class="fm-badge opportunity">Fırsat</span>
<span class="fm-badge agenda">Gündem</span>
<span class="fm-badge synergy-strong">Tepki sinerjisi</span>
```

React: `import { Badge } from '../ui/Badge'` — `tone` prop ile aynı sınıflar.

## Butonlar (`.ps-btn`)

| Varyant | Sınıf | Örnek |
|---------|--------|--------|
| Birincil | `ps-btn ps-btn--primary` | Kampanyaya başla |
| Başarı / hafta bitir | `ps-btn ps-btn--success` | Haftayı Bitir |
| Tehlike / kaldır | `ps-btn ps-btn--danger` | Operasyon kaldır |
| İkincil | `ps-btn ps-btn--ghost` | İptal |
| Küçük | `ps-btn--sm` | Operasyon ekle |

## Formlar

- `.ps-field` + `label`
- `.ps-input` / `.ps-select`

## Sayfa iskeleti

- `.ps-page` — ortalanmış max genişlik
- `.ps-page-header` — başlık + alt metin
- `.game-shell--setup` / `--dashboard` / `--result`

## Hover / seçili durumlar

- **Seçilebilir kart:** hover → `--ps-border-strong`; selected → yeşil inset şerit
- **Operasyon kartı:** `.operation-card-grid.selected` — aynı mantık
- **Tab:** `.fm-tab.active` — `--party-color` alt çizgi
- **Tepki kartı:** `.response-option.selected` — mavi inset (gündem alanı)

## Dosya haritası

```
src/styles/tokens.css          — değişkenler
src/styles/design-system.css   — primitif sınıflar
src/components/ui/ui.css       — Panel, Tab, Table, Tooltip
src/components/ui/Badge.tsx    — rozet bileşeni
src/components/ui/Button.tsx   — buton bileşeni
```

Yeni ekran eklerken önce token + `ps-*` / `fm-*` sınıflarını kullan; tek seferlik hex renklerden kaçın.

## Panel CSS dosyaları (token’a çevrildi)

- `dashboard/dashboard.css`, `WeeklyEventPanel.css`, `WeekFlowPanel.css`, …
- `report/WeeklyReport.css`
- `organization/organization.css`
- `actions/actions.css`
- `setup/SetupScreen.css`, `result/FinalResultScreen.css`

Gradient durakları (`#1a6b3a` vb.) yalnızca `ui.css` istatistik çubuklarında bilinçli olarak bırakıldı; gerekirse ileride `--ps-gradient-*` token’larına taşınabilir.
