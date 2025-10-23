import React, { useEffect, useState } from 'react';
import { loadStudents, loadGrades, saveStudents } from '../utils/storage';
import { gradeToTier, getItemsForTier } from '../utils/tiers';
import { v4 as uuidv4 } from 'uuid';

export default function StudentProfile({ studentId: propStudentId }) {
  const [students, setStudents] = useState(loadStudents());
  const [grades, setGrades] = useState(loadGrades());
  const [selectedId, setSelectedId] = useState(propStudentId || (students[0] && students[0].id) || '');
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    setStudents(loadStudents());
    setGrades(loadGrades());
  }, []);

  useEffect(() => {
    if (propStudentId) setSelectedId(propStudentId);
  }, [propStudentId]);

  useEffect(() => {
    if (selectedId) loadProfile(selectedId);
    else setProfile(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, grades, students]);

  function loadProfile(id) {
    const student = students.find(s => s.id === id);
    if (!student) { setProfile(null); return; }
    const myGrades = grades.filter(g => g.studentId === id);
    const avg = myGrades.length ? Math.round(myGrades.reduce((a,b)=>a+b.normalized,0)/myGrades.length) : null;
    const tier = gradeToTier(avg);
    const items = getItemsForTier(tier);
    setProfile({ student, gradeAverage: avg, tier, items, inventory: student.inventory || [] });
  }

  function awardItem(name) {
    const studentsList = [...students];
    const student = studentsList.find(s => s.id === selectedId);
    if (!student) return;
    const entry = { id: uuidv4(), itemId: uuidv4(), name: name || 'Teacher Award', obtainedAt: new Date().toISOString(), source: 'teacher' };
    student.inventory = student.inventory || [];
    student.inventory.push(entry);
    saveStudents(studentsList);
    setStudents(studentsList);
    loadProfile(selectedId);
  }

  return (
    <div>
      <h2>Student Profile</h2>

      <div style={{ marginBottom: 12 }}>
        <select value={selectedId} onChange={e => setSelectedId(e.target.value)}>
          <option value="">-- select student --</option>
          {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {!profile && <div className="card">Select a student to view their profile.</div>}

      {profile && (
        <div className="card">
          <h3>{profile.student.name}</h3>
          <div>Grade average: {profile.gradeAverage ?? 'No grades yet'}</div>
          <div>Tier: <strong>{profile.tier}</strong></div>

          <div style={{ marginTop: 12 }}>
            <strong>Equipped:</strong>
            <ul>
              {profile.items.map(it => <li key={it.id}>{it.name} ({it.rarity})</li>)}
            </ul>
          </div>

          <div style={{ marginTop: 12 }}>
            <strong>Inventory:</strong>
            <ul>
              {(profile.inventory || []).map(inv => <li key={inv.id}>{inv.name} — {new Date(inv.obtainedAt).toLocaleString()}</li>)}
              {(!profile.inventory || profile.inventory.length === 0) && <li>No items</li>}
            </ul>
            <div style={{ marginTop: 8 }}>
              <button onClick={() => awardItem('Nice Work Sticker')}>Award "Nice Work Sticker"</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}