import { useState } from "react";
import { useData } from "../contexts/DataContext";
import { Save, Plus, Trash2, SendHorizontal } from "lucide-react";
import { AFFECTIVE_TRAITS } from "../config/mockData";

// ─── Optional status watermark (unchanged) ───────────────────────────────
function StatusStamp({ status, isProprietorCopy }) {
  const base =
    "absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-35deg] border-[3px] text-5xl font-black tracking-[0.2em] px-6 py-3 opacity-25 pointer-events-none select-none uppercase rounded-sm";
  if (isProprietorCopy && status !== "approved")
    return (
      <div
        className={`${base} border-orange-400 text-orange-400 shadow-[0_0_20px_rgba(251,146,60,0.3)] whitespace-nowrap`}
      >
        PROPRIETOR COPY
      </div>
    );
  if (status === "approved")
    return (
      <div
        className={`${base} border-emerald-500 text-emerald-600 shadow-[0_0_25px_rgba(16,185,129,0.3)]`}
      >
        APPROVED
      </div>
    );
  if (status === "pending" || status === "draft")
    return (
      <div
        className={`${base} border-amber-400 text-amber-500 shadow-[0_0_20px_rgba(251,191,36,0.3)]`}
      >
        DRAFT
      </div>
    );
  if (status === "rejected")
    return (
      <div
        className={`${base} border-rose-500 text-rose-600 shadow-[0_0_20px_rgba(244,96,125,0.3)]`}
      >
        REJECTED
      </div>
    );
  return null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────
function calcGrade(total) {
  if (total >= 70) return "A";
  if (total >= 60) return "B";
  if (total >= 50) return "C";
  if (total >= 45) return "D";
  if (total >= 40) return "E";
  return "F";
}
function gradeRemark(grade) {
  return (
    {
      A: "Excellent",
      B: "Very Good",
      C: "Good",
      D: "Credit",
      E: "Pass",
      F: "Weak",
    }[grade] || "Average"
  );
}
function emptySubject() {
  return {
    name: "",
    teacherId: null,
    ca1: 0,
    ca2: 0,
    exam: 0,
    total: 0,
    grade: "F",
    remark: "Weak",
  };
}
function NumCell({ value, onChange, max }) {
  return (
    <input
      type="number"
      value={value}
      min={0}
      max={max}
      onChange={(e) => onChange(e.target.value)}
      className="w-12 text-center border border-indigo-300 rounded px-1 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white text-gray-800 font-normal"
    />
  );
}

function getSubjectRank(studentId, termId, subjectName, data, currentClassId) {
  const classStudents = data.students.filter(
    (s) => s.classId === currentClassId,
  );
  const studentScores = classStudents
    .map((s) => {
      const term = s.terms.find((t) => t.id === termId);
      if (!term) return { studentId: s.id, score: -1 };
      const subject = term.subjects.find((sub) => sub.name === subjectName);
      return { studentId: s.id, score: subject ? subject.total : -1 };
    })
    .filter((s) => s.score !== -1 && s.score !== null); // ignore blank subjects
  studentScores.sort((a, b) => b.score - a.score);
  const position =
    studentScores.findIndex((s) => s.studentId === studentId) + 1;
  return position > 0 ? position : "-";
}

export default function ReportCard({
  studentId,
  termId,
  isProprietorCopy = false,
  onPrint,
  editable = false,
  canEditPrincipalRemark = false,
  onSubmitForApproval,
  showStatusStamp = false,
}) {
  const { data, updateStudentTerm } = useData();

  const [editedSubjects, setEditedSubjects] = useState(null);
  const [editedTeacherRemark, setEditedTeacherRemark] = useState(null);
  const [editedPrincipalRemark, setEditedPrincipalRemark] = useState(null);
  const [editedAffective, setEditedAffective] = useState(null);
  const [editedPsychomotor, setEditedPsychomotor] = useState(null);
  const [editedAttendance, setEditedAttendance] = useState(null);
  const [saved, setSaved] = useState(false);

  if (!data) return null;
  const student = data.students.find((s) => s.id === studentId);
  if (!student) return <p className="text-red-500 p-4">Student not found.</p>;
  const termRecord = student.terms.find((t) => t.id === termId);
  if (!termRecord)
    return <p className="text-red-500 p-4">Term record not found.</p>;
  const cls = data.classes.find((c) => c.id === student.classId);

  const SCHOOL_OPENED_FIXED = 120;
  const att = termRecord.attendance || [];
  const editedAtt = editedAttendance || {};
  const daysPresent =
    editedAtt.daysPresent !== undefined
      ? editedAtt.daysPresent
      : att.filter((d) => d.status === "present").length;
  const daysAbsent =
    editedAtt.daysAbsent !== undefined
      ? editedAtt.daysAbsent
      : att.filter((d) => d.status === "absent").length;
  const attPct =
    SCHOOL_OPENED_FIXED > 0
      ? ((daysPresent / SCHOOL_OPENED_FIXED) * 100).toFixed(1)
      : "0.0";

  const subjects = editedSubjects ?? termRecord.subjects ?? [];
  const teacherRemark = editedTeacherRemark ?? termRecord.teacherRemark ?? "";
  const principalRemark =
    editedPrincipalRemark ?? termRecord.principalRemark ?? "";

  const storedAffective = termRecord.affectiveTraits || {};
  const defaultAffective = Object.fromEntries(
    AFFECTIVE_TRAITS.map((t) => [t, 3]),
  );
  const affectiveScores = editedAffective ?? {
    ...defaultAffective,
    ...storedAffective,
  };

  // Only scored subjects count towards totals
  const scoredSubjects = subjects.filter(
    (s) => s.ca1 !== null && s.ca1 !== undefined,
  );
  const totalScore = scoredSubjects.reduce((s, x) => s + (x.total || 0), 0);
  const totalObtainable = scoredSubjects.length * 100;
  const percentTotal =
    totalObtainable > 0
      ? ((totalScore / totalObtainable) * 100).toFixed(1)
      : "0.0";
  const overallGrade = calcGrade(parseFloat(percentTotal));

  const gradeCounts = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };
  scoredSubjects.forEach((sub) => {
    if (sub.grade) gradeCounts[sub.grade] = (gradeCounts[sub.grade] || 0) + 1;
  });

  const nextTermDates = {
    "First Term": "10th January 2026",
    "Second Term": "21st April 2026",
    "Third Term": "15th September 2026",
  };
  const today = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const isApproved = termRecord.status === "approved";
  const canEditScores = editable && !isApproved;
  const canEditPrincipal = canEditPrincipalRemark;

  const isDirty =
    editedSubjects !== null ||
    editedTeacherRemark !== null ||
    editedPrincipalRemark !== null ||
    editedAffective !== null ||
    editedPsychomotor !== null ||
    editedAttendance !== null;

  // ─── Mutation helpers ──────────────────────────────────────────────────
  function recomputeSubject(s) {
    const total = (s.ca1 || 0) + (s.ca2 || 0) + (s.exam || 0);
    const grade = calcGrade(total);
    return { ...s, total, grade, remark: gradeRemark(grade) };
  }

  function updateSubjectField(idx, field, rawVal) {
    const max = field === "exam" ? 60 : field === "name" ? undefined : 20;
    const val =
      field === "name"
        ? rawVal
        : Math.min(max, Math.max(0, parseInt(rawVal) || 0));
    const base = editedSubjects ?? termRecord.subjects;
    setEditedSubjects(
      base.map((s, i) =>
        i !== idx ? s : recomputeSubject({ ...s, [field]: val }),
      ),
    );
  }

  function addSubject() {
    setEditedSubjects([
      ...(editedSubjects ?? termRecord.subjects),
      emptySubject(),
    ]);
  }
  function removeSubject(idx) {
    setEditedSubjects(
      (editedSubjects ?? termRecord.subjects).filter((_, i) => i !== idx),
    );
  }

  function updateAffectiveTrait(trait, val) {
    setEditedAffective((prev) => ({
      ...(prev ?? affectiveScores),
      [trait]: val,
    }));
  }
 

  function saveEdits() {
    updateStudentTerm(studentId, termId, (t) => ({
      ...t,
      subjects: editedSubjects ?? t.subjects,
      teacherRemark: editedTeacherRemark ?? t.teacherRemark,
      principalRemark: editedPrincipalRemark ?? t.principalRemark,
      affectiveTraits: editedAffective ?? t.affectiveTraits,
      psychomotorTraits: editedPsychomotor ?? t.psychomotorTraits,
    }));
    setEditedSubjects(null);
    setEditedTeacherRemark(null);
    setEditedPrincipalRemark(null);
    setEditedAffective(null);
    setEditedPsychomotor(null);
    setEditedAttendance(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  // ─── Render ────────────────────────────────────────────────────────────
  return (
    <div className="report-card-wrapper">
      {/* Save bar */}
      {isDirty && (
        <div className="no-print flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 mb-3 gap-4">
          <span className="text-sm text-amber-700 font-medium">
            Unsaved changes on this report
          </span>
          <div className="flex items-center gap-3">
            {saved && (
              <span className="text-emerald-600 text-sm font-medium">
                Saved!
              </span>
            )}
            <button
              onClick={saveEdits}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              <Save size={14} /> Save Draft
            </button>
            {onSubmitForApproval && (
              <button
                onClick={() => {
                  saveEdits();
                  onSubmitForApproval();
                }}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                <SendHorizontal size={14} /> Submit for Approval
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Report Card */}
      <div className="min-h-screen bg-gray-200 py-6 px-2 font-sans text-[11px] text-black">
        <div className="mx-auto max-w-5xl bg-white p-6 shadow-lg relative overflow-hidden">
          {showStatusStamp && (
            <StatusStamp
              status={termRecord.status}
              isProprietorCopy={isProprietorCopy}
            />
          )}

          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-indigo-200 pb-2 mb-2">
            <div className="h-16 w-16 rounded-full border-2 border-indigo-300 flex items-center justify-center text-[8px] text-indigo-700 font-bold text-center">
              LogoHere
            </div>
            <div className="text-center flex-1">
              <h1 className="text-3xl font-bold tracking-wide text-indigo-900">
                D'TITI MODEL COLLEGE
              </h1>
              <p className="text-[10px] mt-1">
                No 14 Davis Cole Crescent, PrimeVille Estate, Surulere, Kwara
                State.
              </p>
              <p className="text-[10px]">
                TEL: 1234567890, 0987654321; Email: dtitihub@gmail.com
              </p>
            </div>
            <div className="h-16 w-16" />
          </div>

          <h2 className="text-center font-bold text-sm bg-indigo-50 py-1 my-2 border border-indigo-200 rounded">
            {(termRecord.term || "").toUpperCase()} STUDENT'S PERFORMANCE REPORT
          </h2>

          {/* Student info */}
          <div className="flex gap-2 mb-4">
            <div className="flex-1 border border-indigo-200 rounded overflow-hidden">
              <table className="w-full">
                <tbody>
                  <Row
                    label="NAME:"
                    value={student.name}
                    label2="GENDER:"
                    value2={student.gender === "M" ? "Male" : "Female"}
                  />
                  <Row
                    label="CLASS:"
                    value={cls?.name || "-"}
                    label2="SESSION:"
                    value2={termRecord.session}
                    label3="ADMISSION NO:"
                    value3={student.admissionNumber}
                  />
                  <Row
                    label="D.O.B."
                    value={student.dateOfBirth}
                    label2="AGE:"
                    value2={student.age ? `${student.age}yrs` : "-"}
                    label3="HT:"
                    value3={student.height ? `${student.height} cm` : "-"}
                    label4="WT:"
                    value4={student.weight ? `${student.weight} kg` : "-"}
                  />
                  <Row
                    label="CLUB/SOCIETY:"
                    value={student.clubSociety || "-"}
                    label2="FAV. COL:"
                    value2={student.favColor || "-"}
                  />
                </tbody>
              </table>
            </div>
            <div className="w-28 h-32 border border-indigo-200 bg-indigo-50 flex items-center justify-center text-[9px] text-gray-500 rounded">
              PHOTO
            </div>
          </div>

          {/* Cognitive Domain + Right Column */}
          <div className="grid grid-cols-3 gap-2 mt-2">
            <div className="col-span-2 border border-indigo-200 rounded overflow-hidden">
              <table className="w-full border-collapse text-[10px]">
                <thead>
                  <tr className="bg-indigo-50">
                    <th
                      colSpan={9}
                      className="border border-indigo-200 p-1 font-bold text-indigo-900"
                    >
                      COGNITIVE DOMAIN
                    </th>
                  </tr>
                  <tr className="bg-indigo-100">
                    <th
                      rowSpan={2}
                      className="border border-indigo-200 p-1 text-left"
                    >
                      SUBJECTS
                    </th>
                    <th className="border border-indigo-200 p-1">C.A</th>
                    <th className="border border-indigo-200 p-1">EXAM</th>
                    <th className="border border-indigo-200 p-1">TOTAL</th>
                    <th className="border border-indigo-200 p-1">GRADE</th>
                    <th className="border border-indigo-200 p-1">POSITION</th>
                    <th rowSpan={2} className="border border-indigo-200 p-1">
                      REMARKS
                    </th>
                    <th rowSpan={2} className="border border-indigo-200 p-1">
                      CLASS AVG
                    </th>
                    {canEditScores && (
                      <th
                        rowSpan={2}
                        className="border border-indigo-200 p-1 no-print"
                      ></th>
                    )}
                  </tr>
                  <tr className="bg-indigo-100">
                    <th className="border border-indigo-200 p-1">40</th>
                    <th className="border border-indigo-200 p-1">60</th>
                    <th className="border border-indigo-200 p-1">100</th>
                    <th className="border border-indigo-200 p-1"></th>
                    <th className="border border-indigo-200 p-1"></th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((subj, i) => {
                    const isBlank = subj.ca1 === null || subj.ca1 === undefined;
                    const classScore = isBlank
                      ? null
                      : (subj.ca1 || 0) + (subj.ca2 || 0);
                    const rank = isBlank
                      ? "-"
                      : getSubjectRank(
                          studentId,
                          termId,
                          subj.name,
                          data,
                          student.classId,
                        );
                    return (
                      <tr
                        key={i}
                        className={i % 2 === 0 ? "bg-white" : "bg-indigo-50/30"}
                      >
                        <td className="border border-indigo-200 p-1 text-left font-medium">
                          {canEditScores && !isBlank ? (
                            <input
                              type="text"
                              value={subj.name}
                              onChange={(e) =>
                                updateSubjectField(i, "name", e.target.value)
                              }
                              className="w-full border border-indigo-200 rounded px-1 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-white"
                            />
                          ) : (
                            subj.name
                          )}
                        </td>
                        <td className="border border-indigo-200 p-1 text-center">
                          {isBlank ? (
                            ""
                          ) : canEditScores ? (
                            <div className="flex gap-1 justify-center">
                              <NumCell
                                value={subj.ca1}
                                onChange={(v) =>
                                  updateSubjectField(i, "ca1", v)
                                }
                                max={20}
                              />
                              <span className="text-gray-400">+</span>
                              <NumCell
                                value={subj.ca2}
                                onChange={(v) =>
                                  updateSubjectField(i, "ca2", v)
                                }
                                max={20}
                              />
                            </div>
                          ) : (
                            classScore
                          )}
                        </td>
                        <td className="border border-indigo-200 p-1 text-center">
                          {isBlank ? (
                            ""
                          ) : canEditScores ? (
                            <NumCell
                              value={subj.exam}
                              onChange={(v) => updateSubjectField(i, "exam", v)}
                              max={60}
                            />
                          ) : (
                            subj.exam
                          )}
                        </td>
                        <td className="border border-indigo-200 p-1 text-center font-bold text-indigo-800">
                          {isBlank ? "" : subj.total}
                        </td>
                        <td className="border border-indigo-200 p-1 text-center font-bold">
                          {isBlank ? (
                            ""
                          ) : (
                            <span
                              className={
                                subj.grade === "A"
                                  ? "text-emerald-600"
                                  : subj.grade === "B"
                                    ? "text-blue-600"
                                    : subj.grade === "C"
                                      ? "text-yellow-600"
                                      : subj.grade === "D"
                                        ? "text-orange-600"
                                        : subj.grade === "E"
                                          ? "text-amber-600"
                                          : "text-red-600"
                              }
                            >
                              {subj.grade}
                            </span>
                          )}
                        </td>
                        <td className="border border-indigo-200 p-1 text-center">
                          {isBlank ? "" : rank}
                        </td>
                        <td className="border border-indigo-200 p-1 text-center text-xs">
                          {isBlank ? "" : subj.remark}
                        </td>
                        <td className="border border-indigo-200 p-1 text-center text-xs">
                          {isBlank ? "" : "-"}
                        </td>
                        {canEditScores && (
                          <td className="border border-indigo-200 p-1 text-center no-print">
                            {!isBlank && (
                              <button
                                onClick={() => removeSubject(i)}
                                className="p-1 rounded text-red-400 hover:text-red-600 hover:bg-red-50"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                  {canEditScores && (
                    <tr className="no-print">
                      <td
                        colSpan={9}
                        className="border border-indigo-200 p-2 bg-indigo-50/30"
                      >
                        <button
                          onClick={addSubject}
                          className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                        >
                          <Plus size={13} /> Add Subject
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Right column: Attendance, Affective, Psychomotor, Indices */}
            <div className="space-y-2">
              <div className="border border-indigo-200 rounded overflow-hidden">
                <p className="text-center font-bold bg-indigo-50 border-b border-indigo-200 p-1 text-xs">
                  ATTENDANCE SUMMARY
                </p>
                <table className="w-full text-[10px]">
                  <tbody>
                    <tr>
                      <td className="border border-indigo-200 p-1">
                        No of Times School Opened
                      </td>
                      <td className="border border-indigo-200 p-1 text-center">
                        {SCHOOL_OPENED_FIXED}
                      </td>
                      <td className="border border-indigo-200 p-1"></td>
                    </tr>
                    <tr>
                      <td className="border border-indigo-200 p-1">
                        No of Times Present
                      </td>
                      <td className="border border-indigo-200 p-1 text-center">
                        {canEditScores ? (
                          <input
                            type="number"
                            value={daysPresent}
                            min={0}
                            max={SCHOOL_OPENED_FIXED}
                            onChange={(e) =>
                              setEditedAttendance((prev) => ({
                                ...(prev ?? {}),
                                daysPresent: parseInt(e.target.value) || 0,
                              }))
                            }
                            className="w-12 text-center border border-indigo-300 rounded px-1 py-0.5 text-xs"
                          />
                        ) : (
                          daysPresent
                        )}
                      </td>
                      <td className="border border-indigo-200 p-1 text-xs">
                        ({attPct}%)
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-indigo-200 p-1">
                        No of Times Absent
                      </td>
                      <td className="border border-indigo-200 p-1 text-center">
                        {canEditScores ? (
                          <input
                            type="number"
                            value={daysAbsent}
                            min={0}
                            max={SCHOOL_OPENED_FIXED}
                            onChange={(e) =>
                              setEditedAttendance((prev) => ({
                                ...(prev ?? {}),
                                daysAbsent: parseInt(e.target.value) || 0,
                              }))
                            }
                            className="w-12 text-center border border-indigo-300 rounded px-1 py-0.5 text-xs"
                          />
                        ) : (
                          daysAbsent
                        )}
                      </td>
                      <td className="border border-indigo-200 p-1"></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <RatingCheckboxTable
                title="AFFECTIVE DOMAIN"
                traits={AFFECTIVE_TRAITS}
                scores={affectiveScores}
                editable={canEditScores}
                onChange={updateAffectiveTrait}
              />
            </div>
          </div>

          {/* Performance Summary & Grade Analysis */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="border border-indigo-200 rounded overflow-hidden">
              <p className="text-center font-bold bg-indigo-50 border-b border-indigo-200 p-1">
                PERFORMANCE SUMMARY
              </p>
              <table className="w-full text-[10px]">
                <tbody>
                  <tr>
                    <td className="border border-indigo-200 p-1">
                      Total Obtained:
                    </td>
                    <td className="border border-indigo-200 p-1 text-center">
                      {totalScore}
                    </td>
                    <td className="border border-indigo-200 p-1 text-center">
                      %TAGE
                    </td>
                    <td className="border border-indigo-200 p-1 text-center font-bold">
                      {percentTotal}%
                    </td>
                    <td
                      rowSpan={2}
                      className="border border-indigo-200 p-1 text-center font-bold text-base"
                    >
                      {gradeRemark(overallGrade).toUpperCase()}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-indigo-200 p-1">
                      Total Obtainable:
                    </td>
                    <td className="border border-indigo-200 p-1 text-center">
                      {totalObtainable}
                    </td>
                    <td className="border border-indigo-200 p-1 text-center">
                      GRADE
                    </td>
                    <td className="border border-indigo-200 p-1 text-center font-bold">
                      {overallGrade}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="border border-indigo-200 rounded overflow-hidden">
              <p className="text-center font-bold bg-indigo-50 border-b border-indigo-200 p-1">
                GRADE ANALYSIS
              </p>
              <table className="w-full text-[10px]">
                <tbody>
                  <tr>
                    <td className="border border-indigo-200 p-1 font-bold">
                      GRADE
                    </td>
                    {["A", "B", "C", "D", "E", "F"].map((g) => (
                      <td
                        key={g}
                        className="border border-indigo-200 p-1 text-center"
                      >
                        {g}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="border border-indigo-200 p-1 font-bold">
                      NO
                    </td>
                    {["A", "B", "C", "D", "E", "F"].map((g) => (
                      <td
                        key={g}
                        className="border border-indigo-200 p-1 text-center"
                      >
                        {gradeCounts[g] || 0}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td
                      colSpan={6}
                      className="border border-indigo-200 p-1 font-bold"
                    >
                      TOTAL SUBJECTS OFFERED
                    </td>
                    <td className="border border-indigo-200 p-1 text-center font-bold">
                      {scoredSubjects.length}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Grade Scale */}
          <div className="border border-indigo-200 mt-2 rounded overflow-hidden">
            <p className="text-center font-bold bg-indigo-50 border-b border-indigo-200 p-1">
              GRADE SCALE
            </p>
            <p className="p-2 text-center text-xs">
              70-100%=A(EXCELLENT) <b>||</b> 60-69.9%=B(VERY GOOD) <b>||</b>{" "}
              50-59.9%=C(GOOD) <b>||</b> 
              45-49.9%=D(CREDIT) <b>||</b> 40-44.9%=E(PASS) 0-39.9%=F(WEAK)
            </p>
          </div>

          {/* Remarks */}
          <div className="mt-3 space-y-2">
            <div>
              <p className="font-bold">Teacher's Remark:</p>
              {canEditScores ? (
                <textarea
                  value={teacherRemark}
                  onChange={(e) => setEditedTeacherRemark(e.target.value)}
                  rows={2}
                  className="w-full border border-indigo-200 rounded p-2 text-sm italic focus:outline-none focus:ring-1 focus:ring-indigo-400 resize-none"
                />
              ) : (
                <p className="italic text-center">{teacherRemark || "–"}</p>
              )}
              <div className="flex justify-between border-t border-indigo-200 pt-1 mt-1 text-xs">
                <p>
                  Teacher's Name:{" "}
                  <span className="font-bold ml-2">MR ADIGUN TIMILEYIN</span>
                </p>
                <p>Sign:</p>
              </div>
            </div>
            <div>
              <p className="font-bold">Principal's Remark:</p>
              {canEditPrincipal ? (
                <textarea
                  value={principalRemark}
                  onChange={(e) => setEditedPrincipalRemark(e.target.value)}
                  rows={2}
                  className="w-full border border-indigo-200 rounded p-2 text-sm italic focus:outline-none focus:ring-1 focus:ring-indigo-400 resize-none"
                />
              ) : (
                <p className="italic text-center">{principalRemark || "–"}</p>
              )}
              <div className="flex justify-between border-t border-indigo-200 pt-1 mt-1 text-xs">
                <p>
                  Principal's Name:{" "}
                  <span className="font-bold ml-2">MR OWOLABI BADMOS</span>
                </p>
                <p>Sign:</p>
              </div>
            </div>
            <div className="flex justify-between pt-2 text-xs">
              <p>
                Next Term Begins:{" "}
                <span className="font-bold ml-2">
                  {nextTermDates[termRecord.term] || "-"}
                </span>
              </p>
              <p>
                Date: <span className="font-bold ml-2">{today}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {onPrint && (
        <div className="flex justify-center mt-4 no-print">
          <button
            onClick={onPrint}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
          >
            Print Report Card
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Helper components ────────────────────────────────────────────────────
function Row({ label, value, label2, value2, label3, value3, label4, value4 }) {
  return (
    <tr>
      <td className="border border-indigo-200 p-1 font-bold">{label}</td>
      <td className="border border-indigo-200 p-1">{value}</td>
      {label2 && (
        <>
          <td className="border border-indigo-200 p-1 font-bold">{label2}</td>
          <td className="border border-indigo-200 p-1">{value2}</td>
        </>
      )}
      {label3 && (
        <>
          <td className="border border-indigo-200 p-1 font-bold">{label3}</td>
          <td className="border border-indigo-200 p-1">{value3}</td>
        </>
      )}
      {label4 && (
        <>
          <td className="border border-indigo-200 p-1 font-bold">{label4}</td>
          <td className="border border-indigo-200 p-1">{value4}</td>
        </>
      )}
    </tr>
  );
}

function RatingCheckboxTable({ title, traits, scores, editable, onChange }) {
  return (
    <div className="border border-indigo-200 rounded overflow-hidden">
      <table className="w-full text-[10px]">
        <thead>
          <tr className="bg-indigo-50">
            <th className="border border-indigo-200 p-1 text-left text-xs">
              {title}
            </th>
            {[5, 4, 3, 2, 1].map((n) => (
              <th
                key={n}
                className="border border-indigo-200 p-1 w-5 text-center"
              >
                {n}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {traits.map((trait, i) => (
            <tr
              key={trait}
              className={i % 2 === 0 ? "bg-white" : "bg-indigo-50/20"}
            >
              <td className="border border-indigo-200 p-1">{trait}</td>
              {[5, 4, 3, 2, 1].map((n) => (
                <td
                  key={n}
                  className={`border border-indigo-200 p-1 text-center ${editable ? "cursor-pointer hover:bg-indigo-100" : ""}`}
                  onClick={() => {
                    if (editable) onChange(trait, n);
                  }}
                >
                  {scores[trait] === n ? "✓" : ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
