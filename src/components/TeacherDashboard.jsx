import React, { useEffect, useState } from 'react';
import { loadStudents, saveStudents, loadGrades, saveGrades } from '../utils/storage';
import { fetchGradesFromGitHubLink } from '../utils/githubFetch';
import { v4 as uuidv4 } from 'uuid';

export default function TeacherDashboard({ onViewStudent }) {
  const [students, setStudents] = useState(loadStudents());
  const [grades, setGrades] = useState(loadGrades());
  const [name, setName] = useState('');
  const [gradeForm, setGradeForm] = useState({ studentId: '', score: '', outOf: 100 });
  const [importUrl, setImportUrl] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => { saveStudents(students); }, [students]);
  useEffect(() => { saveGrades(grades); }, [grades]);

  function createStudent(e) {
    e.preventDefault();
    if (!name) return;
    const s = { id: uuidv4(), name: name.trim(), createdAt: new Date().toISOString(), inventory: [] };
    setStudents(prev => { const next = [...prev, s]; return next; });
    setName('');
  }

  function addGrade(e) {
    e.preventDefault();
    if (!gradeForm.studentId || gradeForm.score === '') return;
    const g = {
      id: uuidv4(),
      studentId: gradeForm.studentId,
      assignmentId: gradeForm.assignmentId ?? null,
      score: Number(gradeForm.score),
      outOf: Number(gradeForm.outOf || 100),
      normalized: Math.max(0, Math.min(100, (Number(gradeForm.score) / Number(gradeForm.outOf || 100)) * 100)),
      date: new Date().toISOString()
    };
    setGrades(prev => [...prev, g]);
    setGradeForm({ studentId: '', score: '', outOf: 100 });
    alert('Grade added');
  }

  async function importFromGitHub(e) {
    e.preventDefault();
    if (!importUrl) return;
    setStatus('Importing...');
    try {
      const imported = await fetchGradesFromGitHubLink(importUrl);
      const currentStudents = [...students];
      const newGrades = [...grades];
      for (const row of imported) {
        let student = currentStudents.find(s => s.name.toLowerCase() === row.student.toLowerCase());
        if (!student) {
          student = { id: uuidv4(), name: row.student, createdAt: new Date().toISOString(), inventory: [] };
          currentStudents.push(student);
        }
        newGrades.push({
          id: uuidv4(),
          studentId: student.id,
          assignmentId: row.assignment ?? null,
          score: Number(row.score),
          outOf: Number(row.outOf || 100),
          normalized: Number(row.normalized ?? Math.max(0, Math.min(100, (row.score / (row.outOf || 100)) * 100))),
          date: row.date ?? new Date().toISOString()
        });
      }
      setStudents(currentStudents);
      setGrades(newGrades);
      setStatus(`Imported ${imported.length} rows.`);
      setImportUrl('');
    } catch (err) {
      console.error(err);
      setStatus('Import failed: ' + (err.message || err));
    }
  }

  function clearData() {
    if (!confirm('Clear all students and grades from local storage?')) return;
    setStudents([]);
    setGrades([]);
    localStorage.clear();
  }

  return (
    <div>
      <section className="card">
        <h2>Create student</h2>
        <form onSubmit={createStudent}>
          <input placeholder="Student name" value={name} onChange={e => setName(e.target.value)} />
          <button type="submit" style={{ marginLeft: 8 }}>Create</button>
        </form>
      </section>

      <section className="card">
        <h2>Import grades from GitHub</h2>
        
      </section>
    </div>
  );
}