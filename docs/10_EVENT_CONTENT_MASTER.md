# Parti Simülasyonu — İlk Master Gündem Havuzu

Bu dosya, haftalık ana gündem, alt gündem ve radar gündem sistemini beslemek için hazırlanmıştır.

Kurallar:

* Gerçek kişi, parti, kurum ve olay isimleri birebir kullanılmaz.
* Olaylar Türkiye yakın siyasal tarihini andırır ama oyun evrenine aittir.
* `id` alanları kalıcıdır; yayımlandıktan sonra değiştirilmemelidir.
* `type` sadece şu değerlerden biri olmalıdır: `agenda`, `crisis`, `opportunity`.
* `affectedCategory` şu değerlerden biri olmalıdır:

  * `localOrganization`
  * `socialGroups`
  * `mediaCommunication`
  * `fundraising`
  * `strategyProfessionalization`

---

# 1. Olay Havuzu

## 1. pazar-fiyatlari-krizi

* title: Pazar Fiyatları Krizi
* type: crisis
* affectedCategory: socialGroups
* policyTopic: economy
* affectedSegments: workers,retirees,merchants
* recommendedActionIds: local-market-visit,economic-statement,social-media-campaign
* description: Büyük şehirlerde temel gıda fiyatlarının bir hafta içinde hızla yükselmesi kamuoyunda tepki yarattı. Emekliler ve dar gelirli çalışanlar geçim sıkıntısını daha sert dile getirirken, küçük esnaf da maliyet baskısından şikâyet ediyor.
* inspiration: Hayat pahalılığı, gıda enflasyonu, pazar ziyaretleri üzerinden yürüyen siyasal tartışmalar.
* gamePurpose: Oyuncuyu emekçi ve emekli seçmen lehine güçlü mesaj vermek ile esnafı ürkütmeyecek ölçülü ekonomi dili kurmak arasında bırakır.
* notes: Ana gündem için güçlü aday.

## 2. kira-artisi-tartismasi

* title: Kira Artışı Tartışması
* type: agenda
* affectedCategory: socialGroups
* policyTopic: housing
* affectedSegments: youth,workers,retirees
* recommendedActionIds: housing-policy-video,youth-event,local-press-visit
* description: Üniversite şehirleri ve büyükşehirlerde kira artışları yeniden gündeme geldi. Gençler barınma sorununu sosyal medyada görünür kılarken, ev sahipleri maliyet ve vergi yükünden şikâyet ediyor.
* inspiration: Öğrenci barınma krizi, yüksek kira gündemi, büyükşehirlerde konut baskısı.
* gamePurpose: Genç seçmen erişimini artırır; yanlış mesaj verilirse mülk sahibi orta sınıfta tepki üretebilir.
* notes: Alt gündem olarak sık kullanılabilir.

## 3. asgari-ucret-beklentisi

* title: Asgari Ücret Beklentisi
* type: agenda
* affectedCategory: socialGroups
* policyTopic: labor
* affectedSegments: workers,merchants,industry
* recommendedActionIds: worker-visit,economic-statement,union-meeting
* description: Yeni ücret dönemi yaklaşırken işçi temsilcileri yüksek zam talep ediyor. Sanayi çevreleri ise üretim maliyetlerinin daha da artacağı uyarısında bulunuyor.
* inspiration: Asgari ücret görüşmeleri, sendika açıklamaları, işveren-maliyet tartışması.
* gamePurpose: İşçi desteği ile sanayi ve küçük işletme desteği arasında net bir denge kararı yaratır.
* notes: Ana gündem için uygun.

## 4. emekli-maasi-tepkisi

* title: Emekli Maaşı Tepkisi
* type: crisis
* affectedCategory: socialGroups
* policyTopic: welfare
* affectedSegments: retirees,merchants
* recommendedActionIds: retiree-visit,local-market-visit,economic-statement
* description: Emekli dernekleri, maaşların temel ihtiyaçları karşılamadığını belirterek şehir meydanlarında basın açıklamaları yaptı. Gündem kısa sürede yerel medyadan ulusal tartışmaya taşındı.
* inspiration: Emekli maaşı, geçim mitingleri, sosyal yardım tartışmaları.
* gamePurpose: Emekli seçmene doğrudan erişim sağlar; mali kaynak vaatleri fazla agresif olursa bütçe güvenilirliğini düşürebilir.
* notes: Emekliler segmenti için önemli.

## 5. vergi-paketi-sizintisi

* title: Vergi Paketi Sızıntısı
* type: crisis
* affectedCategory: fundraising
* policyTopic: economy
* affectedSegments: merchants,industry,workers
* recommendedActionIds: press-statement,business-roundtable,social-media-campaign
* description: Yeni bir vergi paketi taslağının basına sızması, küçük işletmelerde ve sanayi çevrelerinde rahatsızlık yarattı. Kamuoyu, yükün kimin omzuna bineceğini tartışıyor.
* inspiration: Ek vergi düzenlemeleri, bütçe açığı, kayıt dışılık tartışmaları.
* gamePurpose: Oyuncuya popülist vergi karşıtlığı ile mali disiplin söylemi arasında tercih yaptırır.
* notes: Merkez-sağ/merkez-sol pozisyonu belirginleştirmek için iyi.

## 6. akaryakit-zammi-dalgasi

* title: Akaryakıt Zammı Dalgası
* type: crisis
* affectedCategory: socialGroups
* policyTopic: economy
* affectedSegments: farmers,merchants,industry,workers
* recommendedActionIds: transport-policy-video,farmer-visit,economic-statement
* description: Akaryakıta gelen yeni zamlar ulaşım, tarım ve üretim maliyetlerini artırdı. Nakliyeciler ve çiftçiler tepkili; şehirli seçmen de toplu taşıma ücretlerinin artmasından endişeli.
* inspiration: Akaryakıt zamları, üretici maliyetleri, ulaşım fiyatları.
* gamePurpose: Kırsal ve kentli seçmeni aynı anda etkileyen geniş tabanlı ekonomik kriz olayıdır.
* notes: Güçlü negatif ortam yaratır.

## 7. isci-servisi-kazasi

* title: İşçi Servisi Kazası
* type: crisis
* affectedCategory: socialGroups
* policyTopic: labor
* affectedSegments: workers,industry
* recommendedActionIds: worker-visit,work-safety-statement,local-press-visit
* description: Sanayi bölgesinde meydana gelen işçi servisi kazası, iş güvenliği ve denetim eksikliği tartışmalarını yeniden gündeme taşıdı. Aileler ve sendikalar sorumluların hesap vermesini istiyor.
* inspiration: İş kazaları, iş güvenliği ihmalleri, taşeronlaşma tartışmaları.
* gamePurpose: İşçi desteği kazandırır; fazla sert mesaj sanayi çevrelerinde gerilim yaratabilir.
* notes: Kriz türü için iyi.

## 8. sanayi-elektrik-kesintisi

* title: Sanayi Elektrik Kesintisi
* type: crisis
* affectedCategory: strategyProfessionalization
* policyTopic: energy
* affectedSegments: industry,workers,merchants
* recommendedActionIds: industry-visit,energy-policy-statement,business-roundtable
* description: Organize sanayi bölgesinde yaşanan uzun elektrik kesintileri üretimi aksattı. Sanayiciler altyapı yatırımlarının yetersiz kaldığını söylerken, işçiler vardiya kayıplarından şikâyet ediyor.
* inspiration: Enerji arzı, sanayi üretimi, altyapı yetersizliği.
* gamePurpose: Ekonomi yönetimi kapasitesini göstermek isteyen oyuncu için teknik politika alanı açar.
* notes: Profesyonelleşme metriğini kullanabilir.

## 9. genclerin-yurt-protestosu

* title: Gençlerin Yurt Protestosu
* type: agenda
* affectedCategory: socialGroups
* policyTopic: youth
* affectedSegments: youth
* recommendedActionIds: youth-event,social-media-campaign,housing-policy-video
* description: Üniversite öğrencileri yurt kapasitesinin yetersizliği ve özel yurt fiyatlarının yüksekliği nedeniyle kampüslerde forumlar düzenledi. Sosyal medyada kısa sürede yaygın bir dayanışma etiketi oluştu.
* inspiration: Yurt ve barınma protestoları, gençlik hareketleri.
* gamePurpose: Genç seçmen erişimini ciddi şekilde artırabilir; güvenlikçi dil gençlerde tepki doğurur.
* notes: Ana veya alt gündem olabilir.

## 10. kampus-yasagi-tartismasi

* title: Kampüs Yasağı Tartışması
* type: crisis
* affectedCategory: socialGroups
* policyTopic: freedom
* affectedSegments: youth,civilServants
* recommendedActionIds: youth-event,rights-statement,video-speech
* description: Bir üniversitede kulüp etkinliklerinin izne bağlanması öğrenciler arasında tepki yarattı. Yönetim güvenlik gerekçesi sunarken, öğrenciler ifade özgürlüğünün kısıtlandığını savunuyor.
* inspiration: Kampüs etkinlikleri, öğrenci kulüpleri, ifade özgürlüğü tartışmaları.
* gamePurpose: Özgürlükçü söylem ile düzen/güvenlik söylemi arasında ideolojik pozisyon aldırır.
* notes: Genç seçmen için güçlü.

## 11. sosyal-medya-duzenlemesi

* title: Sosyal Medya Düzenlemesi
* type: agenda
* affectedCategory: mediaCommunication
* policyTopic: media
* affectedSegments: youth,workers,civilServants
* recommendedActionIds: social-media-campaign,rights-statement,press-statement
* description: Meclise sunulacağı konuşulan yeni sosyal medya düzenlemesi, dezenformasyonla mücadele ve ifade özgürlüğü ekseninde tartışılıyor. Genç kullanıcılar düzenlemenin sansüre dönüşmesinden endişeli.
* inspiration: Sosyal medya yasaları, dezenformasyon tartışmaları, platform denetimi.
* gamePurpose: Medya gücü ve genç seçmen metriğini aynı anda etkiler.
* notes: Ana gündem için çok uygun.

## 12. gazeteci-davasi

* title: Gazeteci Davası
* type: crisis
* affectedCategory: mediaCommunication
* policyTopic: media
* affectedSegments: youth,civilServants
* recommendedActionIds: press-statement,rights-statement,video-speech
* description: Tanınmış bir yerel gazetecinin yargılandığı dava, basın özgürlüğü tartışmasını yeniden alevlendirdi. Bazı seçmenler davayı hukuk süreci olarak görürken, muhalif çevreler baskı atmosferinden söz ediyor.
* inspiration: Basın davaları, medya özgürlüğü, yargı bağımsızlığı tartışmaları.
* gamePurpose: Oyuncunun hukuk devleti pozisyonunu görünür kılar; sert çıkış risk ve görünürlük getirir.
* notes: Medya iletişimi kategorisinde iyi çalışır.

## 13. canli-yayin-tartisma-haftasi

* title: Canlı Yayın Tartışma Haftası
* type: opportunity
* affectedCategory: mediaCommunication
* policyTopic: media
* affectedSegments: youth,civilServants,workers
* recommendedActionIds: video-speech,debate-appearance,social-media-campaign
* description: Ulusal kanallarda seçim tartışmaları yoğunlaştı. Medya görünürlüğü ve lider mesajları kritik hale geldi.
* inspiration: Televizyon tartışmaları, lider performansı, kampanya görünürlüğü.
* gamePurpose: Oyuncuya lider güveni ve medya gücü kazanma fırsatı verir.
* notes: Mevcut sistemdeki ana gündeme benzer; korunabilir.

## 14. yerel-kanal-boykotu

* title: Yerel Kanal Boykotu
* type: agenda
* affectedCategory: mediaCommunication
* policyTopic: media
* affectedSegments: merchants,workers,retirees
* recommendedActionIds: local-press-visit,press-statement,community-meeting
* description: Bir yerel kanalın bazı adaylara eşit süre vermediği iddiası bölgede tartışma yarattı. Kanal yönetimi yayın politikasını savunurken, seçmenler adil temsil bekliyor.
* inspiration: Yerel medya tarafgirliği, seçim dönemi yayın tartışmaları.
* gamePurpose: Yerel örgütlenme ve medya ilişkisi arasında karar baskısı yaratır.
* notes: Radar gündem için iyi.

## 15. belediye-ihale-dosyasi

* title: Belediye İhale Dosyası
* type: crisis
* affectedCategory: localOrganization
* policyTopic: corruption
* affectedSegments: merchants,civilServants,workers
* recommendedActionIds: anti-corruption-statement,local-press-visit,legal-team-action
* description: Büyük bir belediye ihalesinde akraba şirketlere avantaj sağlandığı iddiası gündeme geldi. Belgelerin bir kısmı basına yansırken, belediye yönetimi iddiaları reddediyor.
* inspiration: Belediye ihaleleri, nepotizm, yolsuzluk dosyaları.
* gamePurpose: Temiz siyaset mesajı için güçlü fırsat; ölçüsüz suçlama güvenilirlik riski yaratır.
* notes: Ana gündem için ideal.

## 16. imar-plani-gerilimi

* title: İmar Planı Gerilimi
* type: agenda
* affectedCategory: localOrganization
* policyTopic: urbanization
* affectedSegments: merchants,retirees,youth
* recommendedActionIds: neighborhood-visit,urban-policy-statement,local-press-visit
* description: Sahil ilçesinde yeni imar planı, yeşil alanların azalacağı iddiasıyla tepki topladı. Müteahhit çevreleri planın ekonomik canlılık getireceğini savunuyor.
* inspiration: İmar değişiklikleri, kentsel rant, çevre ve kent hakkı tartışmaları.
* gamePurpose: Çevreci kent politikası ile büyüme ve yatırım söylemi arasında tercih yaptırır.
* notes: Ege/Akdeniz bölgelerinde etkili olabilir.

## 17. kentsel-donusum-itirazi

* title: Kentsel Dönüşüm İtirazı
* type: agenda
* affectedCategory: localOrganization
* policyTopic: housing
* affectedSegments: retirees,workers,merchants
* recommendedActionIds: neighborhood-visit,housing-policy-video,legal-team-action
* description: Eski bir mahallede başlatılan dönüşüm projesi, hak sahiplerinin yeterince bilgilendirilmediği iddiasıyla protesto edildi. Deprem güvenliği ile yerinden edilme korkusu karşı karşıya geldi.
* inspiration: Kentsel dönüşüm, hak sahipliği, deprem riski ve rant tartışmaları.
* gamePurpose: Güvenli konut ihtiyacı ile sosyal adalet mesajını dengeletir.
* notes: Ana gündeme de taşınabilir.

## 18. belediye-ulasim-zammi

* title: Belediye Ulaşım Zammı
* type: crisis
* affectedCategory: localOrganization
* policyTopic: transportation
* affectedSegments: youth,workers,retirees
* recommendedActionIds: transport-policy-video,local-press-visit,social-media-campaign
* description: Büyükşehir belediyesinin toplu ulaşıma yaptığı zam, öğrenciler ve düşük gelirli çalışanlar arasında tepki yarattı. Belediye artan maliyetleri gerekçe gösteriyor.
* inspiration: Toplu taşıma zamları, belediye bütçesi, öğrenci indirimleri.
* gamePurpose: Yerel yönetim eleştirisi üzerinden genç ve çalışan seçmen desteği üretir.
* notes: Yerel bölgesel etki için uygun.

## 19. su-kesintisi-haftasi

* title: Su Kesintisi Haftası
* type: crisis
* affectedCategory: localOrganization
* policyTopic: infrastructure
* affectedSegments: workers,merchants,retirees
* recommendedActionIds: neighborhood-visit,infrastructure-statement,local-press-visit
* description: Birkaç ilçede günler süren su kesintileri yurttaşların tepkisine neden oldu. Yetkililer kuraklık ve bakım çalışmalarını gerekçe gösterirken, muhalifler plansızlık eleştirisi yapıyor.
* inspiration: Altyapı arızaları, kuraklık, belediye hizmet krizi.
* gamePurpose: Yerel hizmet kapasitesi ve kriz yönetimi mesajı için kullanılır.
* notes: Kısa vadeli kriz.

## 20. meydan-duzenlemesi-protestosu

* title: Meydan Düzenlemesi Protestosu
* type: crisis
* affectedCategory: socialGroups
* policyTopic: freedom
* affectedSegments: youth,merchants,civilServants
* recommendedActionIds: rights-statement,neighborhood-visit,video-speech
* description: Şehrin simge meydanındaki düzenleme projesi protestolara yol açtı. Gençler ve çevre grupları kamusal alanın korunmasını isterken, yetkililer projenin şehir estetiği için gerekli olduğunu savunuyor.
* inspiration: Kent hakkı protestoları, meydan ve park tartışmaları.
* gamePurpose: Özgürlük, çevre, güvenlik ve düzen eksenlerini aynı anda çalıştırır.
* notes: Zincirleme olaylara çok uygun.

## 21. miting-cevresinde-gerilim

* title: Miting Çevresinde Gerilim
* type: crisis
* affectedCategory: localOrganization
* policyTopic: security
* affectedSegments: youth,workers,civilServants
* recommendedActionIds: calm-statement,rights-statement,security-message
* description: Parti etkinliği yakınında protesto ve polis müdahalesi yaşandı. Toplumsal gruplar yönetim tarzını tartışırken, güvenlik yanlısı seçmenler sert tedbirleri destekliyor.
* inspiration: Miting güvenliği, protesto müdahaleleri, kamu düzeni tartışmaları.
* gamePurpose: Sertlik ve itidal arasında oyuncuya riskli bir tercih sunar.
* notes: Önceki protesto olaylarından sonra follow-up olabilir.

## 22. sinir-otesi-gerilim

* title: Sınır Ötesi Gerilim
* type: crisis
* affectedCategory: strategyProfessionalization
* policyTopic: security
* affectedSegments: workers,civilServants,retirees
* recommendedActionIds: security-message,foreign-policy-statement,video-speech
* description: Sınır hattında yaşanan güvenlik olayı sonrası dış politika ve güvenlik tartışmaları yoğunlaştı. Kamuoyu hem güçlü duruş hem de diplomatik akıl bekliyor.
* inspiration: Sınır güvenliği, dış politika krizleri, operasyon tartışmaları.
* gamePurpose: Millî güvenlik söylemi ile diplomasi vurgusu arasında pozisyon aldırır.
* notes: Ana gündem olabilir.

## 23. multeci-mahallesi-gerilimi

* title: Göçmen Mahallesi Gerilimi
* type: crisis
* affectedCategory: socialGroups
* policyTopic: migration
* affectedSegments: workers,merchants,youth
* recommendedActionIds: calm-statement,neighborhood-visit,social-policy-statement
* description: Bir mahallede göçmenlerle yerel halk arasında yaşanan tartışma kısa sürede siyasi polemiğe dönüştü. Esnaf güvenlik ve rekabetten, sivil toplum ise ayrımcı dilden endişeli.
* inspiration: Göçmen karşıtlığı, mahalle gerilimleri, sosyal uyum tartışmaları.
* gamePurpose: Sert popülist mesaj ile kapsayıcı ama riskli sosyal politika dili arasında karar yaratır.
* notes: Hassas dil gerektirir.

## 24. afet-yardim-organizasyonu

* title: Afet Yardım Organizasyonu
* type: opportunity
* affectedCategory: localOrganization
* policyTopic: disaster
* affectedSegments: workers,retirees,farmers
* recommendedActionIds: volunteer-network,aid-campaign,local-visit
* description: Sel felaketinden etkilenen ilçelerde yardım organizasyonu ihtiyacı doğdu. Partiler ve sivil toplum sahada görünür olmaya çalışıyor.
* inspiration: Sel, deprem, afet sonrası yardım koordinasyonu tartışmaları.
* gamePurpose: Yerel örgütlenme gücü ve lider güveni artırma fırsatı verir.
* notes: Doğru yönetilirse güçlü pozitif sonuç.

## 25. deprem-toplanma-alani-tartismasi

* title: Toplanma Alanı Tartışması
* type: agenda
* affectedCategory: localOrganization
* policyTopic: disaster
* affectedSegments: youth,retirees,workers
* recommendedActionIds: urban-policy-statement,neighborhood-visit,expert-panel
* description: Bir ilçede deprem toplanma alanının ticari projeye açıldığı iddiası tepki çekti. Uzmanlar afet hazırlığının seçim gündeminin merkezinde olması gerektiğini söylüyor.
* inspiration: Deprem riski, toplanma alanları, imar ve afet hazırlığı tartışmaları.
* gamePurpose: Teknik uzmanlık, yerel hassasiyet ve güven duygusu üretir.
* notes: Marmara bölgesi için güçlü.

## 26. findik-ureticisi-tepkisi

* title: Fındık Üreticisi Tepkisi
* type: agenda
* affectedCategory: socialGroups
* policyTopic: agriculture
* affectedSegments: farmers,merchants
* recommendedActionIds: farmer-visit,agriculture-statement,local-press-visit
* description: Karadeniz’de üreticiler açıklanan alım fiyatının maliyetleri karşılamadığını savunuyor. Tüccarlar ise piyasa dengesinin bozulmaması gerektiğini belirtiyor.
* inspiration: Fındık fiyatları, alım politikası, üretici-tüccar dengesi.
* gamePurpose: Kırsal seçmene erişim sağlar; ticaret çevreleriyle gerilim yaratabilir.
* notes: Karadeniz bölgesine özel ağırlık verilebilir.

## 27. kuraklik-alarmi

* title: Kuraklık Alarmı
* type: crisis
* affectedCategory: socialGroups
* policyTopic: agriculture
* affectedSegments: farmers,industry,workers
* recommendedActionIds: agriculture-statement,expert-panel,farmer-visit
* description: İç Anadolu’da kuraklık verileri tarımsal üretim için risk sinyali verdi. Çiftçiler destek isterken, uzmanlar uzun vadeli su politikası çağrısı yapıyor.
* inspiration: Kuraklık, su yönetimi, tarımsal üretim krizi.
* gamePurpose: Kırsal seçmen ve teknik politika kapasitesini aynı anda etkiler.
* notes: İç Anadolu için güçlü.

## 28. balikci-limani-sorunu

* title: Balıkçı Limanı Sorunu
* type: agenda
* affectedCategory: localOrganization
* policyTopic: localEconomy
* affectedSegments: fisherfolk,merchants,tourism
* recommendedActionIds: fisherfolk-visit,local-press-visit,coastal-policy-statement
* description: Kıyı ilçesinde balıkçılar liman bakımının ihmal edildiğini ve teknelerin zarar gördüğünü söylüyor. Turizm işletmeleri ise alanın daha düzenli kullanılması gerektiğini savunuyor.
* inspiration: Kıyı ekonomisi, balıkçı esnafı, turizm-yerel üretim gerilimi.
* gamePurpose: Küçük ama bölgesel derinliği olan yerel gündem üretir.
* notes: Ege, Marmara, Karadeniz için uygun.

## 29. turizm-sezonu-firsati

* title: Turizm Sezonu Fırsatı
* type: opportunity
* affectedCategory: fundraising
* policyTopic: tourism
* affectedSegments: tourism,merchants,workers
* recommendedActionIds: tourism-meeting,business-roundtable,local-press-visit
* description: Turizm sezonu beklentilerin üzerinde başladı. Otelciler ve esnaf memnun; çalışanlar ise sezonluk emek koşullarının da konuşulmasını istiyor.
* inspiration: Turizm sezonu, hizmet sektörü, sezonluk çalışma koşulları.
* gamePurpose: Finansman, esnaf desteği ve çalışan hassasiyeti arasında pozitif fırsat yaratır.
* notes: Akdeniz/Ege için iyi.

## 30. organize-sanayi-acilisi

* title: Organize Sanayi Açılışı
* type: opportunity
* affectedCategory: strategyProfessionalization
* policyTopic: industry
* affectedSegments: industry,workers,merchants
* recommendedActionIds: industry-visit,business-roundtable,economic-statement
* description: Yeni organize sanayi alanının açılışı bölgede istihdam umudu yarattı. Ancak çevre grupları altyapı ve denetim konularında uyarıda bulunuyor.
* inspiration: OSB yatırımları, istihdam ve çevre dengesi.
* gamePurpose: Kalkınma söylemi kurmak isteyen oyuncuya fırsat verir; çevre duyarlılığı ihmal edilirse gençlerde tepki olabilir.
* notes: İç Anadolu, Marmara, Güneydoğu için uygun.

## 31. parti-ici-liste-krizi

* title: Parti İçi Liste Krizi
* type: crisis
* affectedCategory: strategyProfessionalization
* policyTopic: partyManagement
* affectedSegments: youth,civilServants,workers
* recommendedActionIds: internal-meeting,unity-statement,local-organization-visit
* description: Aday listelerinde bazı yerel isimlerin dışarıda bırakılması parti içinde huzursuzluk yarattı. İlçe teşkilatları açıklama bekliyor.
* inspiration: Aday listesi krizleri, parti içi hizipler, teşkilat tepkileri.
* gamePurpose: Parti disiplini, örgüt morali ve lider güveni üzerinde baskı yaratır.
* notes: Oyuncunun iç yönetim becerisini test eder.

## 32. genclik-kollari-cikisi

* title: Gençlik Kolları Çıkışı
* type: opportunity
* affectedCategory: socialGroups
* policyTopic: youth
* affectedSegments: youth
* recommendedActionIds: youth-event,social-media-campaign,video-speech
* description: Partinin gençlik kolları yaratıcı bir kampanyayla sosyal medyada gündem oldu. Ana yönetimin bu enerjiyi sahiplenip sahiplenmeyeceği merak ediliyor.
* inspiration: Gençlik örgütleri, viral kampanyalar, sosyal medya siyaseti.
* gamePurpose: Genç seçmen erişimi ve kampanya görünürlüğü için düşük riskli fırsat sunar.
* notes: Pozitif alt gündem için iyi.

## 33. aday-adayi-bagis-tartismasi

* title: Aday Adayı Bağış Tartışması
* type: crisis
* affectedCategory: fundraising
* policyTopic: ethics
* affectedSegments: merchants,civilServants,youth
* recommendedActionIds: transparency-statement,internal-audit,press-statement
* description: Bazı aday adaylarından yüksek bağış beklendiği iddiası parti finansmanı tartışmasını büyüttü. Rakipler durumu fırsata çevirmeye çalışıyor.
* inspiration: Siyasette bağış, adaylık süreçleri, etik tartışmaları.
* gamePurpose: Finansman ihtiyacı ile temiz siyaset imajı arasında gerilim kurar.
* notes: Parti kimliği metriğini etkileyebilir.

## 34. anket-sirketi-indirimi

* title: Anket Şirketi İndirimi
* type: opportunity
* affectedCategory: strategyProfessionalization
* policyTopic: campaign
* affectedSegments: youth,workers,merchants,retirees
* recommendedActionIds: polling-package,data-analysis,strategic-meeting
* description: Bir araştırma firması kısa süreliğine uygun fiyatlı kamuoyu analizi teklifi sunuyor. Stratejik kararlar için yeni veri fırsatı var.
* inspiration: Kampanya döneminde anket ve veri analizi kullanımı.
* gamePurpose: Oyuncuya kaynak harcayarak daha bilinçli strateji kurma fırsatı verir.
* notes: Radar gündem/fırsat olarak iyi.

## 35. rakip-lider-gaffi

* title: Rakip Lider Gafı
* type: opportunity
* affectedCategory: mediaCommunication
* policyTopic: campaign
* affectedSegments: youth,workers,retirees
* recommendedActionIds: social-media-campaign,video-speech,press-statement
* description: Rakip parti liderinin canlı yayındaki talihsiz ifadesi sosyal medyada gündem oldu. Seçmenler bu çıkışın ciddiye alınıp alınmayacağını izliyor.
* inspiration: Lider gafları, viral siyasi klipler, medya gündemi.
* gamePurpose: Oyuncuya saldırgan kampanya ile devlet ciddiyeti arasında tercih yaptırır.
* notes: Fırsat ama aşırı kullanım itibar riski yaratır.

## 36. rakip-belediye-skandali

* title: Rakip Belediye Skandalı
* type: opportunity
* affectedCategory: localOrganization
* policyTopic: corruption
* affectedSegments: merchants,workers,retirees
* recommendedActionIds: anti-corruption-statement,local-press-visit,legal-team-action
* description: Rakip partinin yönettiği belediyede usulsüz harcama iddiaları basına yansıdı. Yerel halk açıklama bekliyor.
* inspiration: Belediye usulsüzlükleri, muhalefet fırsatı, yerel hesap verebilirlik.
* gamePurpose: Temiz yönetim mesajını güçlendirme fırsatı verir.
* notes: Bölgesel rakip zayıflatma etkisi olabilir.

## 37. secim-hukuku-sorusturmasi

* title: Seçim Hukuku Soruşturması
* type: crisis
* affectedCategory: strategyProfessionalization
* policyTopic: electionLaw
* affectedSegments: civilServants,youth,retirees
* recommendedActionIds: legal-team-action,calm-statement,press-statement
* description: Seçim kampanyası harcamalarına ilişkin soruşturma haberi basına yansıdı. Hukuki ve iletişim hattı aynı anda doğru yönetilmek zorunda.
* inspiration: Seçim mevzuatı, kampanya finansmanı, hukuki baskı tartışmaları.
* gamePurpose: Oyuncunun kriz iletişimi ve hukuki kapasitesini test eder.
* notes: Fazla sert tepki riskli olmalı.

## 38. sandik-guvenligi-tartismasi

* title: Seçim Güvenliği Tartışması
* type: agenda
* affectedCategory: strategyProfessionalization
* policyTopic: electionLaw
* affectedSegments: youth,civilServants,retirees
* recommendedActionIds: legal-team-action,training-meeting,press-statement
* description: Bazı bölgelerde seçmen listeleri ve sandık düzenine ilişkin iddialar gündeme geldi. Seçmenler hem güvence hem de panik yaratmayan bir dil bekliyor.
* inspiration: Seçmen listeleri, seçim güvenliği, sandık tartışmaları.
* gamePurpose: Güvenilirlik, örgüt kapasitesi ve seçmen mobilizasyonu etkiler.
* notes: Kullanıcı daha önce sandık gücünü kaldırmıştı; burada operasyon aracı değil gündem olarak kullanılabilir.

## 39. kamu-calisani-atama-tepkisi

* title: Kamu Çalışanı Atama Tepkisi
* type: agenda
* affectedCategory: socialGroups
* policyTopic: publicSector
* affectedSegments: civilServants,youth
* recommendedActionIds: civil-servant-meeting,rights-statement,social-media-campaign
* description: Kamu atamalarında mülakat ve liyakat tartışması yeniden gündeme geldi. Genç mezunlar adil süreç talep ederken, kamu çalışanları kurumsal itibarın zedelendiğini düşünüyor.
* inspiration: KPSS, mülakat, liyakat, kamu personel rejimi tartışmaları.
* gamePurpose: Gençler ve memurlar arasında güçlü bağ kurabilir.
* notes: Sosyal gruplar için iyi.

## 40. dini-bayram-ziyaretleri

* title: Bayram Ziyaretleri Haftası
* type: opportunity
* affectedCategory: localOrganization
* policyTopic: culture
* affectedSegments: retirees,merchants,workers
* recommendedActionIds: neighborhood-visit,local-press-visit,community-meeting
* description: Bayram haftasında mahalle ziyaretleri ve yerel temaslar seçmenle sıcak ilişki kurmak için fırsat yaratıyor. Fazla politik dil kullanmak ise samimiyet algısını zedeleyebilir.
* inspiration: Bayramlaşma programları, mahalle siyaseti, yerel temaslar.
* gamePurpose: Düşük riskli yerel örgütlenme ve lider güveni fırsatı sağlar.
* notes: Haftalık tempo rahatlatıcı fırsat olayı.

---

# 2. Ana Gündem Özel Tepkileri

Aşağıdaki tepkiler yalnızca özelleştirilmiş ana gündemler içindir. Diğer olaylar otomatik şablon tepkilerle çalışabilir.

---

## pazar-fiyatlari-krizi

### Tepki 1

* responseId: pazar-fiyatlari-refah-paketi
* label: Güçlü Refah Paketi Açıkla
* tone: bold
* description: Gıda fiyatları, emekli maaşı ve düşük gelirli aileler için kapsamlı destek paketi vaat et.
* outcomeTitle: Refah Paketi Gündem Oldu
* outcomeDescription: Geçim sıkıntısı yaşayan seçmenlerde güçlü karşılık buldun. Ancak bazı esnaf ve piyasa aktörleri vaatlerin finansmanını sorgulamaya başladı.
* stanceValue: -2
* segmentEffects: workers:+5,retirees:+5,merchants:-2
* metricEffects: campaignVisibility:+3,policyCredibility:-1
* energyCost: -6

### Tepki 2

* responseId: pazar-fiyatlari-denetim-ve-uretim
* label: Denetim ve Üretim Dengesi Kur
* tone: measured
* description: Fiyat artışlarını sadece marketlere bağlamadan üretim, lojistik ve denetim dengesini anlat.
* outcomeTitle: Dengeli Ekonomi Mesajı
* outcomeDescription: Mesajın geniş kesimlerde makul bulundu. Sert çözüm bekleyen seçmenlerde etkisi sınırlı kaldı ama güvenilirlik kaybetmedin.
* stanceValue: 0
* segmentEffects: workers:+2,retirees:+2,merchants:+1,industry:+1
* metricEffects: policyCredibility:+3,leaderTrust:+1
* energyCost: -4

### Tepki 3

* responseId: pazar-fiyatlari-gundemi-sogut
* label: Gündemi Sakinleştir
* tone: passive
* description: Krizi büyütmeden, teknik ekiplerin çalıştığını söyleyerek düşük profilli açıklama yap.
* outcomeTitle: Fırsat Kaçtı
* outcomeDescription: Gıda fiyatları seçmenin ana gündemiyken düşük profilli kalman görünürlüğünü azalttı. Rakipler daha net mesajlarla öne çıktı.
* stanceValue: 0
* segmentEffects: workers:-2,retirees:-2,merchants:+1
* metricEffects: campaignVisibility:-3,leaderTrust:-1
* energyCost: -1

---

## asgari-ucret-beklentisi

### Tepki 1

* responseId: asgari-ucret-yuksek-zam
* label: Yüksek Zam Çağrısı Yap
* tone: bold
* description: Asgari ücretin gerçek enflasyon ve kira baskısına göre ciddi şekilde artırılması gerektiğini savun.
* outcomeTitle: İşçi Tabanında Güçlü Etki
* outcomeDescription: Çalışan seçmende desteğin arttı. Fakat sanayi ve küçük işletme çevreleri maliyet baskısı nedeniyle mesafeli yaklaştı.
* stanceValue: -2
* segmentEffects: workers:+6,industry:-3,merchants:-2
* metricEffects: campaignVisibility:+2
* energyCost: -5

### Tepki 2

* responseId: asgari-ucret-destekli-model
* label: İşveren Destekli Ücret Modeli Öner
* tone: measured
* description: Ücret artışının işveren prim desteği ve vergi indirimiyle birlikte düşünülmesi gerektiğini anlat.
* outcomeTitle: Teknik Çözüm Algısı
* outcomeDescription: Hem çalışan hem işveren tarafına seslenen önerin güvenilir bulundu. Ancak mesajın heyecan üretme gücü sınırlı kaldı.
* stanceValue: 0
* segmentEffects: workers:+3,industry:+2,merchants:+2
* metricEffects: policyCredibility:+4,leaderTrust:+1
* energyCost: -5

### Tepki 3

* responseId: asgari-ucret-piyasaya-birak
* label: Piyasa Dengesi Vurgula
* tone: passive
* description: Ücret tartışmasının ekonomik dengeler gözetilerek yürütülmesi gerektiğini söyle.
* outcomeTitle: Soğuk Mesaj Tepkisi
* outcomeDescription: İş dünyasında ölçülü karşılansa da çalışan seçmen mesajı yetersiz buldu. Gündemin duygusal ağırlığını kaçırdın.
* stanceValue: +1
* segmentEffects: workers:-4,industry:+2,merchants:+1
* metricEffects: leaderTrust:-1
* energyCost: -2

---

## sosyal-medya-duzenlemesi

### Tepki 1

* responseId: sosyal-medya-ozgurluk-savunusu
* label: Özgürlük Savunusu Yap
* tone: bold
* description: Düzenlemenin sansüre dönüşebileceğini söyleyerek güçlü bir ifade özgürlüğü kampanyası başlat.
* outcomeTitle: Gençlerde Güçlü Karşılık
* outcomeDescription: Genç seçmen ve dijital kitleler mesajını hızla sahiplendi. Ancak düzen ve güvenlik hassasiyeti yüksek seçmenlerde tepki oluştu.
* stanceValue: -2
* segmentEffects: youth:+6,civilServants:+1,retirees:-2
* metricEffects: mediaPower:+4,campaignVisibility:+4
* energyCost: -6

### Tepki 2

* responseId: sosyal-medya-denge
* label: Özgürlük ve Sorumluluk Dengesi Kur
* tone: measured
* description: Dezenformasyonla mücadele gerektiğini ama bunun yargı güvencesi ve şeffaflıkla yapılması gerektiğini savun.
* outcomeTitle: Dengeli Dijital Politika
* outcomeDescription: Mesajın geniş kitlelerde makul bulundu. Genç seçmen seni tamamen sahiplenmese de güvenilirlik kazandın.
* stanceValue: 0
* segmentEffects: youth:+3,civilServants:+2,retirees:+1
* metricEffects: policyCredibility:+3,mediaPower:+2
* energyCost: -4

### Tepki 3

* responseId: sosyal-medya-guvenlik-onceligi
* label: Dijital Güvenliği Öne Çıkar
* tone: passive
* description: Sosyal medyada yalan haber ve provokasyon risklerine dikkat çekerek düzenleme ihtiyacını vurgula.
* outcomeTitle: Genç Seçmende Mesafe
* outcomeDescription: Güvenlik hassasiyeti olan seçmenler mesajını olumlu karşıladı. Fakat genç ve dijital kitlelerde özgürlükçü görünürlüğün azaldı.
* stanceValue: +1
* segmentEffects: youth:-4,retirees:+2,civilServants:+1
* metricEffects: mediaPower:-1,leaderTrust:+1
* energyCost: -3

---

## belediye-ihale-dosyasi

### Tepki 1

* responseId: ihale-dosyasi-sert-yolsuzluk
* label: Sert Yolsuzluk Çıkışı Yap
* tone: bold
* description: Belgeleri merkeze alarak temiz siyaset ve hesap verebilirlik üzerinden güçlü bir kampanya başlat.
* outcomeTitle: Temiz Siyaset Gündemi
* outcomeDescription: Yolsuzluk karşıtı mesajın görünürlük kazandı. Ancak iddiaların kesinleşmemiş olması nedeniyle bazı seçmenlerde aceleci davrandığın algısı oluştu.
* stanceValue: -1
* segmentEffects: youth:+3,workers:+3,merchants:+2
* metricEffects: campaignVisibility:+4,leaderTrust:+2,policyCredibility:-1
* energyCost: -6

### Tepki 2

* responseId: ihale-dosyasi-hukuki-surec
* label: Hukuki Süreç ve Şeffaflık İste
* tone: measured
* description: Suçlayıcı dili sınırlı tutarak bağımsız denetim ve kamuya açık ihale sistemi öner.
* outcomeTitle: Güvenilir Denetim Mesajı
* outcomeDescription: Ölçülü çıkışın güvenilirlik sağladı. Konu canlı kaldı ama medyada sert çıkış yapan rakipler kadar yer kaplamadın.
* stanceValue: 0
* segmentEffects: civilServants:+3,merchants:+2,workers:+1
* metricEffects: policyCredibility:+4,leaderTrust:+2
* energyCost: -4

### Tepki 3

* responseId: ihale-dosyasi-bekle-gor
* label: Belgeler Netleşene Kadar Bekle
* tone: passive
* description: Konunun takipçisi olduğunu söyle ama açık suçlama yapma.
* outcomeTitle: Gündem Rakiplere Kaldı
* outcomeDescription: Risk almadın fakat temiz siyaset alanında görünürlük kazanma fırsatını kaçırdın. Rakipler daha baskın mesaj verdi.
* stanceValue: 0
* segmentEffects: youth:-1,workers:-1,civilServants:+1
* metricEffects: campaignVisibility:-3
* energyCost: -1

---

## meydan-duzenlemesi-protestosu

### Tepki 1

* responseId: meydan-protestosu-genclerin-yaninda
* label: Protestocuların Yanında Dur
* tone: bold
* description: Kamusal alanın korunması ve gençlerin demokratik itiraz hakkı üzerinden güçlü bir açıklama yap.
* outcomeTitle: Gençlik Desteği Arttı
* outcomeDescription: Genç seçmenlerde ve çevre duyarlılığı yüksek gruplarda görünürlüğün arttı. Düzen hassasiyeti olan seçmenler ise mesajını fazla sert buldu.
* stanceValue: -2
* segmentEffects: youth:+6,civilServants:+1,retirees:-2,merchants:-1
* metricEffects: mediaPower:+3,campaignVisibility:+4
* energyCost: -6

### Tepki 2

* responseId: meydan-protestosu-diyalog
* label: Diyalog Masası Öner
* tone: measured
* description: Belediye, esnaf, gençler ve uzmanların yer aldığı açık bir müzakere süreci öner.
* outcomeTitle: Kent Uzlaşısı Mesajı
* outcomeDescription: Uzlaşmacı dilin geniş kesimlerde olumlu karşılandı. Protestonun en öfkeli kesimleri ise mesajını yetersiz buldu.
* stanceValue: 0
* segmentEffects: youth:+3,merchants:+2,retirees:+1
* metricEffects: policyCredibility:+3,leaderTrust:+2
* energyCost: -4

### Tepki 3

* responseId: meydan-protestosu-duzen-vurgusu
* label: Kamu Düzeni Vurgula
* tone: passive
* description: Protesto hakkına saygı duyduğunu ama şehir düzeninin bozulmaması gerektiğini söyle.
* outcomeTitle: Güvenlikçi Algı Oluştu
* outcomeDescription: Düzen isteyen seçmenlerde sınırlı destek aldın. Gençler ve özgürlükçü seçmenler ise seni mesafeli buldu.
* stanceValue: +1
* segmentEffects: youth:-5,retirees:+2,merchants:+1
* metricEffects: leaderTrust:+1,mediaPower:-2
* energyCost: -2

---

## multeci-mahallesi-gerilimi

### Tepki 1

* responseId: gocmen-gerilimi-sert-politika
* label: Sert Göç Politikası Açıkla
* tone: bold
* description: Kontrolsüz göç, kayıt dışı çalışma ve mahalle güvenliği üzerinden sert bir politika paketi açıkla.
* outcomeTitle: Güvenlikçi Dalgayı Yakaladın
* outcomeDescription: Güvenlik ve ekonomik rekabet kaygısı taşıyan seçmenlerde karşılık buldun. Ancak kapsayıcı dil bekleyen gruplarda itibar kaybettin.
* stanceValue: +2
* segmentEffects: workers:+3,merchants:+3,youth:-3
* metricEffects: campaignVisibility:+4,leaderTrust:-1
* energyCost: -6

### Tepki 2

* responseId: gocmen-gerilimi-kayitli-uyum
* label: Kayıtlı ve Planlı Uyum Politikası Öner
* tone: measured
* description: Güvenlik, kayıt dışı ekonomi ve sosyal uyum başlıklarını birlikte ele alan kontrollü bir çözüm öner.
* outcomeTitle: Zor Gündemde Dengeli Çıkış
* outcomeDescription: Hem güvenlik kaygısını hem ayrımcılık riskini gözeten mesajın güvenilir bulundu. Ancak sert çözüm bekleyen seçmenlerde etkisi sınırlı kaldı.
* stanceValue: 0
* segmentEffects: workers:+2,merchants:+2,youth:+1,civilServants:+2
* metricEffects: policyCredibility:+4
* energyCost: -5

### Tepki 3

* responseId: gocmen-gerilimi-sessiz-kal
* label: Gündemi Büyütme
* tone: passive
* description: Toplumsal gerilimi artırmamak için düşük profilli ve genel bir sağduyu açıklaması yap.
* outcomeTitle: Sessizlik Tepki Çekti
* outcomeDescription: Krizi büyütmedin ama seçmenler net çözüm duymak istedi. Rakiplerin sert mesajları gündemi domine etti.
* stanceValue: 0
* segmentEffects: workers:-2,merchants:-2,youth:+1
* metricEffects: campaignVisibility:-3,leaderTrust:-1
* energyCost: -1

---

## afet-yardim-organizasyonu

### Tepki 1

* responseId: afet-yardim-sahaya-in
* label: Tüm Örgütü Sahaya İndir
* tone: bold
* description: İl ve ilçe örgütlerini yardım koordinasyonu için hızla sahaya yönlendir.
* outcomeTitle: Sahada Güçlü Görünürlük
* outcomeDescription: Yardım çalışmaları yerelde olumlu karşılandı. Ancak organizasyon yükü kaynaklarını zorladı.
* stanceValue: 0
* segmentEffects: workers:+3,retirees:+3,farmers:+3
* metricEffects: localOrganization:+5,leaderTrust:+4,campaignVisibility:+3
* energyCost: -8

### Tepki 2

* responseId: afet-yardim-koordinasyon
* label: Sivil Toplumla Koordinasyon Kur
* tone: measured
* description: Yardım sürecini sivil toplum, yerel yönetim ve gönüllülerle koordineli yürüt.
* outcomeTitle: Güven Veren Koordinasyon
* outcomeDescription: Dengeli ve düzenli yardım yaklaşımın güven yarattı. Medya etkisi sınırlı ama kalıcı oldu.
* stanceValue: 0
* segmentEffects: workers:+2,retirees:+2,farmers:+2
* metricEffects: leaderTrust:+3,policyCredibility:+3,localOrganization:+3
* energyCost: -5

### Tepki 3

* responseId: afet-yardim-sembolik
* label: Sembolik Destek Açıkla
* tone: passive
* description: Geçmiş olsun mesajı ve sınırlı yardım duyurusu yap.
* outcomeTitle: Yetersiz Sahada Varlık
* outcomeDescription: Kriz anında daha görünür olman bekleniyordu. Yerel örgütlenme fırsatını büyük ölçüde kaçırdın.
* stanceValue: 0
* segmentEffects: workers:-1,retirees:-1,farmers:-1
* metricEffects: localOrganization:-2,campaignVisibility:-2
* energyCost: -1

---

## parti-ici-liste-krizi

### Tepki 1

* responseId: liste-krizi-lider-karari
* label: Lider Kararının Arkasında Dur
* tone: bold
* description: Aday listesinin stratejik tercihlerle oluşturulduğunu vurgula ve parti disiplinini öne çıkar.
* outcomeTitle: Disiplin Sağlandı, Kırgınlık Kaldı
* outcomeDescription: Merkez yönetim gücünü gösterdin fakat bazı yerel teşkilatlar kırgın kaldı. Kısa vadede kontrol sağlandı, uzun vadede saha enerjisi zayıflayabilir.
* stanceValue: +1
* segmentEffects: civilServants:+1,youth:-2,workers:-1
* metricEffects: leaderTrust:+2,localOrganization:-3
* energyCost: -4

### Tepki 2

* responseId: liste-krizi-istisare
* label: Teşkilatla İstişare Toplantısı Yap
* tone: measured
* description: İlçe temsilcileriyle toplantı yaparak liste kararlarını anlat ve bazı telafi rolleri öner.
* outcomeTitle: Kriz Yumuşatıldı
* outcomeDescription: Teşkilat tepkisi kısmen yatıştı. Süreç zaman aldı ama örgüt motivasyonunu korudun.
* stanceValue: 0
* segmentEffects: youth:+1,workers:+1,civilServants:+1
* metricEffects: localOrganization:+3,leaderTrust:+1
* energyCost: -5

### Tepki 3

* responseId: liste-krizi-gormezden-gel
* label: Krizi Görmezden Gel
* tone: passive
* description: Tartışmanın büyümeyeceğini varsayarak resmi açıklama yapma.
* outcomeTitle: Teşkilat Sessizce Soğudu
* outcomeDescription: Kriz medyada büyümedi ama saha ekiplerinde motivasyon kaybı başladı. Bazı yerel aktörler pasifleşti.
* stanceValue: 0
* segmentEffects: youth:-1,workers:-1
* metricEffects: localOrganization:-4,leaderTrust:-1
* energyCost: 0

---

## rakip-lider-gaffi

### Tepki 1

* responseId: rakip-gaffi-viral-saldiri
* label: Viral Kampanyaya Çevir
* tone: bold
* description: Rakip liderin gafını kısa videolar ve mizahi içeriklerle sosyal medyada büyüt.
* outcomeTitle: Sosyal Medyada Patlama
* outcomeDescription: Görünürlüğün arttı ve genç kitleler kampanyayı paylaştı. Ancak bazı seçmenler siyasetin fazla alaycı hale geldiğini düşündü.
* stanceValue: -1
* segmentEffects: youth:+4,retirees:-2
* metricEffects: mediaPower:+5,campaignVisibility:+5,leaderTrust:-1
* energyCost: -5

### Tepki 2

* responseId: rakip-gaffi-ciddiyet
* label: Devlet Ciddiyetiyle Eleştir
* tone: measured
* description: Gafı kişiselleştirmeden, ülke yönetiminde hazırlık ve ciddiyet ihtiyacına bağla.
* outcomeTitle: Ciddi Muhalefet Algısı
* outcomeDescription: Rakibin hatasından faydalandın ama seviyeyi düşürmedin. Medya etkisi orta düzeyde kaldı.
* stanceValue: 0
* segmentEffects: civilServants:+2,retirees:+2,youth:+1
* metricEffects: leaderTrust:+3,campaignVisibility:+2
* energyCost: -3

### Tepki 3

* responseId: rakip-gaffi-uzak-dur
* label: Gündeme Girmeme Kararı Al
* tone: passive
* description: Gafı büyütmeyip kendi kampanya mesajına odaklan.
* outcomeTitle: Fırsat Kullanılmadı
* outcomeDescription: Negatif kampanyadan uzak durman güvenilirliğini korudu ama rakibin zayıf anından faydalanamadın.
* stanceValue: 0
* segmentEffects: retirees:+1,youth:-1
* metricEffects: campaignVisibility:-2,leaderTrust:+1
* energyCost: -1

---

## secim-hukuku-sorusturmasi

### Tepki 1

* responseId: secim-hukuku-siyasi-baski
* label: Siyasi Baskı Olarak Tanımla
* tone: bold
* description: Soruşturmanın kampanyanı durdurmaya yönelik siyasi bir hamle olduğunu savun.
* outcomeTitle: Taban Konsolide Oldu
* outcomeDescription: Kendi seçmeninde güçlü sahiplenme oluştu. Fakat kararsız seçmenler hukuki detaylar netleşmeden bu kadar sert konuşmanı riskli buldu.
* stanceValue: -1
* segmentEffects: youth:+3,workers:+2,civilServants:-1
* metricEffects: campaignVisibility:+4,leaderTrust:-1
* energyCost: -6

### Tepki 2

* responseId: secim-hukuku-seffaf-savunma
* label: Belgelerle Şeffaf Savunma Yap
* tone: measured
* description: Harcama kayıtlarını ve hukuki savunmanı açık biçimde paylaşarak süreci sakin yönet.
* outcomeTitle: Güvenilir Savunma
* outcomeDescription: Krizi büyütmeden kontrol altına aldın. Şeffaflık mesajı özellikle kararsız seçmenlerde olumlu karşılık buldu.
* stanceValue: 0
* segmentEffects: civilServants:+3,retirees:+2,youth:+1
* metricEffects: policyCredibility:+4,leaderTrust:+3
* energyCost: -5

### Tepki 3

* responseId: secim-hukuku-sessiz-savunma
* label: Sadece Hukuk Ekibine Bırak
* tone: passive
* description: Kamuoyu önünde konuşmadan süreci hukukçular üzerinden yürüt.
* outcomeTitle: İletişim Boşluğu Oluştu
* outcomeDescription: Hukuki riskleri sınırladın ama kamuoyunda yeterince güçlü cevap vermediğin düşünüldü. Rakipler boşluğu kullandı.
* stanceValue: 0
* segmentEffects: youth:-2,workers:-1,civilServants:+1
* metricEffects: campaignVisibility:-3,leaderTrust:-1
* energyCost: -2

---

# 3. Hikâye Zincirleri

## chain-01

* sourceEventId: meydan-duzenlemesi-protestosu
* sourceResponseIds: meydan-protestosu-genclerin-yaninda
* followUpEventId: miting-cevresinde-gerilim
* delayWeeks: 1
* reason: Meydan protestosunda sert biçimde taraf olman genç kitleleri hareketlendirdi; sonraki miting çevresinde gerilim yükseldi.

## chain-02

* sourceEventId: meydan-duzenlemesi-protestosu
* sourceResponseIds: meydan-protestosu-diyalog
* followUpEventId: yerel-kanal-boykotu
* delayWeeks: 1
* reason: Diyalog çağrısı yerelde tartışmayı sürdürdü; medya temsil adaleti yeni gündem haline geldi.

## chain-03

* sourceEventId: pazar-fiyatlari-krizi
* sourceResponseIds: pazar-fiyatlari-refah-paketi
* followUpEventId: vergi-paketi-sizintisi
* delayWeeks: 2
* reason: Güçlü refah vaatlerin finansman tartışmasını büyüttü; yeni vergi paketi iddiaları gündeme düştü.

## chain-04

* sourceEventId: asgari-ucret-beklentisi
* sourceResponseIds: asgari-ucret-yuksek-zam
* followUpEventId: sanayi-elektrik-kesintisi
* delayWeeks: 1
* reason: Üretim maliyetleri tartışması sanayi çevrelerinin altyapı ve enerji şikâyetlerini görünür hale getirdi.

## chain-05

* sourceEventId: belediye-ihale-dosyasi
* sourceResponseIds: ihale-dosyasi-sert-yolsuzluk,ihale-dosyasi-hukuki-surec
* followUpEventId: rakip-belediye-skandali
* delayWeeks: 2
* reason: Yerel yönetimlerde şeffaflık çıkışın başka belediye dosyalarının da gündeme gelmesini sağladı.

## chain-06

* sourceEventId: sosyal-medya-duzenlemesi
* sourceResponseIds: sosyal-medya-ozgurluk-savunusu
* followUpEventId: gazeteci-davasi
* delayWeeks: 1
* reason: İfade özgürlüğü çıkışın medya ve yargı tartışmalarını kampanya gündemine taşıdı.

## chain-07

* sourceEventId: multeci-mahallesi-gerilimi
* sourceResponseIds: gocmen-gerilimi-sert-politika
* followUpEventId: miting-cevresinde-gerilim
* delayWeeks: 1
* reason: Sert göç politikası mesajın mahallelerde tansiyonu artırdı; saha etkinliklerinde güvenlik hassasiyeti yükseldi.

## chain-08

* sourceEventId: parti-ici-liste-krizi
* sourceResponseIds: liste-krizi-gormezden-gel
* followUpEventId: aday-adayi-bagis-tartismasi
* delayWeeks: 2
* reason: Liste krizini yönetmemen parti içi memnuniyetsizliği büyüttü; adaylık ve bağış süreçleri sorgulanmaya başladı.

## chain-09

* sourceEventId: afet-yardim-organizasyonu
* sourceResponseIds: afet-yardim-sahaya-in,afet-yardim-koordinasyon
* followUpEventId: deprem-toplanma-alani-tartismasi
* delayWeeks: 2
* reason: Afet sahasında görünür olman afet hazırlığı ve toplanma alanları konusunu doğal olarak yeni gündeme taşıdı.

## chain-10

* sourceEventId: rakip-lider-gaffi
* sourceResponseIds: rakip-gaffi-viral-saldiri
* followUpEventId: sosyal-medya-duzenlemesi
* delayWeeks: 1
* reason: Viral kampanya sosyal medyada siyasi dil ve dezenformasyon tartışmasını büyüttü.

---

# 4. Denge Notları

## Tür Dağılımı

* crisis: Ekonomi, güvenlik, parti içi kriz ve yerel yönetim sorunları için kullanılır.
* agenda: Tartışmalı ama doğrudan felaket olmayan politik gündemler için kullanılır.
* opportunity: Oyuncunun doğru hamleyle pozitif sonuç alabileceği fırsatlar için kullanılır.

## Önerilen Haftalık Kullanım

Her hafta:

* 1 ana gündem zorunlu.
* 6 alt gündemden en fazla 3 tanesine cevap verilebilir.
* Radar gündemler doğrudan cevaplanmaz ama ileride ana/alt gündeme dönüşebilir.

## Ana Gündem İçin Güçlü Adaylar

* pazar-fiyatlari-krizi
* asgari-ucret-beklentisi
* sosyal-medya-duzenlemesi
* belediye-ihale-dosyasi
* meydan-duzenlemesi-protestosu
* multeci-mahallesi-gerilimi
* afet-yardim-organizasyonu
* parti-ici-liste-krizi
* secim-hukuku-sorusturmasi
* sinir-otesi-gerilim

## Alt Gündem İçin Güçlü Adaylar

* kira-artisi-tartismasi
* emekli-maasi-tepkisi
* kampus-yasagi-tartismasi
* yerel-kanal-boykotu
* belediye-ulasim-zammi
* su-kesintisi-haftasi
* findik-ureticisi-tepkisi
* balikci-limani-sorunu
* kamu-calisani-atama-tepkisi
* dini-bayram-ziyaretleri

## Radar Gündem İçin Güçlü Adaylar

* vergi-paketi-sizintisi
* gazeteci-davasi
* imar-plani-gerilimi
* kentsel-donusum-itirazi
* kuraklik-alarmi
* organize-sanayi-acilisi
* aday-adayi-bagis-tartismasi
* anket-sirketi-indirimi
* rakip-lider-gaffi
* sandik-guvenligi-tartismasi
