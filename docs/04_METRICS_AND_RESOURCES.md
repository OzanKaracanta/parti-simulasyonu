# 04 — Metrics and Resources

## Kaynaklar

### Para

Kampanya aksiyonlarının ana maliyetidir. Reklam, danışmanlık, organizasyon ve saha etkinlikleri para tüketir.

### Enerji

Lider ve kampanya ekibinin haftalık çalışma kapasitesini temsil eder. Operasyon ve gündem tepkileri **seçim anında** enerji düşürür. Hafta sonunda **+22 kısmi yenilenme** uygulanır; tam dolum beklenmemeli. Erken kampanyada tipik hafta: 3–4 operasyon + 1–3 gündem tepkisi. Tüm gündem tepkileri haftalık **14 ⚡** söylem tavanıyla sınırlıdır. Operasyon enerji maliyetleri veri tabanı değerinin ~%88’idir.

### Gönüllü Gücü

Saha çalışması, broşür dağıtımı, yerel ziyaretler ve topluluk faaliyetlerinde kullanılır. Operasyon seçildiğinde gönüllü **tahsis edilir ve hafta boyunca tüketilir** (iade edilmez). Gönüllü eğitimi ve benzeri operasyonlar havuzu büyütür; haftalık toparlanma sınırlıdır.

### İtibar

Partinin kamuoyundaki güvenilirliğini temsil eder (uzun vadeli). TopBar’da haftalık bütçeden ayrı, parti bilgisinde gösterilir. Bazı finansman veya agresif medya aksiyonları itibar riski yaratabilir.

### Koordinasyon (örgüt kapasitesi)

UI’da **Koordinasyon yükü** olarak gösterilir; TopBar haftalık bütçesinde yer almaz. Aynı hafta koordine edilebilecek operasyon tavanı (0–100). Yerel teşkilat ve gönüllü ağıyla artar. Değer **tükenmez**; `organizationLoad` ile haftalık yük tahsis edilir, hafta bitince yük sıfırlanır. Kampanya ekranında `kullanılan/tavan` olarak okunur.

## Temel metrikler

### Medya Gücü

Partinin basında, sosyal medyada ve haber gündeminde ne kadar görünür olduğunu gösterir. Kampanya görünürlüğünü ve kriz açıklaması erişimini artırır.

### Kampanya Görünürlüğü

Seçmenin partiden haberdar olma düzeyidir. Oy oranı artışı için temel çarpanlardan biridir.

### Genç Seçmen Erişimi

Öğrenciler, ilk kez oy kullanacaklar ve genç çalışanlar üzerindeki erişimi temsil eder.

### Yerel Örgütlenme

Mahalle, ilçe, esnaf ziyareti ve gönüllü ağı gücüdür. Bölgesel oy artışında önemlidir.

### Kriz Yönetimi

Skandal, kötü haber, ekonomik kriz veya rakip saldırısı gibi olaylara verilen tepkinin kalitesini gösterir.

### Lider Güveni

Seçmenin parti liderini ciddi, samimi ve yönetebilir görme düzeyidir.

### Politika Güvenilirliği

Partinin vaatlerinin uygulanabilir ve tutarlı görünmesini sağlar.

### Toplumsal Grup Erişimi

Gençler, kadınlar, emekliler, işçiler, esnaf gibi farklı seçmen bloklarına temas gücüdür.

### Finansal Sürdürülebilirlik

Partinin kampanya boyunca para üretme kapasitesidir.

### Bölgesel Nüfuz

Partinin belirli bölgelerde kök salma ve kalıcı destek üretme gücüdür.

## Araç kategorileri

### Yerel Örgütlenme Araçları

- Mahalle toplantısı düzenle
- Esnaf ziyareti yap
- Gönüllü eğitim kampı düzenle
- Bölgesel saha turu yap

### Toplumsal Grup Araçları

- Gençlik buluşması
- Kadın platformu toplantısı
- Emekli forumu
- İşçi ziyareti
- Esnaf yuvarlak masa toplantısı

### Medya ve İletişim Araçları

- Sosyal medya kampanyası
- Yerel basın ziyareti
- Video konuşma yayınla
- Kriz açıklaması yap
- Gündem yorumu paylaş

### Finansman Araçları

- Küçük bağış kampanyası
- Destekçi yemeği
- Üyelik aidatı kampanyası
- Bağışçı ağı kur

### Strateji ve Profesyonelleşme Araçları

- Anket yaptır
- Veri analizi ekibi kur
- Kampanya danışmanı tut
- Hukuk ekibi oluştur
- Politika çalıştayı düzenle

## Operasyonel bütçe

Sabit “max N aksiyon” kuralı yoktur. Haftalık operasyon tavanı **para, enerji, gönüllü ve koordinasyon kotasının** birlikte oluşturduğu yumuşak limitle belirlenir:

- **Erken oyun (~1–10. hafta):** Çoğu oyuncu haftada 3–4 operasyon civarında kalır; para ve enerji genelde ilk kısıtlayıcılar.
- **Orta oyun:** Finansman ve örgüt yatırımları para ve koordinasyon tavanını genişletir.
- **Geç oyun:** Gönüllü ağı ve ulusal örgüt araçları sahada daha geniş operasyon setine izin verir.

Tasarım hedefi: kaynak getiren ve kapasite açan araçlara yatırım, haftalık operasyon sayısını zamanla artırmalıdır.

## Denge prensibi

Aksiyon etkileri lineer olmamalı. Aynı aksiyon üst üste yapıldığında azalan getiri uygulanmalı. Böylece oyuncu farklı stratejiler denemeye teşvik edilir.

Kaynaklar birbirinin yerine geçmemeli: para nakit baskısını, enerji lider tükenmesini, gönüllü saha yoğunluğunu, koordinasyon kotası haftalık plan tavanını temsil etmelidir.
