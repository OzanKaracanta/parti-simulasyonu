# 01 — Project Brief

## Proje adı

Parti Simülasyonu

## Kısa tanım

Oyuncu, Türkiye'de yeni bir politik parti kurar; yerel örgütlenme, medya görünürlüğü, kampanya araçları, finansman ve toplumsal grup çalışmaları üzerinden partisini büyütür. Amaç, sınırlı kaynakları doğru kullanarak 52 haftalık (1 yıl) kampanya döneminin sonunda mümkün olan en yüksek oy oranına ulaşmaktır.

## Tür

- Politik strateji simülasyonu
- Yönetim oyunu
- Single-player MVP
- İleride leaderboard / online skor sistemi eklenebilir

## Hedef hissiyat

Football Manager'daki uzun vadeli planlama hissi ile tarayıcı tabanlı strateji oyunlarındaki günlük karar alma döngüsünü birleştiren, sade ama derin bir yönetim oyunu.

## MVP hedefi

Oyuncu şu akışı yaşayabilmeli:

1. Parti profiliyle oyuna başlar.
2. Haftalık kaynaklarını görür.
3. Kampanya araçlarını kullanarak farklı metrikleri artırır.
4. Kararlarının bölgesel ve ulusal etki yarattığını görür.
5. Haftalar ilerledikçe olaylara tepki verir.
6. 52. haftanın sonunda seçim sonucu alır.

## Tasarım ilkeleri

- Her aksiyonun bir maliyeti olmalı.
- Her metrik oyuncunun seçmen kitlesini anlamlı şekilde etkilemeli.
- Aynı aksiyonu tekrar tekrar spamlemek verimli olmamalı.
- Oyun, gerçek politik kişileri ya da partileri doğrudan taklit etmemeli.
- MVP'de gerçek harita ve veri şart değil; sistem önce soyut ve dengeli çalışmalı.
- UI sade, okunabilir ve dashboard odaklı olmalı.

## MVP oyun süresi

- Bir kampanya: 52 hafta
- Her hafta: oyuncu kaynak bütçesiyle sınırlı operasyon seçer (erken oyunda ~3–4; örgüt/finansman ilerledikçe artar)
- Her hafta sonunda: kaynaklar, metrikler, olaylar ve kamuoyu güncellenir

## İlk hedef platform

- Web tabanlı React uygulaması
- Daha sonra Steam için Electron/Tauri wrapper değerlendirilebilir
