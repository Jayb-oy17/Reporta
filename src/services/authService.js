// ─────────────────────────────────────────────────────────────────────────────
// src/services/authService.js
//
// Async authentication helpers. Backed by localStorage today; swap the bodies
// for fetch() calls (POST /api/auth/login, etc.) when wiring a real backend.
// ─────────────────────────────────────────────────────────────────────────────

import { STORAGE_KEYS, getItem, setItem, removeItem } from "./storage";
import { fetchAllData } from "./dataService";

/** GET — current persisted session, or null. */
export async function getSession() {
  return getItem(STORAGE_KEYS.session, null);
}

/** Persist a session. */
export async function saveSession(session) {
  return setItem(STORAGE_KEYS.session, session);
}

/** Clear the persisted session. */
export async function clearSession() {
  return removeItem(STORAGE_KEYS.session);
}

/**
 * POST /api/auth/login
 *
 * Validates credentials against the stored dataset and returns
 *   { success: true, user, role }
 * or
 *   { success: false, message }
 */
export async function login({ role, username, password }) {
  const data = await fetchAllData();

  switch (role) {
    case "admin": {
      const user = data.staff.find(
        (s) => s.role === "admin" && s.username === username && s.password === password,
      );
      if (!user) return invalid();
      return { success: true, user, role };
    }

    case "teacher": {
      const user = data.staff.find(
        (s) => s.role === "teacher" && s.username === username && s.password === password,
      );
      if (!user) return invalid();
      if (!user.approved) return pending();
      return { success: true, user, role };
    }

    case "parent": {
      const user = data.parents.find(
        (p) => p.username === username && p.password === password,
      );
      if (!user) return invalid();
      if (!user.approved) return pending();
      return { success: true, user, role };
    }

    case "student": {
      const user = data.students.find(
        (s) => s.admissionNumber === username && s.dateOfBirth === password,
      );
      if (!user) return invalid();
      return { success: true, user, role };
    }

    default:
      return invalid();
  }
}

function invalid() {
  return { success: false, message: "Invalid credentials. Please try again." };
}
function pending() {
  return { success: false, message: "Your account is pending admin approval." };
}
