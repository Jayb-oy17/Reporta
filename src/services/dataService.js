// ─────────────────────────────────────────────────────────────────────────────
// src/services/dataService.js
//
// Domain-level data access. Every function returns a Promise, so swapping
// localStorage for a real REST/GraphQL API later is a one-file change:
// replace the body of each function with a fetch() call to the matching
// endpoint shown in the JSDoc.
// ─────────────────────────────────────────────────────────────────────────────

import { STORAGE_KEYS, getItem, setItem, updateItem } from "./storage";

/** Empty data shape used when nothing is stored yet. */
export const EMPTY_DATA = Object.freeze({
  students: [],
  staff: [],
  parents: [],
  classes: [],
});

// ── Whole-store helpers ──────────────────────────────────────────────────────

/** GET /api/data — returns the full app dataset. */
export async function fetchAllData() {
  const data = await getItem(STORAGE_KEYS.data, null);
  return data ?? structuredClone(EMPTY_DATA);
}

/** PUT /api/data — overwrites the full app dataset. */
export async function saveAllData(next) {
  return setItem(STORAGE_KEYS.data, next);
}

// ── Students ─────────────────────────────────────────────────────────────────

/** POST /api/students */
export async function createStudent(student) {
  return updateItem(
    STORAGE_KEYS.data,
    (prev) => {
      const base = prev ?? structuredClone(EMPTY_DATA);
      if (base.students.some((s) => s.admissionNumber === student.admissionNumber)) {
        throw new Error("Admission number already exists.");
      }
      const newStudent = {
        id: `student-${Date.now()}`,
        terms: [],
        attendance: [],
        gender: student.gender || "M",
        age: student.age || "",
        ...student,
      };
      return { ...base, students: [...base.students, newStudent] };
    },
    structuredClone(EMPTY_DATA),
  );
}

/** PATCH /api/students/:id */
export async function updateStudent(studentId, updater) {
  return updateItem(STORAGE_KEYS.data, (prev) => {
    const base = prev ?? structuredClone(EMPTY_DATA);
    return {
      ...base,
      students: base.students.map((s) => (s.id === studentId ? updater(s) : s)),
    };
  });
}

/** PATCH /api/students/:id/terms/:termId */
export async function updateStudentTerm(studentId, termId, updater) {
  return updateItem(STORAGE_KEYS.data, (prev) => {
    const base = prev ?? structuredClone(EMPTY_DATA);
    return {
      ...base,
      students: base.students.map((s) => {
        if (s.id !== studentId) return s;
        return {
          ...s,
          terms: (s.terms || []).map((t) => (t.id === termId ? updater(t) : t)),
        };
      }),
    };
  });
}

/** DELETE /api/students/:id */
export async function deleteStudent(studentId) {
  return updateItem(STORAGE_KEYS.data, (prev) => {
    const base = prev ?? structuredClone(EMPTY_DATA);
    return { ...base, students: base.students.filter((s) => s.id !== studentId) };
  });
}

// ── Staff ────────────────────────────────────────────────────────────────────

/** POST /api/staff */
export async function createStaff(member) {
  return updateItem(STORAGE_KEYS.data, (prev) => {
    const base = prev ?? structuredClone(EMPTY_DATA);
    if (base.staff.some((s) => s.username === member.username)) {
      throw new Error("Username already taken.");
    }
    const newStaff = {
      id: member.id || `staff-${Date.now()}`,
      ...member,
      // Admins are auto-approved; teachers must be approved by an admin.
      approved: member.role === "admin" ? true : Boolean(member.approved),
    };
    return { ...base, staff: [...base.staff, newStaff] };
  });
}

/** PATCH /api/staff/:id */
export async function updateStaff(staffId, updater) {
  return updateItem(STORAGE_KEYS.data, (prev) => {
    const base = prev ?? structuredClone(EMPTY_DATA);
    return {
      ...base,
      staff: base.staff.map((s) => (s.id === staffId ? updater(s) : s)),
    };
  });
}

/** DELETE /api/staff/:id */
export async function deleteStaff(staffId) {
  return updateItem(STORAGE_KEYS.data, (prev) => {
    const base = prev ?? structuredClone(EMPTY_DATA);
    return { ...base, staff: base.staff.filter((s) => s.id !== staffId) };
  });
}

// ── Parents ──────────────────────────────────────────────────────────────────

/** POST /api/parents */
export async function createParent(parent) {
  return updateItem(STORAGE_KEYS.data, (prev) => {
    const base = prev ?? structuredClone(EMPTY_DATA);
    const taken =
      base.staff.some((s) => s.username === parent.username) ||
      base.parents.some((p) => p.username === parent.username);
    if (taken) throw new Error("Username already taken.");
    const newParent = {
      id: `parent-${Date.now()}`,
      students: [],
      approved: false,
      ...parent,
    };
    return { ...base, parents: [...base.parents, newParent] };
  });
}

/** PATCH /api/parents/:id */
export async function updateParent(parentId, updater) {
  return updateItem(STORAGE_KEYS.data, (prev) => {
    const base = prev ?? structuredClone(EMPTY_DATA);
    return {
      ...base,
      parents: base.parents.map((p) => (p.id === parentId ? updater(p) : p)),
    };
  });
}

/** DELETE /api/parents/:id */
export async function deleteParent(parentId) {
  return updateItem(STORAGE_KEYS.data, (prev) => {
    const base = prev ?? structuredClone(EMPTY_DATA);
    return { ...base, parents: base.parents.filter((p) => p.id !== parentId) };
  });
}

// ── Classes ──────────────────────────────────────────────────────────────────

/** POST /api/classes */
export async function createClass(cls) {
  return updateItem(STORAGE_KEYS.data, (prev) => {
    const base = prev ?? structuredClone(EMPTY_DATA);
    const newClass = { id: cls.id || `cls-${Date.now()}`, ...cls };
    return { ...base, classes: [...base.classes, newClass] };
  });
}

/** DELETE /api/classes/:id */
export async function deleteClass(classId) {
  return updateItem(STORAGE_KEYS.data, (prev) => {
    const base = prev ?? structuredClone(EMPTY_DATA);
    return { ...base, classes: base.classes.filter((c) => c.id !== classId) };
  });
}
