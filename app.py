import streamlit as st
import pandas as pd
import numpy as np
import joblib
import plotly.express as px
import plotly.graph_objects as go
import db
import os

# --- PAGE CONFIGURATION ---
st.set_page_config(page_title="AI Brain Weight Predictor", page_icon="🧠", layout="wide", initial_sidebar_state="expanded")

# --- CUSTOM CSS (PREMIUM AESTHETICS) ---
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap');
    
    html, body, [class*="css"] {
        font-family: 'Outfit', sans-serif;
    }
    
    /* Metrics Styling */
    div[data-testid="metric-container"] {
        background: linear-gradient(135deg, #1e1e2f 0%, #171723 100%);
        border: 1px solid #3f3f5a;
        border-radius: 12px;
        padding: 5%;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.4);
        color: white;
    }
    
    /* Headers */
    h1 {
        color: #e2e8f0;
        font-weight: 800;
        letter-spacing: -1px;
    }
    h2, h3 {
        color: #3b82f6; /* Blue 500 */
        font-weight: 600;
    }

    /* Primary Button */
    .stButton>button {
        background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%);
        color: white;
        border-radius: 8px;
        border: none;
        padding: 10px 24px;
        font-weight: 600;
        letter-spacing: 0.5px;
        transition: all 0.3s;
        box-shadow: 0 4px 14px 0 rgba(59, 130, 246, 0.39);
    }
    
    .stButton>button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);
    }
    
    /* Form Background */
    div[data-testid="stForm"] {
        background-color: #1a1a2e;
        border: 1px solid #2d2d44;
        border-radius: 12px;
        padding: 20px;
    }
</style>
""", unsafe_allow_html=True)

# --- LOAD MODEL & DATA ---
@st.cache_resource
def load_ml_components():
    try:
        model = joblib.load('model.pkl')
    except Exception:
        model = None
        
    try:
        df = pd.read_csv('dataset.csv')
        df.dropna(inplace=True)
    except Exception:
        df = pd.DataFrame()
        
    return model, df

model_Regresyon, df_historical = load_ml_components()

# --- SIDEBAR INTERACTION ---
st.sidebar.markdown(f"<h1 style='text-align: center; color: #3b82f6;'>🧠 Analiz Modülü</h1>", unsafe_allow_html=True)
st.sidebar.markdown("Cihaz üzerinden alınan **Baş Çevresi** bilgisini buradan anlık olarak modele iletebilirsiniz.")

st.sidebar.divider()
head_circ_slider = st.sidebar.slider("👶 Baş Çevresi Değeri (cm³)", min_value=2500, max_value=5000, value=3500, step=10)

if model_Regresyon is not None:
    # Model shape (1,1) format
    x_input = np.array([[head_circ_slider]])
    predicted_weight = model_Regresyon.predict(x_input)[0]
    st.sidebar.markdown("### ✨ Tahmin Edilen Ağırlık:")
    st.sidebar.markdown(
        f"<div style='background-color:#10b981; padding: 15px; border-radius: 10px; text-align: center;'>"
        f"<h2 style='color:white; margin:0;'>{predicted_weight:.2f} gr</h2></div>", 
        unsafe_allow_html=True
    )
else:
    st.sidebar.error("Model yüklenemedi. Lütfen 'model.py' çalıştırın.")
    predicted_weight = 0.0

# --- MAIN DASHBOARD ---
st.title("🚀 Yapay Zeka Destekli Bebek Beyin Ağırlığı Tahmini")
st.markdown("Makine Öğrenmesi (Machine Learning) yöntemlerinden **Doğrusal Regresyon (Linear Regression)** kullanılarak geliştirilen uçtan uca modern analiz portalı.")

# Metrics Row
col1, col2, col3 = st.columns(3)
col1.metric(label="Model Algoritması", value="Linear Regression", delta="scikit-learn", delta_color="normal")
if not df_historical.empty:
    col2.metric(label="Geçmiş Veri Havuzu", value=f"{len(df_historical)} Hastane Kaydı", delta="Kapsamlı Veri")
col3.metric(label="Anlık Modelleme Çıktısı", value=f"{predicted_weight:.1f} gr", delta=f"{head_circ_slider} cm³ için hesaplandı", delta_color="normal")

st.divider()

# --- VISUALIZATIONS ---
st.subheader("📈 Gerçek Zamanlı Regresyon Görselleştirmesi")
st.markdown("Aşağıdaki interaktif grafikte **mavi çizgi (Regression Line)** modelin tespit ettiği ana algoritmayı, **gri noktalar** geçmiş kayıtları temsil eder. **Kırmızı Parlayan Yıldız** ise yan menüden seçtiğiniz değerin matematiksel modelin neresine oturduğunu canlı olarak gösterir.")

if not df_historical.empty and model_Regresyon is not None:
    # Build Plotly Express scatter
    X_col = 'Bas_cevresi(cm^3)'
    y_col = 'Beyin_agirligi(gr)'
    
    if X_col in df_historical.columns and y_col in df_historical.columns:
        fig = px.scatter(
            df_historical, 
            x=X_col, 
            y=y_col,
            opacity=0.3, # Daha bulanık yaparak çizgiyi ve yıldızı öne çıkarıyoruz
            color_discrete_sequence=['#9ca3af'],
        )
        
        # Orijinal X değerlerine göre çizgi çizme
        x_min, x_max = df_historical[X_col].min(), df_historical[X_col].max()
        x_range = np.linspace(x_min, x_max, 100).reshape(-1, 1)
        y_range = model_Regresyon.predict(x_range)
        
        # Regresyon Doğrusu
        fig.add_trace(go.Scatter(
            x=x_range.flatten(), 
            y=y_range, 
            mode='lines', 
            name='Model Regresyon Eğilimi (Line of Best Fit)', 
            line=dict(color='#3b82f6', width=3, dash='solid')
        ))
        
        # Kullanıcının Anlık Tahmin Noktası (Kırmızı Yıldız)
        fig.add_trace(go.Scatter(
            x=[head_circ_slider], 
            y=[predicted_weight], 
            mode='markers+text', 
            name='Sizin Tahmininiz (Aktif)',
            text=[f"{predicted_weight:.1f} gr"],
            textposition="top center",
            textfont=dict(color="#ef4444", size=14, family="Outfit"),
            marker=dict(color='#ef4444', size=18, symbol='star', line=dict(color='white', width=2))
        ))
        
        fig.update_layout(
            template="plotly_dark",
            margin=dict(l=20, r=20, t=30, b=20),
            xaxis_title="Baş Çevresi Ölçümü (cm³)",
            yaxis_title="Beyin Ağırlığı (gram)",
            plot_bgcolor='rgba(15, 23, 42, 0.4)',
            paper_bgcolor='rgba(15, 23, 42, 0.0)',
            hovermode="x unified",
            legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1)
        )
        
        st.plotly_chart(fig, use_container_width=True)

# --- DATA ENTRY PORTAL ---
st.divider()
st.subheader("🖥️ Sisteme Yeni Analiz Kaydı Ekle")
with st.form("baby_form", clear_on_submit=True):
    c1, c2 = st.columns(2)
    with c1:
        baby_name = st.text_input("Bebeğin Adı-Soyadı 👤", placeholder="Örn: Ayşe Yılmaz")
        age_months = st.number_input("Kaç Aylık? 🍼", min_value=0, max_value=60, value=1)
    with c2:
        nurse_name = st.text_input("Hemşire / Doktor Adı 👨‍⚕️", placeholder="Örn: Dr. Ali Veli")
        st.info(f"💡 Kaydı tamamladığınızda sol menüdeki güncel değer olan **{predicted_weight:.2f} gram** veritabanına aktarılacaktır.")
    
    submitted = st.form_submit_button("🔍 Bulguları Veritabanına Yaz")
    
    if submitted:
        if baby_name.strip() and nurse_name.strip():
            db.insert_record(baby_name, age_months, nurse_name, head_circ_slider, predicted_weight)
            st.balloons()
            st.success(f"✅ Başarılı! {baby_name} adlı hastanın kayıtları sisteme işlendi.")
        else:
            st.error("⚠️ Lütfen bebeğin ve doktorun adını/soyadını ilgili alanlara doldurunuz.")

# --- DATABASE RECORD VIEWER ---
st.divider()
st.subheader("🗄️ Merkezi Veri Ambarı (SQLite Logları)")

records = db.fetch_all_records()

if records:
    df_records = pd.DataFrame(records, columns=["Kayıt ID", "Bebek Adı", "Aylığı", "Hemşire/Doktor", "Ölçülen Baş Çevresi", "YZ Beyin Ağırlığı"])
    # Premium dataframe display with gradient styling
    styled_df = df_records.style.background_gradient(cmap='Blues', subset=['YZ Beyin Ağırlığı']).format({'YZ Beyin Ağırlığı': '{:.2f} gr', 'Ölçülen Baş Çevresi': '{:.0f} cm³', 'Kayıt ID': '#{}'})
    st.dataframe(styled_df, use_container_width=True, hide_index=True)
else:
    st.info("Tabloda listelenecek hiçbir klinik hastane kaydı bulunamadı. Lütfen yukarıdan form doldurun.")
