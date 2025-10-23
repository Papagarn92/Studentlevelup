import React, { useState } from 'react';
import TeacherDashboard from './components/TeacherDashboard';
import StudentProfile from './components/StudentProfile';

export default function App() {
  const [view, setView] = useState('teacher'); // 'teacher' | 'student'
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  return (
    <div className="container">
      <header>
        <h1>Student Level Up</h1>
        <div>
          <button onClick={() => setView('teacher')} style={{ marginRight: 8 }}>Teacher</button>
          <button onClick={() => setView('student')}>Student</button>
        </div>
      </header>

      {view === 'teacher' && <TeacherDashboard onViewStudent={(id) => { setSelectedStudentId(id); setView('student'); }} />}
      {view === 'student' && <StudentProfile studentId={selectedStudentId} />}
    </div>
  );
}