# EduReports NG

A comprehensive school report management system built with React. Designed for Nigerian nursery, primary, and secondary schools, it enables teachers to enter scores, generates printable report cards, and provides role-based dashboards for admins, teachers, parents, and students.

==================================================
FEATURES
==================================================

• Multi-role Authentication
Admins, teachers, parents, and students can log in.
Teachers and parents require admin approval after registration.

• Teacher Grade Entry
Class teachers can enter CA1, CA2, and exam scores for their assigned class.
A live WYSIWYG preview of the final report card is shown while editing.

• Report Card Generation
Beautiful, printable A4 report cards that include:

- School information and logo placeholder
- Student bio-data
- Subject table with auto-calculated totals, grades, and remarks
- Grade key (A–F)
- Attendance summary
- Affective and psychomotor domain ratings
- Teacher’s and principal’s remarks
- Position in class and class average
- Diagonal status watermarks
  (Draft, Approved, Rejected, Proprietor Copy)

• Admin Management

- Dashboard with statistics
- Manage classes, subjects, staff, students, and parents
- Approve / reject pending term reports
- Approve / reject teacher and parent registrations
- Assign class teachers
- View and print any student’s report card

• Parent Dashboard
Parents can view children’s reports and academic progress.

• Student Dashboard
Students can view their own report cards.

• Persistent Storage
All data is saved in the browser localStorage.
No backend required — works fully offline after initial load.

• Dark Mode
Toggle between light and dark themes across the entire app.

• Responsive Design
Works on desktop and tablet screens.

==================================================
TECH STACK
==================================================

- React (Vite)
- React Router v6
- Tailwind CSS
- Recharts
- Lucide React
- localStorage
- date-fns (optional)

==================================================
INSTALLATION
==================================================

1. Clone the Repository

git clone https://github.com/Jayb-oy17/Reporta.git

2. Move into the Project Folder

cd Reporta

3. Install Dependencies

npm install

4. Start the Development Server

npm run dev

5. Open the App

Visit:
http://localhost:5173

The first run automatically generates seed data with demo accounts.

==================================================
DEMO CREDENTIALS
==================================================

The app comes with pre-loaded demo accounts for testing.

ROLE: Admin
USERNAME: admin
PASSWORD: admin123

ROLE: Vice Principal
USERNAME: vpadmin
PASSWORD: admin123

ROLE: Teacher
USERNAME: teacher1
PASSWORD: teacher123

ROLE: Teacher
USERNAME: teacher4
PASSWORD: teacher123

ROLE: Teacher
USERNAME: teacher10
PASSWORD: teacher123

ROLE: Parent
USERNAME: parent1
PASSWORD: parent123

ROLE: Parent
USERNAME: parent2
PASSWORD: parent123

ROLE: Student
USERNAME: Use Admission Number
PASSWORD: Date of Birth (YYYY-MM-DD)

Tip:
Check the admin panel to find a student’s admission number and DOB.

==================================================
FOLDER STRUCTURE
==================================================

src/
│
├── components/
│ Reusable UI components (ReportCard, etc.)
│
├── contexts/
│ Auth, Data, and Theme contexts
│
├── pages/
│
│ ├── admin/
│ │ AdminOverview
│ │ AdminClasses
│ │ AdminStudents
│ │ AdminStaff
│ │ AdminApprove
│ │
│ ├── teacher/
│ │ TeacherMyClass
│ │ TeacherGrades
│ │
│ ├── parent/
│ │ ParentDashboard
│ │
│ └── student/
│ StudentDashboard
│
├── App.jsx
│ Router configuration
│
├── main.jsx
│ Entry point
│
└── index.css
Tailwind directives and custom styles

==================================================
DATA MODEL
==================================================

The app stores all data in a single object inside localStorage.

Main collections include:

• staff
Admins and teachers
(teachers include an approved field)

• students
Student profiles including their terms array

• parents
Parent accounts
(includes approved field)

• classes
Nursery, Primary, JSS, and SSS classes

Each term inside a student contains:

• subjects
List of subjects with:

- CA1
- CA2
- Exam
- Total
- Grade
- Remark

• attendance
Daily attendance records

• affectiveTraits
Behaviour ratings

• psychomotorTraits
Skill ratings

• teacherRemark
Teacher comments

• principalRemark
Principal comments

• status
draft
pending
approved
rejected

==================================================
CUSTOMISATION
==================================================

• School Information
Edit the school name, logo placeholder, address, and motto in:

src/components/ReportCard.jsx

• Grading System
Modify calcGrade and gradeRemark functions in:

- ReportCard.jsx
- TeacherGrades.jsx

• Subjects
Subjects for each class category are defined in:

src/data/subjects.js

or inside generateSeedData.

• Adding a Backend
The app is currently fully frontend.

To add a backend such as:

- Firebase
- Express
- Supabase

Replace the DataContext with API calls while keeping the same context API.

==================================================
KNOWN ISSUES / FUTURE IMPROVEMENTS
==================================================

- Move subjects to a separate configuration file
- Add custom report card templates
- Implement export to PDF
- Add notification system
- Add student promotion / class advancement
- Implement proper password hashing
- Add email verification during signup

==================================================
LICENSE
==================================================

This project is intended for educational purposes.

You are free to use and modify it for your own school.

No warranty is provided.

==================================================
BUILT WITH ❤️ FOR NIGERIAN SCHOOLS
==================================================

## 👨‍💻 Developer

**Abdullateef Mujahid (Jipson)**

Front‑end web developer with 2+ years of experience building responsive, visually stunning web applications. Passionate about clean code, user experience, and cross‑platform compatibility.

- 🌐 **Portfolio:** [jipson‑port.vercel.app](https://jipson‑port.vercel.app/)
- 📧 **Email:** [ajiboladiekola16@gmail.com](mailto:ajiboladiekola16@gmail.com)
- 📍 **Location:** Ilorin, Nigeria
- 💼 **Freelance:** Available

### 🛠️ Skills
HTML · CSS · JavaScript (ES6+) · React · UI/UX Design · Responsive Web Design

### 🔗 Connect

| Platform | Link |
|----------|------|
| GitHub | [github.com/Jayb-oy17](https://github.com/Jayb-oy17) |
| LinkedIn | [linkedin.com/in/devjipson](https://www.linkedin.com/in/devjipson/) |
| X (Twitter) | [x.com/devJipson101](https://x.com/devJipson101) |
| Facebook | [facebook.com/dearcolar17](https://www.facebook.com/dearcolar17/) |
| Instagram | [instagram.com/dearcolar17](https://www.instagram.com/dearcolar17/) |
| TikTok | [tiktok.com/@jipson101](https://www.tiktok.com/@jipson101) |

---

**Built with ❤️ by Jipson**
