import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import explained_variance_score, mean_absolute_error, mean_squared_error
from sklearn.metrics import median_absolute_error, r2_score
import joblib

def main():
    print("Veri seti yükleniyor ve işleniyor...")
    # 1. Veri setini oku
    df = pd.read_csv('dataset.csv')
    
    # 2. Data Preprocessing (Missing values) - Ön işleme
    # Makine öğrenmesi modelleri 'NaN' yani boş(eksik) veri gördüğünde hata verir. 
    # Bu yüzden dropna() kullanarak satırındaki verisi tam olmayan örnekleri veri setimizden çıkarıyoruz.
    df.dropna(inplace=True)
    
    # ML Önemi: `values` metodu pandas DataFrame yapısını doğrudan NumPy matrislerine(array) çevirir.
    # Scikit-Learn modelleri arka planda doğrusal cebirsel hesaplamalar kullanır, bu sebeple NumPy dizileri DataFrame'lere göre hem daha performanslıdır hem de uyumluluk hatalarını önler.
    X = df['Bas_cevresi(cm^3)'].values
    Y = df['Beyin_agirligi(gr)'].values
    
    # ML Önemi: Veri setimizde kaç satır (örneklem) olduğunu len() ile ölçüyoruz.
    uzunluk = len(X)
    
    # ML Önemi: reshape() kullanımı bağımsız değişken (X) için Scikit-Learn'de ZORUNLUDUR.
    # Model bizden X değişkenini her zaman 2 boyutlu bir matris (satırlar=örnekler, sütunlar=özellikler) olarak bekler.
    # Bizde tek bir özellik boyutu olduğu için dizi halindeki vektörü (uzunluk, 1) şekline getirerek bir "sütun vektör" (2D matris) yapıyoruz.
    X = X.reshape((uzunluk, 1))
    
    # 3. Train Test Split
    # ML Önemi: Veriyi train(eğitim) ve test olarak 2'ye ayırıyoruz. test_size=0.3 demek veri setinin %70'i ile modeli eğiteceğiz, %30'u ile tahmin gücünü test edeceğiz demektir.
    # ML Önemi: random_state=0 ise ayrımın her kod çalıştığında aynı standart rastgelelikte olmasını sağlar. Bu değer (seed) verilmezse her seferinde sonuçlar farklı çıkar, "tekrarlanabilirlik" (reproducibility) kuralı bozulur.
    X_train, X_test, Y_train, Y_test = train_test_split(X, Y, test_size=0.3, random_state=0)
    
    # 4. Model Initialize & Train
    # ML Önemi: Doğrusal Regresyon (Linear Regression) nesnesini yaratıyoruz ve fit() metodu ile eğitim(train) verisinde kalıpları öğrenmesini sağlıyoruz.
    model_Regresyon = LinearRegression()
    model_Regresyon.fit(X_train, Y_train)
    print("Model eğitimi tamamlandı.\n")
    
    # 5. Predict (Tahmin)
    # ML Önemi: predict() metodu ile deney setindeki (X_test) özellikler kullanılarak modelden y_pred tahminleri (çıkışlar) elde edilir.
    y_pred = model_Regresyon.predict(X_test)
    
    # İstenen çıktı: Predict sonuçlarının ekrana bastırılması
    print("--- Bazı Değerlerin Predict (Tahmin) Sonuçları ---")
    print("İlk 10 Tahmin Dizisi (y_pred):")
    print(y_pred[:10])
    
    print("\nDetaylı Karşılaştırma (İlk 5 Kayıt):")
    # ML Önemi: Test verilerinde modelin ürettiği tahminle (y_pred), olması gereken gerçek değeri (Y_test) yan yana koyarak modelin öğrenme kalitesini somut olarak görürüz.
    for i in range(5):
        actual = Y_test[i]
        predicted = y_pred[i]
        head_circ = X_test[i][0]
        print(f"Baş Çevresi: {head_circ:.2f}, Gerçek Beyin Ağırlığı: {actual:.2f}, Tahmin: {predicted:.2f}")
    
    # 6. Scatter Plot ve Regression Line (Görselleştirme)
    # ML Önemi: Modelimizin veriyi nasıl "öğrendiğini" gözle görmek için eğitim verisini noktasal (scatter) grafiğe döküyoruz.
    # Üzerine çizdiğimiz çizgi (plot) regresyon doğrusudur (Line of best fit) ve eğitilmiş modelimizin eğilimini temsil eder.
    plt.scatter(X_train, Y_train, color ='red')
    plt.plot(X_train, model_Regresyon.predict(X_train),color='blue')
    plt.title('Başın çevre uzunluğu ve beyin ağırlığı (eğitim veri seti)')
    plt.xlabel('Başın çevre uzunluğu (cv^3)')
    plt.ylabel('Beyin ağırlığı (gram)')
    plt.show()

    # ML Önemi: Modelin daha önce HİÇ GÖRMEDİĞİ test verisi üzerindeki başarısını çizdiriyoruz.
    # Kırmızı noktalar modeli test ettiğimiz gerçek yeni verilerdir. Çizgimiz ise daha önce eğittiğimiz modele aittir.
    # Eğer noktalar mavi çizgi etrafında toplanıyorsa, modelimiz yeni verileri de doğru tahmin ediyor demektir.
    plt.scatter(X_test, Y_test, color ='red')
    plt.plot(X_train, model_Regresyon.predict(X_train),color='blue')
    plt.title('Başın çevre uzunluğu ve beyin ağırlığı (test veri seti)')
    plt.xlabel('Başın çevre uzunluğu (cv^3)')
    plt.ylabel('Beyin ağırlığı (gram)')
    plt.show()
    
    # 7. Model Performans Değerlendirmesi
    print("\n--- Model Performans Metrikleri ---")
    # ML Önemi: Hata analizi, modelin tahminlerinin gerçekten ne kadar saptığını (error) ölçer.
    # R_Kare: 1.0 oranına ne kadar yakınsa, model verideki hedef değişkeni o kadar yüksek oranda analiz ediyor demektir.
    # MAE (Ortalama Mutlak Sapma): Tahmin edilen değerden artı-eksi yönde 'gr' bazında ortalama ne kadar yanıldığımızı gösterir.
    # MSE (Ortalama Kare Hata): Hataların karesi üzerinden ceza verdiği için, fahiş yanılgıların (outlier) çok olup olmadığını söyler.
    print('R_Kare:', r2_score(Y_test, y_pred))
    print('MAE:', mean_absolute_error(Y_test, y_pred))
    print('MSE:', mean_squared_error(Y_test, y_pred))
    
    print()
    # ML Önemi: Doğrusal regresyonun temel amacı veriyi temsil eden en optimum "y = Q1*X + Q0" doğrusunun parametrelerini bulmaktır.
    # Q1 (Eğim - Coef): Algoritmanın öğrendiği en önemli ağırlıktır (weight). Baş çevresindeki her 1 birimlik artışın beyin ağırlığını ne kadar etkilediğini gösterir.
    # Q0 (Kesen - Intercept): Sabit değerdir (bias). Doğrunun Y eksenini kestiği yani matematiksel olarak baş çevresi 0 olsaydı grafiğin başlayacağı noktadır.
    # regresyon denklemi katsayıları
    print('Eğim(Q1):', model_Regresyon.coef_)
    print('Kesen(Q0):', model_Regresyon.intercept_)
    # regresyon denklemi
    print("y=%0.2fX + %0.2f" % (model_Regresyon.coef_[0], model_Regresyon.intercept_))
    
    # 8. Modeli Kaydet
    joblib.dump(model_Regresyon, 'model.pkl')
    print("\nModel başarıyla 'model.pkl' olarak kaydedildi.")

if __name__ == "__main__":
    main()
