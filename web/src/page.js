// İki sayfanın ortak parçaları: çeviriler, tema düğmesi ve dil düğmesi.
import { applyTranslations, getLang, t, toggleLang } from "./i18n.js";
import { currentTheme, initTheme, toggleTheme } from "./theme.js";

export const $ = (id) => document.getElementById(id);

export async function loadJson(name) {
  const response = await fetch(name);
  if (!response.ok) throw new Error(`${name}: ${response.status}`);
  return response.json();
}

function updateButtons() {
  $("theme-toggle").setAttribute("aria-label", t(currentTheme() === "dark" ? "themeToLight" : "themeToDark"));
  // Düğme diğer dilin adını gösterir; ekran okuyucu onu o dilde okusun
  $("lang-toggle").setAttribute("lang", getLang() === "tr" ? "en" : "tr");
}

/** Sayfayı hazırlar; dil değişince onLangChange çağrılır (sayfaya özel metinler için). */
export function initPage(onLangChange = () => {}) {
  applyTranslations();
  initTheme(updateButtons);
  updateButtons();
  $("theme-toggle").addEventListener("click", () => {
    toggleTheme();
    updateButtons();
  });
  $("lang-toggle").addEventListener("click", () => {
    toggleLang();
    applyTranslations();
    updateButtons();
    onLangChange();
  });
}
