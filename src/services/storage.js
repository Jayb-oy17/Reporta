// ─────────────────────────────────────────────────────────────────────────────
// src/services/storage.js
//
// Async wrappers around localStorage. All app-level data access goes through
// here (or through dataService.js / authService.js which use these helpers).
//
// To migrate to a real backend later:
//   • Leave callers untouched.
//   • Replace getItem/setItem/removeItem bodies with fetch() calls
//     (e.g. GET /api/store/:key, PUT /api/store/:key) — the Promise-based
//     signatures already match a real network layer.
// ─────────────────────────────────────────────────────────────────────────────

export const STORAGE_KEYS = {
  data: "eduData",
  session: "eduSession",
  preferences: "eduPreferences",
};

const SIMULATED_LATENCY_MS = 0; // bump >0 to simulate slow network in dev

function delay(ms = SIMULATED_LATENCY_MS) {
  return ms > 0 ? new Promise((r) => setTimeout(r, ms)) : Promise.resolve();
}

/** Read a value by key. Returns parsed JSON, or `defaultValue` if missing. */
export async function getItem(key, defaultValue = null) {
  await delay();
  try {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(key) : null;
    if (raw === null || raw === undefined) return defaultValue;
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

/** Write a value by key. JSON-serialised. */
export async function setItem(key, value) {
  await delay();
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
    return value;
  } catch (err) {
    console.error(`storage.setItem(${key}) failed`, err);
    throw err;
  }
}

/** Remove a key. */
export async function removeItem(key) {
  await delay();
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(key);
  }
}

/** Atomic update: read → mutate → write. `updater(current) => next`. */
export async function updateItem(key, updater, defaultValue = null) {
  const current = await getItem(key, defaultValue);
  const next = updater(current);
  await setItem(key, next);
  return next;
}
