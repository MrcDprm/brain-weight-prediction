# 🧠 Baby Brain Weight Predictor - ML Linear Regression
**Bilgisayar Mühendisliği 4. Sınıf Makine Öğrenmesi Dersi Projesi**

Bu proje, bebeklerin **baş çevresi ölçümü (cm³)** ile **beyin ağırlığı (gram)** arasındaki ilişkiyi anlamlandırmak ve tahmin etmek amacıyla Doğrusal Regresyon (Linear Regression) algoritması kullanılarak geliştirilmiş uçtan uca bir Makine Öğrenmesi (Machine Learning) uygulamasıdır. 

Proje kapsamında model eğitimi, veri bilimi analizleri ve modelin son kullanıcıya hizmet verebilmesi için modern bir **Steamlit Web Arayüzü (Dashboard)** entegre edilmiştir. Tahmin işlemleri arka planda SQLite kullanılarak kaydedilmekte ve veri görselleştirme adımları interaktif olarak kullanıcılara sunulmaktadır.

---

## 🚀 Proje İçeriği ve Özellikler

*   **Makine Öğrenmesi Modeli `(model.py)`**: 
    *   Pandas ile `.csv` formatındaki veri setinin okunması, eksik verilerin temizlenmesi (Data Preprocessing).
    *   Bağımlı (y) ve bağımsız (X) değişkenlerin NumPy dizilerine çevrilip şekillendirilmesi (reshape).
    *   Verinin %70 Eğitim (Train), %30 Test olarak bölünmesi (`train_test_split`).
    *   Scikit-Learn kütüphanesiyle Doğrusal Regresyon (Linear Regression) uygulanması.
    *   Model sapma ve performans metriklerinin (R_Kare, MAE, MSE) hesaplanması ve formülize edilmesi.
*   **Web Arayüzü `(app.py)`**: 
    *   Streamlit altyapısı kullanılarak "Glassmorphism" ve "Dark Mode" destekli özel bir CSS mimarisi kurulması.
    *   Kullanıcıların sol menüden girdikleri "Baş Çevresi" değerine interaktif şekilde canlı tahmin üretilmesi.
    *   Klinik ve hastane kullanımı için SQLite veritabanı log formlarının entegrasyonu.
    *   **Plotly** ile gerçek zamanlı dinamik scatter plot ve regresyon çizgisinin görselleştirilmesi.
*   **Veritabanı Entegrasyonu `(db.py)`**: Eklenen bebek verilerinin SQLite formatında yerel olarak kaydedilmesi ve sunulması.

---

## 🛠️ Kullanılan Teknolojiler

*   **Backend & Data Science:** Python, Scikit-learn, Pandas, NumPy, SQLite
*   **Data Visualization:** Matplotlib, Plotly 
*   **Frontend (UI):** Streamlit (Web Dashboard), Custom CSS

---

## 📦 Kurulum ve Çalıştırma

Projeyi kendi bilgisayarınızda (localhost) çalıştırmak için Python 3.x yüklü olması gerekmektedir. 

**1. Repoyu Klonlayın ve Klasöre Girin**
```bash
git clone https://github.com/MrcDprm/baby-brain-weight-prediction.git
```

**2. Gerekli Kütüphaneleri (Bağımlılıkları) Yükleyin**
```bash
pip install -r requirements.txt
```

**3. Modeli Eğitin (Veri setinden öğrenme süreci)**
```bash
python model.py
```
*(Bu adım konsola regresyon katsayılarını ve MAE, MSE, R2 metriklerini basar ve 'model.pkl' adlı eğtilmiş bir yapay zeka dosyası üretir)*

**4. Web Uygulamasını Başlatın**
```bash
python -m streamlit run app.py
```
*(Komut girildikten sonra tarayıcınızda localhost arayüzü açılacaktır)*

---

## 📊 Model Metrikleri ve Başarısı
Model eğitimi sonucu elde edilen temel hata değerlendirme metrikleri:
*   **R² Skoru:** ~0.658 (Verinin %65 oranında modele uyduğu yani değişkenliğin açıklanabildiği görülmüştür)
*   **MAE (Ortalama Mutlak Hata):** ~59.16 gram
*   **Regresyon Formülü:** `y = 0.26X + 354.84`

---
*Geliştirici: Bilgisayar Mühendisliği 4. Sınıf Uygulaması*
