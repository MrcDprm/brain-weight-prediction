// Tarayıcıda tahmin: model.json'daki doğrusal model ve %95 tahmin aralığı.
// Saf fonksiyonlar; DOM'a dokunmaz, Node ile test edilir.

// Bu aralığın dışı ölçüm hatası sayılır ve reddedilir (cm³)
export const HARD_LIMITS = { min: 1000, max: 8000 };

// Tasarım matrisinin bir satırı: [1, terimler...]; Python'daki _row_vector ile aynı
function rowVector(model, row) {
  return [
    1,
    ...model.terms.map((term) => {
      const value = row[term.column];
      return "equals" in term ? Number(value === term.equals) : Number(value);
    }),
  ];
}

function dot(a, b) {
  return a.reduce((sum, value, i) => sum + value * b[i], 0);
}

/** Tahmin, aralığın alt/üst sınırı ve değerin eğitim aralığının dışında olup olmadığı. */
export function predict(model, row) {
  const x = rowVector(model, row);
  const mean = dot(x, model.coefficients);
  // leverage = xᵀ (XᵀX)⁻¹ x
  const leverage = dot(x, model.xtx_inv.map((matrixRow) => dot(matrixRow, x)));
  const halfWidth = model.t * model.sigma * Math.sqrt(1 + leverage);
  const [min, max] = model.training_range.head_size;
  return {
    mean,
    low: mean - halfWidth,
    high: mean + halfWidth,
    outOfRange: row.head_size < min || row.head_size > max,
  };
}

/** Kullanıcının yazdığı metni doğrular: { value } ya da { error }. */
export function parseHeadSize(text) {
  const trimmed = String(text ?? "").trim();
  if (trimmed === "") return { error: "empty" };
  let value;
  if (/^\d+([.,]\d+)?$/.test(trimmed)) {
    // Rakamlar ve en fazla bir ondalık ayıracı (virgül ya da nokta)
    value = Number(trimmed.replace(",", "."));
  }
  // "3.600" ya da "3,600": ondalık okunursa 3,6 cm³ olur, bu da imkânsız;
  // üçlü gruplar varsa ve ondalık okuma çok küçükse binlik ayıracı sayılır
  if (/^\d{1,3}([.,]\d{3})+$/.test(trimmed) && !(value >= HARD_LIMITS.min)) {
    value = Number(trimmed.replace(/[.,]/g, ""));
  }
  if (value === undefined) return { error: "notNumber" };
  if (value < HARD_LIMITS.min) return { error: "tooSmall" };
  if (value > HARD_LIMITS.max) return { error: "tooLarge" };
  return { value };
}
