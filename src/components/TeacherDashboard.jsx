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
      // Ensure students exist and create grades entries (match by name)
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
        <p><small>Paste a GitHub blob/raw file URL of a CSV or JSON file. CSV should have headers: student/name, assignment, score, outOf (optional), date (optional).</small></p>
        <form onSubmit={importFromGitHub}>
          <input style={{ width: '70%' }} placeholder="https://github.com/owner/repo/blob/branch/path/file.csv" value={importUrl} onChange={e => setImportUrl(e.target.value)} />
          <button style={{ marginLeft: 8 }} type="submit">Import</button>
        </form>
        <div style={{ marginTop: 8 }}>{status}</div>
      </section>

      <section className="card">
        <h2>Manual grade entry</h2>
        <form onSubmit={addGrade}>
          <select value={gradeForm.studentId} onChange={e => setGradeForm({...gradeForm, studentId: e.target.value})}>
            <option value="">-- select student --</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <input type="number" placeholder="score" value={gradeForm.score} onChange={e => setGradeForm({...gradeForm, score: e.target.value})} style={{ marginLeft: 8, width: 100 }} />
          <input type="number" placeholder="out of" value={gradeForm.outOf} onChange={e => setGradeForm({...gradeForm, outOf: e.target.value})} style={{ marginLeft: 8, width: 100 }} />
          <button type="submit" style={{ marginLeft: 8 }}>Add Grade</button>
        </form>
      </section>

      <section className="card">
        <h2>Students</h2>
        <ul>
          {students.map(s => (
            <li key={s.id} style={{ marginBottom: 6 }}>
              <strong>{s.name}</strong>
              <button style={{ marginLeft: 8 }} onClick={() => onViewStudent(s.id)}>View profile</button>
            </li>
          ))}
        </ul>
      </section>

      <div style={{ marginTop: 12 }}>
        <button onClick={clearData} style={{ background:'#ffecec', borderColor:'#f5c2c2' }}>Clear all data</button>
      </div>
    </div>
  );
}