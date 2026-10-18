// Arayüz metinleri (TR/EN). HTML'deki data-i18n anahtarları buradan doldurulur.
import { readSettings, saveSettings } from "./settings.js";

const MESSAGES = {
  tr: {
    docTitle: "Beyin ağırlığı tahmini: baş hacminden hesaplama",
    docDescription:
      "Baş hacmini yaz, tahmini beyin ağırlığını %95 tahmin aralığıyla gör. 237 yetişkinin ölçümüyle eğitilmiş, çapraz doğrulamayla seçilmiş bir model.",
    siteName: "Beyin ağırlığı tahmini",
    navCalculator: "Hesaplayıcı",
    navModel: "Model",
    switchLang: "English",
    switchLangLabel: "Switch to English",
    themeToDark: "Koyu temaya geç",
    themeToLight: "Açık temaya geç",
    heading: "Baş hacminden beyin ağırlığı tahmini",
    intro:
      "Baş hacmini yaz. 1905'te ölçülmüş 237 yetişkinin verisiyle eğitilen model, tahmini beyin ağırlığını ve hata payını gösterir.",
    inputLabel: "Baş hacmi",
    inputHint: "cm³ olarak, örneğin 3600",
    resultLabel: "Tahmini beyin ağırlığı",
    interval: "%95 tahmin aralığı: {low}–{high} g",
    intervalNote: "Bu baş hacmindeki 20 kişiden yaklaşık 19'unun beyni bu aralıkta kalır.",
    outOfRange: "Bu değer verideki aralığın ({min}–{max} cm³) dışında. Tahmin güvenilir değil.",
    errEmpty: "Baş hacmini cm³ olarak yaz.",
    errNotNumber: "Sadece rakam yaz, örneğin 3600.",
    errTooSmall: "Bu değer bir yetişkin başı için çok küçük. {min} cm³ ya da daha büyük bir değer yaz.",
    errTooLarge: "Bu değer bir yetişkin başı için çok büyük. {max} cm³ ya da daha küçük bir değer yaz.",
    loadError: "Model yüklenemedi. Sayfayı yenile.",
    chartLabel: "237 kişinin baş hacmi ve beyin ağırlığı. Çizgi modelin tahmini, bant %95 tahmin aralığı.",
    axisX: "Baş hacmi (cm³)",
    axisY: "Beyin ağırlığı (g)",
    legendData: "Ölçülen kişiler",
    legendModel: "Model",
    legendBand: "%95 aralık",
    legendYou: "Senin değerin",
    howTitle: "Nasıl çalışır",
    how1: "Model düz bir doğru: beyin ağırlığı ≈ {a} + {b} × baş hacmi. Baş hacmi 100 cm³ arttığında tahmin yaklaşık {per100} g artar.",
    how2: "Beş farklı model aynı verinin 50 farklı bölmesinde sınandı. Daha karmaşık modeller hatayı yarım gram kadar azalttı. Bu fark ölçüm gürültüsünün içinde kaldığı için en basit model seçildi.",
    how3: "Tahminin ortalama hatası yaklaşık {mae} g. Aralık verinin kenarlarına doğru genişler, çünkü model orada daha az örnek görmüştür.",
    howLink: "Model karşılaştırmasına bak",
    dataTitle: "Veri ve sınırlar",
    data1: "Veri, R. J. Gladstone'un 1905'te Biometrika dergisinde yayımlanan çalışmasından geliyor: 237 yetişkinin kafa ölçülerinden hesaplanan baş hacmi ve beyin ağırlığı. Verideki baş hacmi {min}–{max} cm³ arasında.",
    data2: "Model sadece yetişkinler için. Çocuk ve bebeklerde beyin ile baş arasındaki ilişki farklıdır.",
    data3: "Bu bir tıbbi araç değildir; teşhis ya da tedavi için kullanılmamalı.",
    projects: "Projelerim",
    portfolio: "Portfolyo",
    source: "Kaynak kodu",
  },
  en: {
    docTitle: "Brain weight prediction from head size",
    docDescription:
      "Enter head size and see the predicted brain weight with a 95% prediction interval. A model trained on measurements of 237 adults and chosen with cross-validation.",
    siteName: "Brain weight prediction",
    navCalculator: "Calculator",
    navModel: "Model",
    switchLang: "Türkçe",
    switchLangLabel: "Türkçeye geç",
    themeToDark: "Switch to dark theme",
    themeToLight: "Switch to light theme",
    heading: "Predict brain weight from head size",
    intro:
      "Enter a head size. A model trained on 237 adults measured in 1905 shows the predicted brain weight and its margin of error.",
    inputLabel: "Head size",
    inputHint: "in cm³, for example 3600",
    resultLabel: "Predicted brain weight",
    interval: "95% prediction interval: {low}–{high} g",
    intervalNote: "About 19 in 20 people with this head size have a brain weight in this range.",
    outOfRange: "This value is outside the range in the data ({min}–{max} cm³). The prediction is not reliable.",
    errEmpty: "Enter the head size in cm³.",
    errNotNumber: "Use digits only, for example 3600.",
    errTooSmall: "This is too small for an adult head. Enter {min} cm³ or more.",
    errTooLarge: "This is too large for an adult head. Enter {max} cm³ or less.",
    loadError: "The model could not be loaded. Reload the page.",
    chartLabel: "Head size and brain weight of 237 people. The line is the model's prediction, the band is the 95% prediction interval.",
    axisX: "Head size (cm³)",
    axisY: "Brain weight (g)",
    legendData: "People measured",
    legendModel: "Model",
    legendBand: "95% interval",
    legendYou: "Your value",
    howTitle: "How it works",
    how1: "The model is a straight line: brain weight ≈ {a} + {b} × head size. Each extra 100 cm³ of head size adds about {per100} g to the prediction.",
    how2: "Five models were tested on 50 different splits of the same data. The more complex ones lowered the error by about half a gram. That is within the measurement noise, so the simplest model was chosen.",
    how3: "The average error of a prediction is about {mae} g. The interval widens towards the edges of the data, where the model has seen fewer examples.",
    howLink: "See the model comparison",
    dataTitle: "Data and limits",
    data1: "The data comes from R. J. Gladstone's study published in Biometrika in 1905: head size calculated from head measurements, and brain weight, for 237 adults. Head size in the data ranges from {min} to {max} cm³.",
    data2: "The model is for adults only. In children and babies the relation between brain and head is different.",
    data3: "This is not a medical tool and must not be used for diagnosis or treatment.",
    projects: "My projects",
    portfolio: "Portfolio",
    source: "Source code",
  },
};

let lang = readSettings().lang ?? (navigator.language?.toLowerCase().startsWith("tr") ? "tr" : "en");
if (!(lang in MESSAGES)) lang = "en";

export const getLang = () => lang;

export function t(key, params = {}) {
  const text = MESSAGES[lang][key] ?? MESSAGES.tr[key] ?? key;
  return text.replace(/\{(\w+)\}/g, (_, name) => String(params[name] ?? ""));
}

export function formatNumber(value, digits = 0) {
  return new Intl.NumberFormat(lang === "tr" ? "tr-TR" : "en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

/** data-i18n (metin), data-i18n-aria (aria-label) ve data-i18n-params (JSON) özniteliklerini doldurur. */
export function applyTranslations(root = document) {
  document.documentElement.lang = lang;
  document.title = t("docTitle");
  document.querySelector('meta[name="description"]')?.setAttribute("content", t("docDescription"));
  for (const element of root.querySelectorAll("[data-i18n]")) {
    const params = element.dataset.i18nParams ? JSON.parse(element.dataset.i18nParams) : {};
    element.textContent = t(element.dataset.i18n, params);
  }
  for (const element of root.querySelectorAll("[data-i18n-aria]")) {
    element.setAttribute("aria-label", t(element.dataset.i18nAria));
  }
}

export function toggleLang() {
  lang = lang === "tr" ? "en" : "tr";
  saveSettings({ lang });
}
