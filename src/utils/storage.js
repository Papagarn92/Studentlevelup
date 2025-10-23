const K_STUDENTS = 'slup_students_v1';
const K_GRADES = 'slup_grades_v1';

export function loadStudents() {
  try { return JSON.parse(localStorage.getItem(K_STUDENTS) || '[]'); } catch { return []; }
}
export function saveStudents(students) {
  localStorage.setItem(K_STUDENTS, JSON.stringify(students || []));
}

export function loadGrades() {
  try { return JSON.parse(localStorage.getItem(K_GRADES) || '[]'); } catch { return []; }
}
export function saveGrades(grades) {
  localStorage.setItem(K_GRADES, JSON.stringify(grades || []));
}

export function clearAll() {
  localStorage.removeItem(K_STUDENTS);
  localStorage.removeItem(K_GRADES);
}