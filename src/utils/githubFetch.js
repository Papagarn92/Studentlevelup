import Papa from 'papaparse';

/**
 * Convert a normal GitHub blob URL to a raw.githubusercontent.com URL.
 * If the input already looks like a raw URL, return as-is.
 */
export function toRawGitHubUrl(url) {
  try {
    const u = new URL(url.trim());
    if (u.hostname === 'raw.githubusercontent.com') return u.href;
    if (u.hostname === 'github.com') {
      // path: /owner/repo/blob/branch/path...
      const parts = u.pathname.split('/').filter(Boolean);
      if (parts.length >= 5 && parts[2] === 'blob') {
        const owner = parts[0], repo = parts[1], branch = parts[3];
        const path = parts.slice(4).join('/');
        return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
      }
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Fetches a file from GitHub raw URL (or converts a blob URL), then attempts to parse as CSV or JSON.
 * Returns array of grade objects with fields:
 *  - student (string)
 *  - assignment (string)
 *  - score (number)
 *  - outOf (number, optional)
 *  - date (ISO string, optional)
 */
export async function fetchGradesFromGitHubLink(givenUrl) {
  const raw = toRawGitHubUrl(givenUrl) ?? givenUrl;
  const res = await fetch(raw);
  if (!res.ok) throw new Error(`Failed to fetch ${raw}: ${res.status}`);
  const text = await res.text();
  // Try JSON first
  try {
    const j = JSON.parse(text);
    if (Array.isArray(j)) {
      return j.map(normalizeGradeObject).filter(Boolean);
    }
  } catch {
    // not JSON — try CSV
  }
  // CSV parse
  const parsed = Papa.parse(text, { header: true, skipEmptyLines: true, dynamicTyping: true });
  if (parsed && parsed.data && parsed.data.length) {
    return parsed.data.map(normalizeGradeObject).filter(Boolean);
  }
  throw new Error('Could not parse the file as JSON or CSV (no rows found).');
}

function normalizeGradeObject(raw) {
  // Accept multiple key names
  const student = raw.student ?? raw.name ?? raw.studentName ?? raw['Student'] ?? raw['Name'];
  const assignment = raw.assignment ?? raw.asst ?? raw.title ?? raw['Assignment'];
  let score = raw.score ?? raw.Score ?? raw.points ?? raw.pointsEarned;
  let outOf = raw.outOf ?? raw.out_of ?? raw['OutOf'] ?? raw.total ?? 100;
  const date = raw.date ?? raw.Date ?? raw.submitted ?? null;

  if (student == null || score == null) return null;
  score = Number(score);
  outOf = outOf == null ? 100 : Number(outOf);
  const normalized = Math.max(0, Math.min(100, (score / (outOf || 100)) * 100));
  return {
    student: String(student).trim(),
    assignment: assignment ? String(assignment).trim() : null,
    score,
    outOf,
    normalized,
    date: date ? new Date(date).toISOString() : new Date().toISOString()
  };
}