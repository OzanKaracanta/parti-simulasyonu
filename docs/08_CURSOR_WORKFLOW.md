# 08 — Cursor Workflow

## Cursor ile çalışma prensibi

Cursor'a tek seferde “bütün oyunu yap” deme. Bunun yerine küçük, doğrulanabilir sprintler halinde ilerle.

## Sprint 1 — Çalışan iskelet

Hedef:

- Vite + React + TypeScript projesi çalışsın
- Ana dashboard render edilsin
- Başlangıç state'i oluşsun

Cursor promptu:

```text
Bu projedeki docs klasörünü oku. Önce sadece Sprint 1'i uygula: TypeScript tiplerini, başlangıç verisini, game reducer'ı ve temel dashboard layout'unu oluştur. Görsel tasarımı minimal tut. Oyun mekaniğini şimdilik basit ama çalışır yap. Büyük refactor yapmadan önce planını özetle.
```

## Sprint 2 — Aksiyon sistemi

Hedef:

- Aksiyon kartları listelensin
- Oyuncu haftada kaynak bütçesiyle sınırlı operasyon seçsin (sabit max 3 yok; erken oyunda ~3–4)
- Kaynak yetmiyorsa aksiyon seçilemesin
- Seçili aksiyonlar haftayı bitirince uygulansın

## Sprint 3 — Haftalık ilerleme

Hedef:

- Haftayı bitir butonu çalışsın
- Metrikler güncellensin
- Oy oranı hesaplanıp değişsin
- Haftalık rapor oluşsun

## Sprint 4 — Olay sistemi

Hedef:

- Haftalık olaylar eklensin
- Bazı olaylar oyuncuya risk veya fırsat sunsun
- Kriz yönetimi metriği anlamlı hale gelsin

## Sprint 5 — Final seçim sonucu

Hedef:

- 52. hafta sonunda oyun bitsin
- Final ekranı gösterilsin
- Skor ve özet üretilecek

## Cursor'a verilecek genel kurallar

- Her sprint sonunda çalışan uygulama bırak.
- Gereksiz dependency ekleme.
- Game engine fonksiyonlarını React componentlerinin içinde yazma.
- TypeScript hatası bırakma.
- Her yeni dosya için amacını kısa yorumla belirt.
- UI önce işlevsel, sonra güzel olmalı.
