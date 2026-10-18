// Açık/koyu tema geçişi. Seçim yapılmamışsa sistem teması izlenir.
import { saveSettings } from "./settings.js";

const COLORS = { light: "#f3f6f4", dark: "#14202f" };
const systemDark = window.matchMedia("(prefers-color-scheme: dark)");

export function currentTheme() {
  return document.documentElement.dataset.theme ?? (systemDark.matches ? "dark" : "light");
}

function syncMeta() {
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", COLORS[currentTheme()]);
}

export function toggleTheme() {
  const next = currentTheme() === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  saveSettings({ theme: next });
  syncMeta();
}

/** Tema her değiştiğinde (düğme ya da sistem ayarı) callback çağrılır. */
export function initTheme(onChange) {
  syncMeta();
  systemDark.addEventListener("change", () => {
    syncMeta();
    onChange();
  });
}
