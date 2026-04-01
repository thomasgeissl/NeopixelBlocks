export function isTauri(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as any;

  if (w.__TAURI__ || w.__TAURI_IPC__) return true;

  const ua = window.navigator.userAgent.toLowerCase();
  return ua.includes("tauri");
}

