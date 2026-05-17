import { useState } from "react";
import { useData } from "../../contexts/DataContext";
import { useTheme } from "../../contexts/ThemeContext";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";

function uid(p) {
  return `${p}-${Math.random().toString(36).slice(2, 9)}`;
}

function Tab({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium border-b-2 transition-all ${
        active
          ? "border-blue-600 text-blue-600"
          : "border-transparent text-slate-500 hover:text-slate-700"
      }`}
    >
      {label}
    </button>
  );
}

export default function AdminManageUsers() {
  const {
    data,
    addStudent,
    updateStudent,
    deleteStudent,
    addStaff,
    updateStaff,
    deleteStaff,
    addParent,
    updateParent,
    deleteParent,
  } = useData();
  const { dark } = useTheme();
  const [activeTab, setActiveTab] = useState("students");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(null);

  if (!data) return null;

  const input = (label, key, val, onChange, type = "text") => (
    <div key={key}>
      <label
        className={`block text-xs font-semibold mb-1 ${dark ? "text-slate-300" : "text-slate-600"}`}
      >
        {label}
      </label>
      <input
        type={type}
        value={val}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-1.5 rounded-lg border text-sm ${
          dark
            ? "bg-slate-700 border-slate-600 text-white"
            : "bg-white border-slate-300 text-slate-800"
        } outline-none`}
      />
    </div>
  );

  const selectEl = (label, key, val, onChange, options) => (
    <div key={key}>
      <label
        className={`block text-xs font-semibold mb-1 ${dark ? "text-slate-300" : "text-slate-600"}`}
      >
        {label}
      </label>
      <select
        value={val}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-1.5 rounded-lg border text-sm ${
          dark
            ? "bg-slate-700 border-slate-600 text-white"
            : "bg-white border-slate-300 text-slate-800"
        } outline-none`}
      >
        <option value="">– Select –</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );

  const tableWrapper = (headers, rows) => (
    <div
      className={`rounded-xl border overflow-hidden shadow-sm ${dark ? "border-slate-700" : "border-slate-200"}`}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr
              className={
                dark
                  ? "bg-slate-700 text-slate-200"
                  : "bg-slate-50 text-slate-600"
              }
            >
              {headers.map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left font-semibold whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody
            className={`divide-y ${dark ? "divide-slate-700" : "divide-slate-100"}`}
          >
            {rows}
          </tbody>
        </table>
      </div>
    </div>
  );

  const actionBtns = (id, onEdit, onDelete) => (
    <div className="flex gap-1.5">
      <button
        onClick={onEdit}
        className="p-1.5 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200"
      >
        <Pencil size={13} />
      </button>
      <button
        onClick={onDelete}
        className="p-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );

  // ── STUDENTS ──
  const StudentsTab = () => {
    const startAdd = () => {
      setAddForm({
        name: "",
        admissionNumber: "",
        classId: "",
        parentId: "",
        dateOfBirth: "",
        gender: "M",
      });
      setShowAdd(true);
    };
    const doAdd = () => {
      addStudent({ id: uid("stu"), ...addForm, photo: "👤", terms: [] });
      setShowAdd(false);
      setAddForm({});
    };
    const startEdit = (s) => {
      setEditingId(s.id);
      setEditForm({
        name: s.name,
        admissionNumber: s.admissionNumber,
        classId: s.classId,
        parentId: s.parentId,
        dateOfBirth: s.dateOfBirth,
        gender: s.gender,
      });
    };
    const doEdit = (s) => {
      updateStudent(s.id, (prev) => ({ ...prev, ...editForm }));
      setEditingId(null);
    };

    return (
      <>
        <div className="flex justify-between items-center mb-4">
          <p
            className={`text-sm ${dark ? "text-slate-400" : "text-slate-500"}`}
          >
            {data.students.length} students
          </p>
          <button
            onClick={startAdd}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
          >
            <Plus size={15} /> Add Student
          </button>
        </div>
        {showAdd && (
          <div
            className={`rounded-xl border p-4 mb-4 grid grid-cols-2 gap-3 ${dark ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"}`}
          >
            <div className="col-span-2 font-semibold text-sm">
              Add New Student
            </div>
            {input("Full Name", "name", addForm.name, (v) =>
              setAddForm((f) => ({ ...f, name: v })),
            )}
            {input("Admission Number", "admNo", addForm.admissionNumber, (v) =>
              setAddForm((f) => ({ ...f, admissionNumber: v })),
            )}
            {selectEl(
              "Class",
              "cls",
              addForm.classId,
              (v) => setAddForm((f) => ({ ...f, classId: v })),
              data.classes.map((c) => ({ value: c.id, label: c.name })),
            )}
            {selectEl(
              "Parent",
              "par",
              addForm.parentId,
              (v) => setAddForm((f) => ({ ...f, parentId: v })),
              data.parents.map((p) => ({ value: p.id, label: p.name })),
            )}
            {input(
              "Date of Birth",
              "dob",
              addForm.dateOfBirth,
              (v) => setAddForm((f) => ({ ...f, dateOfBirth: v })),
              "date",
            )}
            {selectEl(
              "Gender",
              "gen",
              addForm.gender,
              (v) => setAddForm((f) => ({ ...f, gender: v })),
              [
                { value: "M", label: "Male" },
                { value: "F", label: "Female" },
              ],
            )}
            <div className="col-span-2 flex gap-2 justify-end">
              <button
                onClick={doAdd}
                className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm"
              >
                <Check size={14} />
              </button>
              <button
                onClick={() => setShowAdd(false)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-sm"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}
        {tableWrapper(
          ["Name", "Admission No.", "Class", "Gender", "DOB", "Actions"],
          data.students.slice(0, 50).map((s, i) => {
            const isEditing = editingId === s.id;
            return (
              <tr
                key={s.id}
                className={`${i % 2 === 0 ? (dark ? "bg-slate-800" : "bg-white") : dark ? "bg-slate-800/60" : "bg-slate-50/50"}`}
              >
                <td className="px-4 py-2.5">
                  {isEditing ? (
                    <input
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, name: e.target.value }))
                      }
                      className={`w-full px-2 py-1 rounded border text-xs ${dark ? "bg-slate-700 border-slate-600 text-white" : "border-slate-300"}`}
                    />
                  ) : (
                    s.name
                  )}
                </td>
                <td className="px-4 py-2.5">
                  {isEditing ? (
                    <input
                      value={editForm.admissionNumber}
                      onChange={(e) =>
                        setEditForm((f) => ({
                          ...f,
                          admissionNumber: e.target.value,
                        }))
                      }
                      className={`w-full px-2 py-1 rounded border text-xs ${dark ? "bg-slate-700 border-slate-600 text-white" : "border-slate-300"}`}
                    />
                  ) : (
                    s.admissionNumber
                  )}
                </td>
                <td className="px-4 py-2.5">
                  {isEditing ? (
                    <select
                      value={editForm.classId}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, classId: e.target.value }))
                      }
                      className={`w-full px-2 py-1 rounded border text-xs ${dark ? "bg-slate-700 border-slate-600 text-white" : "border-slate-300"}`}
                    >
                      <option value="">– Select –</option>
                      {data.classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    data.classes.find((c) => c.id === s.classId)?.name || "–"
                  )}
                </td>
                <td className="px-4 py-2.5">
                  {isEditing ? (
                    <select
                      value={editForm.gender}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, gender: e.target.value }))
                      }
                      className={`w-full px-2 py-1 rounded border text-xs ${dark ? "bg-slate-700 border-slate-600 text-white" : "border-slate-300"}`}
                    >
                      <option value="M">Male</option>
                      <option value="F">Female</option>
                    </select>
                  ) : s.gender === "M" ? (
                    "Male"
                  ) : (
                    "Female"
                  )}
                </td>
                <td className="px-4 py-2.5">
                  {isEditing ? (
                    <input
                      type="date"
                      value={editForm.dateOfBirth}
                      onChange={(e) =>
                        setEditForm((f) => ({
                          ...f,
                          dateOfBirth: e.target.value,
                        }))
                      }
                      className={`w-full px-2 py-1 rounded border text-xs ${dark ? "bg-slate-700 border-slate-600 text-white" : "border-slate-300"}`}
                    />
                  ) : (
                    s.dateOfBirth
                  )}
                </td>
                <td className="px-4 py-2.5">
                  {isEditing ? (
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => doEdit(s)}
                        className="p-1.5 rounded bg-green-100 text-green-700"
                      >
                        <Check size={13} />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1.5 rounded bg-slate-200 text-slate-600"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ) : (
                    actionBtns(
                      s.id,
                      () => startEdit(s),
                      () =>
                        setConfirmDelete({
                          type: "student",
                          id: s.id,
                          name: s.name,
                        }),
                    )
                  )}
                </td>
              </tr>
            );
          }),
        )}
      </>
    );
  };

  // ── TEACHERS ──
  const TeachersTab = () => {
    const teachers = data.staff.filter((s) => s.role === "teacher");
    const startEdit = (t) => {
      setEditingId(t.id);
      setEditForm({
        name: t.name,
        username: t.username,
        subjects: t.subjects?.join(", ") || "",
        isClassTeacherOf: t.isClassTeacherOf || "",
      });
    };
    const doEdit = (t) => {
      updateStaff(t.id, (prev) => ({
        ...prev,
        name: editForm.name,
        username: editForm.username,
        subjects: editForm.subjects
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        isClassTeacherOf: editForm.isClassTeacherOf || null,
      }));
      setEditingId(null);
    };
    const doAdd = () => {
      addStaff({
        id: uid("staff"),
        ...addForm,
        role: "teacher",
        subjects:
          addForm.subjects
            ?.split(",")
            .map((s) => s.trim())
            .filter(Boolean) || [],
        isClassTeacherOf: addForm.isClassTeacherOf || null,
      });
      setShowAdd(false);
      setAddForm({});
    };
    return (
      <>
        <div className="flex justify-between items-center mb-4">
          <p
            className={`text-sm ${dark ? "text-slate-400" : "text-slate-500"}`}
          >
            {teachers.length} teachers
          </p>
          <button
            onClick={() => {
              setAddForm({
                name: "",
                username: "",
                password: "teacher123",
                subjects: "",
                isClassTeacherOf: "",
              });
              setShowAdd(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium"
          >
            <Plus size={15} /> Add Teacher
          </button>
        </div>
        {showAdd && (
          <div
            className={`rounded-xl border p-4 mb-4 grid grid-cols-2 gap-3 ${dark ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"}`}
          >
            <div className="col-span-2 font-semibold text-sm">
              Add New Teacher
            </div>
            {input("Full Name", "nm", addForm.name, (v) =>
              setAddForm((f) => ({ ...f, name: v })),
            )}
            {input("Username", "un", addForm.username, (v) =>
              setAddForm((f) => ({ ...f, username: v })),
            )}
            {input("Password", "pw", addForm.password, (v) =>
              setAddForm((f) => ({ ...f, password: v })),
            )}
            {input("Subjects (comma-separated)", "sj", addForm.subjects, (v) =>
              setAddForm((f) => ({ ...f, subjects: v })),
            )}
            {selectEl(
              "Class Teacher Of",
              "ct",
              addForm.isClassTeacherOf,
              (v) => setAddForm((f) => ({ ...f, isClassTeacherOf: v })),
              [
                { value: "", label: "None" },
                ...data.classes.map((c) => ({ value: c.id, label: c.name })),
              ],
            )}
            <div className="col-span-2 flex gap-2 justify-end">
              <button
                onClick={doAdd}
                className="px-4 py-1.5 bg-green-600 text-white rounded-lg text-sm"
              >
                <Check size={14} />
              </button>
              <button
                onClick={() => setShowAdd(false)}
                className="px-4 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-sm"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}
        {tableWrapper(
          ["Name", "Username", "Subjects", "Class Teacher", "Actions"],
          teachers.map((t, i) => {
            const isEditing = editingId === t.id;
            return (
              <tr
                key={t.id}
                className={`${i % 2 === 0 ? (dark ? "bg-slate-800" : "bg-white") : dark ? "bg-slate-800/60" : "bg-slate-50/50"}`}
              >
                <td className="px-4 py-2.5">
                  {isEditing ? (
                    <input
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, name: e.target.value }))
                      }
                      className={`w-full px-2 py-1 rounded border text-xs ${dark ? "bg-slate-700 border-slate-600 text-white" : "border-slate-300"}`}
                    />
                  ) : (
                    t.name
                  )}
                </td>
                <td className="px-4 py-2.5">
                  {isEditing ? (
                    <input
                      value={editForm.username}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, username: e.target.value }))
                      }
                      className={`w-full px-2 py-1 rounded border text-xs ${dark ? "bg-slate-700 border-slate-600 text-white" : "border-slate-300"}`}
                    />
                  ) : (
                    t.username
                  )}
                </td>
                <td className="px-4 py-2.5">
                  {isEditing ? (
                    <input
                      value={editForm.subjects}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, subjects: e.target.value }))
                      }
                      className={`w-full px-2 py-1 rounded border text-xs ${dark ? "bg-slate-700 border-slate-600 text-white" : "border-slate-300"}`}
                    />
                  ) : (
                    t.subjects?.join(", ")
                  )}
                </td>
                <td className="px-4 py-2.5">
                  {isEditing ? (
                    <select
                      value={editForm.isClassTeacherOf}
                      onChange={(e) =>
                        setEditForm((f) => ({
                          ...f,
                          isClassTeacherOf: e.target.value,
                        }))
                      }
                      className={`w-full px-2 py-1 rounded border text-xs ${dark ? "bg-slate-700 border-slate-600 text-white" : "border-slate-300"}`}
                    >
                      <option value="">None</option>
                      {data.classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    data.classes.find((c) => c.id === t.isClassTeacherOf)
                      ?.name || "–"
                  )}
                </td>
                <td className="px-4 py-2.5">
                  {isEditing ? (
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => doEdit(t)}
                        className="p-1.5 rounded bg-green-100 text-green-700"
                      >
                        <Check size={13} />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1.5 rounded bg-slate-200 text-slate-600"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ) : (
                    actionBtns(
                      t.id,
                      () => startEdit(t),
                      () =>
                        setConfirmDelete({
                          type: "staff",
                          id: t.id,
                          name: t.name,
                        }),
                    )
                  )}
                </td>
              </tr>
            );
          }),
        )}
      </>
    );
  };

  // ── PARENTS ──
  const ParentsTab = () => {
    const startEdit = (p) => {
      setEditingId(p.id);
      setEditForm({
        name: p.name,
        username: p.username,
        studentIds: p.studentIds ? [...p.studentIds] : [], // array for multi-select
      });
    };
    const doEdit = (p) => {
      updateParent(p.id, (prev) => ({
        ...prev,
        name: editForm.name,
        username: editForm.username,
        studentIds: editForm.studentIds,
      }));
      setEditingId(null);
    };
    return (
      <>
        <div className="flex justify-between items-center mb-4">
          <p
            className={`text-sm ${dark ? "text-slate-400" : "text-slate-500"}`}
          >
            {data.parents.length} parents
          </p>
        </div>
        {tableWrapper(
          ["Name", "Username", "Linked Students", "Actions"],
          data.parents.map((p, i) => {
            const isEditing = editingId === p.id;
            const linkedStudents = data.students.filter((s) =>
              p.studentIds?.includes(s.id),
            );
            return (
              <tr
                key={p.id}
                className={`${i % 2 === 0 ? (dark ? "bg-slate-800" : "bg-white") : dark ? "bg-slate-800/60" : "bg-slate-50/50"}`}
              >
                <td className="px-4 py-2.5">
                  {isEditing ? (
                    <input
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, name: e.target.value }))
                      }
                      className={`w-full px-2 py-1 rounded border text-xs ${dark ? "bg-slate-700 border-slate-600 text-white" : "border-slate-300"}`}
                    />
                  ) : (
                    p.name
                  )}
                </td>
                <td className="px-4 py-2.5">
                  {isEditing ? (
                    <input
                      value={editForm.username}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, username: e.target.value }))
                      }
                      className={`w-full px-2 py-1 rounded border text-xs ${dark ? "bg-slate-700 border-slate-600 text-white" : "border-slate-300"}`}
                    />
                  ) : (
                    p.username
                  )}
                </td>
                <td className="px-4 py-2.5">
                  {isEditing ? (
                    <select
                      multiple
                      value={editForm.studentIds}
                      onChange={(e) => {
                        const selected = Array.from(
                          e.target.selectedOptions,
                          (o) => o.value,
                        );
                        setEditForm((f) => ({ ...f, studentIds: selected }));
                      }}
                      className={`w-full px-2 py-1 rounded border text-xs ${dark ? "bg-slate-700 border-slate-600 text-white" : "border-slate-300"}`}
                      size={3}
                    >
                      {data.students.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    linkedStudents.map((k) => k.name).join(", ") || "–"
                  )}
                </td>
                <td className="px-4 py-2.5">
                  {isEditing ? (
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => doEdit(p)}
                        className="p-1.5 rounded bg-green-100 text-green-700"
                      >
                        <Check size={13} />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1.5 rounded bg-slate-200 text-slate-600"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ) : (
                    actionBtns(
                      p.id,
                      () => startEdit(p),
                      () =>
                        setConfirmDelete({
                          type: "parent",
                          id: p.id,
                          name: p.name,
                        }),
                    )
                  )}
                </td>
              </tr>
            );
          }),
        )}
      </>
    );
  };

  const doDelete = () => {
    if (!confirmDelete) return;
    if (confirmDelete.type === "student") deleteStudent(confirmDelete.id);
    if (confirmDelete.type === "staff") deleteStaff(confirmDelete.id);
    if (confirmDelete.type === "parent") deleteParent(confirmDelete.id);
    setConfirmDelete(null);
  };

  return (
    <div className="space-y-5">
      <h2
        className={`text-xl font-bold ${dark ? "text-white" : "text-slate-800"}`}
      >
        Manage Users
      </h2>
      <div
        className={`border-b ${dark ? "border-slate-700" : "border-slate-200"} flex gap-4`}
      >
        <Tab
          label="Students"
          active={activeTab === "students"}
          onClick={() => setActiveTab("students")}
        />
        <Tab
          label="Teachers"
          active={activeTab === "teachers"}
          onClick={() => setActiveTab("teachers")}
        />
        <Tab
          label="Parents"
          active={activeTab === "parents"}
          onClick={() => setActiveTab("parents")}
        />
      </div>
      {activeTab === "students" && <StudentsTab />}
      {activeTab === "teachers" && <TeachersTab />}
      {activeTab === "parents" && <ParentsTab />}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div
            className={`rounded-xl shadow-2xl w-full max-w-sm p-6 ${dark ? "bg-slate-800 text-white" : "bg-white text-slate-800"}`}
          >
            <h3 className="font-bold text-lg mb-2">Confirm Delete</h3>
            <p className="text-sm text-slate-500 mb-4">
              Delete <strong>{confirmDelete.name}</strong>? This cannot be
              undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={doDelete}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium"
              >
                Delete
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                className={`flex-1 py-2 rounded-lg text-sm ${dark ? "bg-slate-700" : "bg-slate-200"}`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
