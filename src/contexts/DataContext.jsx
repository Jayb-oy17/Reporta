import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  EMPTY_DATA,
  fetchAllData,
  saveAllData,
  createStudent as svcCreateStudent,
  updateStudent as svcUpdateStudent,
  updateStudentTerm as svcUpdateStudentTerm,
  deleteStudent as svcDeleteStudent,
  createStaff as svcCreateStaff,
  updateStaff as svcUpdateStaff,
  deleteStaff as svcDeleteStaff,
  createParent as svcCreateParent,
  updateParent as svcUpdateParent,
  deleteParent as svcDeleteParent,
} from "../services/dataService";

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [data, setData] = useState(null);
  const [ready, setReady] = useState(false);

  // Initial async load from storage layer.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const loaded = await fetchAllData();
      if (!cancelled) {
        setData(loaded);
        setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Replace the whole dataset.
  const saveData = useCallback(async (newData) => {
    await saveAllData(newData);
    setData(newData);
  }, []);

  const getData = useCallback(() => data, [data]);

  // ── Helper: wrap a service call so the local React state stays in sync ────
  const refresh = useCallback(async () => {
    const fresh = await fetchAllData();
    setData(fresh);
    return fresh;
  }, []);

  // ── Students ──────────────────────────────────────────────────────────────
  const addStudent = useCallback(
    async (student) => {
      try {
        await svcCreateStudent(student);
        const fresh = await refresh();
        const newStudent = fresh.students.find(
          (s) => s.admissionNumber === student.admissionNumber,
        );
        return { success: true, newStudent };
      } catch (err) {
        return { success: false, message: err.message };
      }
    },
    [refresh],
  );

  const updateStudent = useCallback(
    async (studentId, updater) => {
      await svcUpdateStudent(studentId, updater);
      await refresh();
    },
    [refresh],
  );

  const updateStudentTerm = useCallback(
    async (studentId, termId, updater) => {
      await svcUpdateStudentTerm(studentId, termId, updater);
      await refresh();
    },
    [refresh],
  );

  const deleteStudent = useCallback(
    async (studentId) => {
      await svcDeleteStudent(studentId);
      await refresh();
    },
    [refresh],
  );

  // ── Staff ─────────────────────────────────────────────────────────────────
  const addStaff = useCallback(
    async (member) => {
      try {
        await svcCreateStaff(member);
        await refresh();
        return { success: true };
      } catch (err) {
        return { success: false, message: err.message };
      }
    },
    [refresh],
  );

  const updateStaff = useCallback(
    async (staffId, updater) => {
      await svcUpdateStaff(staffId, updater);
      await refresh();
    },
    [refresh],
  );

  const deleteStaff = useCallback(
    async (staffId) => {
      await svcDeleteStaff(staffId);
      await refresh();
    },
    [refresh],
  );

  // ── Parents ───────────────────────────────────────────────────────────────
  const addParent = useCallback(
    async (parent) => {
      try {
        await svcCreateParent(parent);
        const fresh = await refresh();
        const newParent = fresh.parents.find((p) => p.username === parent.username);
        return { success: true, newParent };
      } catch (err) {
        return { success: false, message: err.message };
      }
    },
    [refresh],
  );

  const updateParent = useCallback(
    async (parentId, updater) => {
      await svcUpdateParent(parentId, updater);
      await refresh();
    },
    [refresh],
  );

  const deleteParent = useCallback(
    async (parentId) => {
      await svcDeleteParent(parentId);
      await refresh();
    },
    [refresh],
  );

  return (
    <DataContext.Provider
      value={{
        data: data ?? EMPTY_DATA,
        ready,
        saveData,
        getData,
        refresh,
        updateStudent,
        updateStudentTerm,
        addStudent,
        deleteStudent,
        updateStaff,
        addStaff,
        deleteStaff,
        updateParent,
        addParent,
        deleteParent,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
