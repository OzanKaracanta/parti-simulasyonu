# Cursor First Prompt

Aşağıdaki promptu Cursor Agent'a ver:

```text
Bu proje React + TypeScript + Vite ile geliştirilecek bir politik parti simülasyonu oyunudur.

Önce proje kök dizinindeki docs klasörünü ve .cursor/rules dosyalarını oku. Ardından sadece ilk çalışan MVP iskeletini oluştur.

Yapılacaklar:
1. src/types/game.ts dosyasındaki domain tiplerini oluştur veya starter-files içeriğini src altına taşı.
2. src/data/initialGameData.ts içinde başlangıç kaynakları, metrikler, bölgeler ve aksiyonları tanımla.
3. src/engine/gameEngine.ts içinde kaynak kontrolü, aksiyon uygulama, metrik clamp ve haftalık destek hesaplama fonksiyonlarını yaz.
4. src/store/gameReducer.ts içinde SELECT_ACTION, UNSELECT_ACTION, END_WEEK, RESET_GAME actionlarını oluştur.
5. Basit bir App.tsx dashboard'u oluştur.
6. Oyuncu haftada maksimum 3 aksiyon seçebilsin.
7. Haftayı Bitir butonu seçili aksiyonları uygulasın ve haftayı ilerletsin.
8. 12. hafta sonunda final sonuç ekranı göstersin.

Kurallar:
- Büyük ve karmaşık UI yazma. Önce çalışan yapı kur.
- Game logic React componentlerinin içinde olmasın.
- TypeScript hatası bırakma.
- Gereksiz dependency ekleme.
- Değişikliklerden önce kısa bir uygulama planı çıkar, sonra kodla.
```
