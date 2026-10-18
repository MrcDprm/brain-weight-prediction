# Beyin Ağırlığı Tahmini

[English](README.md) | **Türkçe**

Bir beyin ağırlığı hesaplayıcısı: baş hacmini cm³ olarak yaz, tahmini yetişkin beyin ağırlığını %95 tahmin aralığıyla gör. Python ile yazılan makine öğrenmesi hattı beş regresyon modelini tekrarlı çapraz doğrulamayla karşılaştırır, en iyisi kadar iyi olan en basit modeli seçer ve JSON'a aktarır; küçük bir web sitesi modeli tarayıcıda çalıştırır.

**Canlı demo:** [brain.miracdeprem.com](https://brain.miracdeprem.com)

![Hesaplayıcı: 3600 cm³ baş hacmi, aralığıyla tahmini beyin ağırlığı ve milimetrik kâğıt üzerinde veri](docs/screenshot-calculator.png)

> **Tıbbi bir araç değildir.** Model yetişkinlere ait tarihî bir veri setiyle eğitilmiştir; yalnızca öğrenme ve gösterim amaçlıdır.

## Özellikler

**Web sitesi**
- %95 tahmin aralığıyla tahmini beyin ağırlığı ("bu baş hacmindeki 20 kişiden yaklaşık 19'u bu aralıkta")
- Milimetrik kâğıt üzerinde grafik: verideki 237 kişi, regresyon doğrusu, aralık bandı ve senin değerin; aralık eksende bir ayraç olarak çizilir
- Baş hacmi verideki aralığın (2.720–4.747 cm³) dışındaysa uyarı, hatalı girdide açık mesajlar ("3.600" ve "3,600" binlik olarak okunur)
- Model sayfası: karşılaştırma tablosu, modelin neden seçildiği, artık grafiği ve model kartı (kullanım amacı, veri, yöntem, sınırlar)
- Kendi adreslerinde Türkçe ve İngilizce (`/` ve `/en`), açık ve koyu tema, telefonda ve klavyeyle çalışır
- Sunucu yok: tahmin `model.json` ile tarayıcıda yapılır, hiçbir şey gönderilmez ya da saklanmaz

**Eğitim hattı**
- Eğitimden önce veri setini doğrular (sütunlar, kodlar, fiziksel olarak mümkün aralıklar) ve hatalı satır numaralarını bildirir
- Beş modeli ve sadece ortalamayı söyleyen bir referans modeli aynı 50 çapraz doğrulama bölmesinde karşılaştırır
- Bir standart hata kuralıyla seçer: hatası en iyiye bir standart hata kadar yakın olan en basit model
- Katsayıları ve tahmin aralığı için gereken her şeyi dışa aktarır; tarayıcının istatistik kütüphanesine ihtiyacı kalmaz
- Ortak test verileri Python ve JavaScript'in aynı tahmini verdiğini kanıtlar

## Ekran Görüntüleri

| | |
|---|---|
| ![Model karşılaştırma tablosu ve seçim gerekçesi](docs/screenshot-model.png) | ![Veri aralığı dışında bir baş hacmi, uyarı ve genişleyen eksen](docs/screenshot-out-of-range.png) |

![Koyu tema, Türkçe](docs/screenshot-dark.png)

<p align="center"><img src="docs/screenshot-mobile.png" width="300" alt="Telefonda hesaplayıcı"></p>

## Nasıl Çalışır

```
data/gladstone-1905.csv ──► doğrula ──► 5 modeli karşılaştır ──► seç ──► dışa aktar ──► web/model.json
                                        (10 katlı CV × 5)       (1-SE kuralı)          web/metrics.json
                                                                                       web/data.json
                                                                                            │
tarayıcı: baş hacmi ──► girdiyi doğrula ──► ortalama ± t·σ·√(1 + xᵀ(XᵀX)⁻¹x) ──► sonuç + grafik
```

1. **Doğrula.** [`brainweight/data.py`](brainweight/data.py) sütunları, kategori kodlarını ve değer aralıklarını kontrol eder, ham sütun adlarını düzeltir.
2. **Karşılaştır.** [`brainweight/models.py`](brainweight/models.py) her adayı aynı `RepeatedKFold` bölmelerinde (10 parça, 5 tekrar) çalıştırır. Ön işleme scikit-learn pipeline'larının içinde olduğu için sadece eğitim parçalarından öğrenilir.
3. **Seç.** Daha basit bir model en iyiye bir standart hata kadar yakınsa o kazanır.
4. **Dışa aktar.** [`brainweight/export.py`](brainweight/export.py) seçilen modeli en küçük karelerle kurar; katsayıları, σ'yı, t değerini, (XᵀX)⁻¹'i ve eğitim aralığını yazar.
5. **Tahmin et.** [`web/src/predict.js`](web/src/predict.js) aynı formülü hesaplar. Aralık, modelin daha az örnek gördüğü veri kenarlarına doğru genişler.

## Sonuçlar

Tekrarlı 10 katlı çapraz doğrulama (50 bölme), ortalama ± standart sapma:

| Model | Ortalama mutlak hata (g) | R² |
|---|---|---|
| **Doğrusal (baş hacmi)**, seçilen | 56,7 ± 8,7 | 0,602 ± 0,128 |
| Doğrusal (baş hacmi, cinsiyet, yaş grubu) | 56,2 ± 8,3 | 0,611 ± 0,122 |
| Polinom, 2. derece (baş hacmi) | 57,0 ± 9,0 | 0,603 ± 0,127 |
| Ridge (baş hacmi, cinsiyet, yaş grubu) | 56,2 ± 8,3 | 0,612 ± 0,120 |
| Random Forest (baş hacmi, cinsiyet, yaş grubu) | 59,5 ± 10,1 | 0,551 ± 0,149 |
| Referans (hep ortalama) | 94,5 ± 14,8 | −0,048 ± 0,055 |

Ridge 0,55 g farkla en iyiydi; bu fark bir standart hatanın içinde olduğu için tek değişkenli doğru seçildi: beyin ağırlığı ≈ 325,6 + 0,2634 × baş hacmi, σ ≈ 72 g.

## Veri Seti

237 yetişkin: baş hacmi (cm³), beyin ağırlığı (g), cinsiyet ve yaş grubu (20–46, 46+). Kaynak: R. J. Gladstone, "A Study of the Relations of the Brain to the Size of the Head", *Biometrika* IV, 1905. Model sadece yetişkinler için geçerlidir.

## Kullanılan Teknolojiler

- Eğitim ve değerlendirme için **Python**, **pandas**, **NumPy**, **scikit-learn**, **SciPy**
- Framework'süz ve derleme adımı olmadan **HTML**, **CSS** ve **JavaScript**; grafik elle yazılmış SVG
- **pytest** ve Node'un yerleşik test aracı (`node --test`)
- Barındırma için **Vercel**, sıkı bir İçerik Güvenliği Politikası (CSP) ile

## Kurulum ve Çalıştırma

[brain.miracdeprem.com](https://brain.miracdeprem.com) adresini aç ya da Python ve Node.js ile yerelde çalıştır:

```bash
git clone https://github.com/MrcDprm/brain-weight-prediction.git
cd brain-weight-prediction
python -m venv .venv
.venv/Scripts/activate          # Windows; macOS/Linux: source .venv/bin/activate
pip install -r requirements-dev.txt
```

Eğit, karşılaştır ve dışa aktar (`web/model.json`, `web/metrics.json` ve `web/data.json` yazılır), sonra ortak test verilerini yenile:

```bash
python -m brainweight.train
python -m brainweight.fixtures
```

Testleri ve web sitesini çalıştır:

```bash
python -m pytest
npm test
npx serve web                      # sonra yazdığı adresi aç
```

HTML sayfaları, `sitemap.xml` ve `robots.txt` iki dilde `web/pages/` ve `web/src/messages.js` dosyalarından üretilir. Bir metni değiştirince `npm run build:pages` çalıştır; sayfalar güncel değilse bir test başarısız olur.

## Proje Yapısı

```
brainweight/   veri doğrulama, model karşılaştırma, dışa aktarma, eğitim komutu
tests/         pytest testleri
data/          orijinal veri seti
scripts/       build-pages.mjs: Türkçe ve İngilizce sayfaları üretir
web/           web sitesi (Vercel bu klasörü yayınlar)
  pages/       sayfa şablonları
  src/         predict.js, chart.js, app.js, model-page.js, messages.js, theme.js
  tests/       JavaScript testleri ve ortak test verileri
```

## Öğrendiklerim

- Tek bir eğitim/test bölmesi modeli olduğundan iyi gösterebilir. Projenin eski sürümü tek bir şanslı bölmeden R² 0,66 bildiriyordu; tekrarlı çapraz doğrulamayla sonuç 0,60.
- İlk çapraz doğrulamam 0,46 verdi, çünkü CSV cinsiyet ve yaşa göre sıralıydı ve ben karıştırmadan bölmüştüm. Bazı test parçaları tek bir gruptan oluşuyordu. Bölmeden önce veriyi karıştırmak isteğe bağlı değil.
- Eski proje buna "bebek beyin ağırlığı" diyordu, ama verideki ortalama beyin 1.283 g, yani bir yetişkin beyni. Herhangi bir modelden önce veriyi konu hakkında bildiklerimle karşılaştırmam gerekiyor.
- Daha karmaşık modeller işe yaramadı. Baş hacmi bilindikten sonra cinsiyet ve yaş neredeyse bilgi eklemiyor, Random Forest ise 237 satırda ezberliyor. Bir standart hata kuralı en basit modeli seçmek için bana ilkeli bir gerekçe verdi.
- Hata payı olmayan bir tahmin yanıltıcıdır. Güven aralığı (doğru için) ile tahmin aralığı (tek bir kişi için) arasındaki farkı ve aralığın veri kenarlarında neden genişlediğini öğrendim.
- Modeli pickle dosyası yerine düz sayılar olarak dışa aktarmak onu okunur, güvenle yüklenebilir ve JavaScript'ten kullanılabilir hâle getirdi. Ortak test verileri iki dili uyumlu tutuyor.
- SVG grafiği elle çizmek bana ölçekleri, okunur eksen adımlarını ve yazıları telefonda okunur tutmayı öğretti.

## Gelecek Planları

- Mezura modu (baş uzunluğu, genişliği ve yüksekliği → baş hacmi); veri setindeki baş hacmi değerlerinin hangi ölçüm yöntemiyle hesaplandığı orijinal makaleden doğrulandıktan sonra.
- Yüklenen CSV dosyasından toplu tahmin.
- Ek veri setleri.
- Belirsizlik tahmini için Bayesçi regresyon.

## Lisans

[MIT](LICENSE)
