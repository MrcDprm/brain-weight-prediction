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
    how2: "Beş farklı model aynı verinin 50 farklı bölmesinde sınandı. Daha karmaşık modeller hatayı 1 gramdan az düşürdü. Bu fark ölçüm gürültüsünün içinde kaldığı için en basit model seçildi.",
    how3: "Tahminin ortalama hatası yaklaşık {mae} g. Aralık verinin kenarlarına doğru genişler, çünkü model orada daha az örnek görmüştür.",
    howLink: "Model karşılaştırmasına bak",
    dataTitle: "Veri ve sınırlar",
    data1: "Veri, R. J. Gladstone'un 1905'te Biometrika dergisinde yayımlanan çalışmasından geliyor: 237 yetişkinin kafa ölçülerinden hesaplanan baş hacmi ve beyin ağırlığı. Verideki baş hacmi {min}–{max} cm³ arasında.",
    data2: "Model sadece yetişkinler için. Çocuk ve bebeklerde beyin ile baş arasındaki ilişki farklıdır.",
    data3: "Bu bir tıbbi araç değildir; teşhis ya da tedavi için kullanılmamalı.",
    modelDocTitle: "Model karşılaştırması: beyin ağırlığı tahmini",
    modelDocDescription:
      "Beyin ağırlığı tahmini için beş regresyon modelinin tekrarlı 10 katlı çapraz doğrulamayla karşılaştırması, seçilen model ve sınırları.",
    modelHeading: "Model nasıl seçildi",
    modelIntro:
      "Beş aday model ve her zaman ortalamayı söyleyen bir referans model aynı sınavdan geçti: veri karıştırılıp 10 parçaya bölündü, her parça bir kez test için ayrıldı ve bu 5 kez tekrarlandı. Tablodaki değerler bu 50 testin ortalaması ve standart sapması.",
    tableCaption: "Çapraz doğrulama sonuçları. Hata düşükse ve R² yüksekse model daha iyi.",
    colModel: "Model",
    colMae: "Ortalama hata (g)",
    colRmse: "RMSE (g)",
    colR2: "R²",
    selectedTag: "seçildi",
    model_linear_head: "Doğrusal (baş hacmi)",
    model_linear_full: "Doğrusal (baş hacmi, cinsiyet, yaş)",
    model_poly_head: "Polinom, 2. derece (baş hacmi)",
    model_ridge_full: "Ridge (baş hacmi, cinsiyet, yaş)",
    model_random_forest_full: "Random Forest (baş hacmi, cinsiyet, yaş)",
    model_baseline_mean: "Referans: hep ortalamayı söyler",
    reasonTitle: "Neden en basit model",
    reasonSimpler:
      "En düşük hatayı {best} verdi ({bestMae} g). Seçilen {chosen} modeli {diff} g geride. Bu fark bir standart hatanın ({se} g) içinde, yani ölçüm gürültüsünden ayırt edilemiyor. İki model bu kadar yakınken daha az parametreli olanı yeni verilerde daha güvenilirdir.",
    reasonBest: "En düşük hatayı {chosen} verdi ({bestMae} g) ve seçildi.",
    reasonExtra:
      "Baş hacmi bilindikten sonra cinsiyet ve yaş grubu neredeyse yeni bilgi getirmiyor. Random Forest bu kadar küçük ve doğrusal bir veride ezberlemeye kayıp daha kötü sonuç verdi.",
    residualTitle: "Artıklar",
    residualText:
      "Artık, gerçek beyin ağırlığı ile tahmin arasındaki fark. Noktalar sıfır çizgisinin iki yanına dengeli dağılıyor ve bir eğri çizmiyor; bu da düz bir doğrunun bu veri için yeterli olduğunu gösteriyor. Bant, noktaların yaklaşık %95'inin düştüğü ±{band} g aralığı.",
    residualLabel: "Her kişi için artık (gerçek eksi tahmin), baş hacmine göre.",
    axisResidual: "Artık (g)",
    cardTitle: "Model kartı",
    cardUseTerm: "Kullanım amacı",
    cardUse: "Baş hacminden yetişkin beyin ağırlığı tahminini göstermek. Öğrenme ve gösterim amaçlı.",
    cardDataTerm: "Veri",
    cardData:
      "237 yetişkin, R. J. Gladstone (1905), Biometrika IV. Baş hacmi (cm³), beyin ağırlığı (g), cinsiyet ve yaş grubu (20–46, 46+).",
    cardMethodTerm: "Yöntem",
    cardMethod: "En küçük kareler doğrusal regresyon. %95 tahmin aralığı t dağılımıyla hesaplanır ({dof} serbestlik derecesi).",
    cardFormulaTerm: "Formül",
    cardFormula: "beyin ağırlığı = {a} + {b} × baş hacmi, σ = {sigma} g",
    cardPerfTerm: "Başarı",
    cardPerf: "Çapraz doğrulamada ortalama hata {mae} g, R² {r2}.",
    cardLimitsTerm: "Sınırlar",
    cardLimits:
      "Sadece yetişkinler için. Veri 1905'e ait ve tek bir topluluktan. {min}–{max} cm³ dışında tahmin güvenilir değil. Tıbbi bir araç değildir.",
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
    how2: "Five models were tested on 50 different splits of the same data. The more complex ones lowered the error by less than 1 g. That is within the measurement noise, so the simplest model was chosen.",
    how3: "The average error of a prediction is about {mae} g. The interval widens towards the edges of the data, where the model has seen fewer examples.",
    howLink: "See the model comparison",
    dataTitle: "Data and limits",
    data1: "The data comes from R. J. Gladstone's study published in Biometrika in 1905: head size calculated from head measurements, and brain weight, for 237 adults. Head size in the data ranges from {min} to {max} cm³.",
    data2: "The model is for adults only. In children and babies the relation between brain and head is different.",
    data3: "This is not a medical tool and must not be used for diagnosis or treatment.",
    modelDocTitle: "Model comparison: brain weight prediction",
    modelDocDescription:
      "Five regression models for brain weight prediction compared with repeated 10-fold cross-validation, plus the chosen model and its limits.",
    modelHeading: "How the model was chosen",
    modelIntro:
      "Five candidate models and a baseline that always predicts the mean took the same test: the data was shuffled and split into 10 parts, each part was held out once for testing, and this was repeated 5 times. The table shows the mean and standard deviation over these 50 tests.",
    tableCaption: "Cross-validation results. Lower error and higher R² are better.",
    colModel: "Model",
    colMae: "Mean error (g)",
    colRmse: "RMSE (g)",
    colR2: "R²",
    selectedTag: "chosen",
    model_linear_head: "Linear (head size)",
    model_linear_full: "Linear (head size, sex, age)",
    model_poly_head: "Polynomial, degree 2 (head size)",
    model_ridge_full: "Ridge (head size, sex, age)",
    model_random_forest_full: "Random Forest (head size, sex, age)",
    model_baseline_mean: "Baseline: always the mean",
    reasonTitle: "Why the simplest model",
    reasonSimpler:
      "The lowest error came from {best} ({bestMae} g). The chosen {chosen} model is {diff} g behind. That gap is within one standard error ({se} g), so it cannot be told apart from measurement noise. When two models are this close, the one with fewer parameters is more reliable on new data.",
    reasonBest: "{chosen} had the lowest error ({bestMae} g) and was chosen.",
    reasonExtra:
      "Once head size is known, sex and age group add almost no new information. Random Forest overfits on such a small, linear dataset and did worse.",
    residualTitle: "Residuals",
    residualText:
      "A residual is the actual brain weight minus the prediction. The points spread evenly on both sides of zero and do not curve, which shows that a straight line is enough for this data. The band is the ±{band} g range where about 95% of the points fall.",
    residualLabel: "Residual (actual minus predicted) for each person, by head size.",
    axisResidual: "Residual (g)",
    cardTitle: "Model card",
    cardUseTerm: "Intended use",
    cardUse: "Showing how adult brain weight can be predicted from head size. For learning and demonstration.",
    cardDataTerm: "Data",
    cardData:
      "237 adults, R. J. Gladstone (1905), Biometrika IV. Head size (cm³), brain weight (g), sex and age group (20–46, 46+).",
    cardMethodTerm: "Method",
    cardMethod: "Ordinary least squares linear regression. The 95% prediction interval uses the t distribution ({dof} degrees of freedom).",
    cardFormulaTerm: "Formula",
    cardFormula: "brain weight = {a} + {b} × head size, σ = {sigma} g",
    cardPerfTerm: "Performance",
    cardPerf: "Cross-validated mean error {mae} g, R² {r2}.",
    cardLimitsTerm: "Limits",
    cardLimits:
      "Adults only. The data is from 1905 and from a single population. Predictions outside {min}–{max} cm³ are not reliable. Not a medical tool.",
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

/** data-i18n (metin) ve data-i18n-aria (aria-label) özniteliklerini doldurur. */
export function applyTranslations(root = document) {
  document.documentElement.lang = lang;
  // <body data-page="model"> → modelDocTitle; anahtar yoksa hesaplayıcının başlığı
  const page = document.body.dataset.page ?? "";
  const key = (name) => (page ? page + name : name.charAt(0).toLowerCase() + name.slice(1));
  document.title = t(key("DocTitle"));
  document.querySelector('meta[name="description"]')?.setAttribute("content", t(key("DocDescription")));
  for (const element of root.querySelectorAll("[data-i18n]")) {
    element.textContent = t(element.dataset.i18n);
  }
  for (const element of root.querySelectorAll("[data-i18n-aria]")) {
    element.setAttribute("aria-label", t(element.dataset.i18nAria));
  }
}

export function toggleLang() {
  lang = lang === "tr" ? "en" : "tr";
  saveSettings({ lang });
}
