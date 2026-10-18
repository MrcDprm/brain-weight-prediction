// Tema ve dil tercihi tarayıcıda saklanır; depolama kapalıysa varsayılanlar kullanılır.
const KEY = "brain-settings";

export function readSettings() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? {};
  } catch {
    return {};
  }
}

export function saveSettings(changes) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...readSettings(), ...changes }));
  } catch {
    // Gizli pencere vb.: tercih bu oturumla sınırlı kalır
  }
}
