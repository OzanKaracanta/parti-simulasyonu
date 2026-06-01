# 05 — Tech Architecture

## Stack

- React
- TypeScript
- Vite
- CSS Modules veya sade CSS
- İlk MVP'de backend yok
- State yönetimi için başlangıçta React `useReducer`
- Kalıcı kayıt için ileride `localStorage`

## Mimari prensipler

- Oyun mantığı React componentlerinin içinde yazılmamalı.
- Hesaplama fonksiyonları `src/engine/` altında saf TypeScript fonksiyonları olmalı.
- Veri tanımları `src/data/` altında tutulmalı.
- TypeScript tipleri `src/types/` altında merkezi tanımlanmalı.
- UI componentleri `src/components/` altında bölünmeli.
- İlk MVP'de dış kütüphane bağımlılığı minimum tutulmalı.

## Önerilen klasör yapısı

```text
src/
  App.tsx
  main.tsx
  index.css
  types/
    game.ts
  data/
    initialGameData.ts
    actions.ts
    events.ts
    regions.ts
  engine/
    gameEngine.ts
    scoring.ts
    effects.ts
  store/
    gameReducer.ts
    GameContext.tsx
  components/
    layout/
      GameShell.tsx
    dashboard/
      ResourceBar.tsx
      MetricGrid.tsx
      RegionPanel.tsx
      WeeklyReport.tsx
    actions/
      ActionCard.tsx
      ActionList.tsx
```

## State akışı

```text
UI event
→ dispatch(action)
→ gameReducer
→ gameEngine hesaplamaları
→ yeni GameState
→ UI yeniden render
```

## GameState ana parçaları

- campaignWeek
- maxWeeks
- party
- resources
- metrics
- regions
- availableActions
- selectedActions
- weeklyEvent
- history
- finalResult

## İlk sprint hedefi

1. Vite projesini kur.
2. TypeScript tiplerini oluştur.
3. Başlangıç GameState verisini oluştur.
4. Dashboard layout'u kur.
5. Aksiyon kartlarını listele.
6. Aksiyon seçme ve haftayı bitirme mekanizmasını çalıştır.
7. Haftalık rapor üret.
8. 52. hafta sonunda seçim sonucu ekranı göster.
