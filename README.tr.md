[English](README.md) | Türkçe

# Beyin Ağırlığı Tahmini

Baş hacminden yetişkin beyin ağırlığını, dürüst bir hata payıyla tahmin eder. Python ile yazılan eğitim hattı birkaç regresyon modelini çapraz doğrulamayla karşılaştırır; hafif bir web sitesi seçilen modeli tarayıcıda çalıştırır.

> **Durum:** v1.0 geliştiriliyor. Bu README proje planıdır, yayından önce tamamlanacak.
>
> **Tıbbi bir araç değildir.** Model yetişkinlere ait tarihî bir veri setiyle eğitilmiştir; yalnızca öğrenme ve gösterim amaçlıdır.

## Özellikler

### Eğitim hattı (Python)
- Veri doğrulama: eğitimden önce sütunlar, değer aralıkları ve kategoriler kontrol edilir.
- Tekrarlı 10 katlı çapraz doğrulamayla model karşılaştırması: doğrusal (yalnızca baş hacmi), doğrusal (baş hacmi + cinsiyet + yaş grubu), polinom, Ridge, Random Forest.
- Metrikler ortalama ± standart sapma olarak raporlanır: MAE, RMSE, R².
- Skorlar pratikte eşitse en basit model seçilir; gerekçesi belgelenir.
- `model.json` (katsayılar, %95 tahmin aralığı için gereken veriler, eğitim aralığı) ve `metrics.json` olarak dışa aktarma.
- pytest ile birim testleri.

### Web sitesi
- Hesaplayıcı: baş hacmi (cm³) → %95 tahmin aralığıyla tahmini beyin ağırlığı.
- Girdi doğrulama; eğitim aralığının dışında "güvenilmez tahmin" uyarısı.
- Grafik: veri noktaları, regresyon doğrusu, tahmin bandı ve girdiğiniz değer.
- Model sayfası: karşılaştırma tablosu, artık (residual) grafiği ve model kartı (veri kaynağı, sınırlar, kullanım amacı).
- Türkçe / İngilizce, koyu / açık tema.
- Tahminler `model.json` ile tarayıcıda yapılır; ortak test verileri Python ve JavaScript'in aynı sonucu verdiğini doğrular.

## Veri Seti

237 yetişkin; baş hacmi (cm³) ve beyin ağırlığı (g), cinsiyet ve yaş grubuna (20–46, 46+) göre. Kaynak: R. J. Gladstone, "A Study of the Relations of the Brain to the Size of the Head", *Biometrika*, 1905.

## Ekran Görüntüleri

_Yakında._

## Kullanılan Teknolojiler

- Python, pandas, NumPy, scikit-learn, pytest
- HTML, CSS, JavaScript (framework ve derleme adımı yok), `node --test`
- Vercel

## Kurulum ve Çalıştırma

_Yakında._

## Öğrendiklerim

_Yakında._

## Gelecek Planları

- Mezura modu (baş uzunluğu, genişliği ve yüksekliği → baş hacmi); veri setindeki baş hacmi değerlerinin hangi ölçüm yöntemiyle hesaplandığı orijinal makaleden doğrulandıktan sonra.
- Yüklenen CSV dosyasından toplu tahmin.
- Ek veri setleri.
- Belirsizlik tahmini için Bayesçi regresyon.
