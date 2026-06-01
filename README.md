# Parti Simülasyonu — Cursor Başlangıç Paketi

Bu paket, React + TypeScript + Vite ile geliştirilecek politik parti simülasyonu oyunu için Cursor'a verilecek proje dokümanlarını, AI coding kurallarını ve başlangıç dosya iskeletini içerir.

## Önerilen kullanım sırası

1. Vite projesini oluştur:

```bash
npm create vite@latest parti-simulasyonu -- --template react-ts
cd parti-simulasyonu
npm install
npm run dev
```

2. Bu paketteki `.cursor/rules` klasörünü proje kök dizinine kopyala.
3. `docs/` klasörünü proje kök dizinine kopyala.
4. `starter-files/src/` içindeki dosyaları Vite projesinin `src/` klasörüne aktar.
5. Cursor'da `prompts/CURSOR_FIRST_PROMPT.md` dosyasındaki promptu çalıştır.

## Bu pakette neler var?

- `docs/01_PROJECT_BRIEF.md` — Oyunun vizyonu, hedefi ve temel tasarım ilkeleri
- `docs/02_MVP_SCOPE.md` — MVP kapsamı, dahil/dahil değil listesi
- `docs/03_GAME_LOOP.md` — Oyunun temel döngüsü
- `docs/04_METRICS_AND_RESOURCES.md` — Metrikler, kaynaklar, araçlar ve etkileşim mantığı
- `docs/05_TECH_ARCHITECTURE.md` — React + TypeScript + Vite mimarisi
- `docs/06_DATA_MODEL.md` — TypeScript veri modeli
- `docs/07_UI_STRUCTURE.md` — Ana ekran ve sayfa yapısı
- `docs/08_CURSOR_WORKFLOW.md` — Cursor ile çalışma yöntemi
- `.cursor/rules/*.mdc` — Cursor'un projeyi doğru anlaması için kalıcı kurallar
- `starter-files/src/*` — İlk sprint için kullanılabilecek kod iskeleti
- `prompts/*` — Cursor'a verilecek hazır promptlar

## Geliştirme yaklaşımı

Önce çalışan, sade bir MVP çıkar. Görsel kaliteyi ve animasyonları daha sonra artır. İlk hedef, oyuncunun 12 haftalık kampanya döngüsünü oynayabilmesi, kararlarının metrikleri değiştirmesi ve seçim sonucunu görebilmesidir.
