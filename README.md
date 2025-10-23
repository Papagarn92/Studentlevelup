```markdown
# Student Level Up — Client-only Webapp

This is a client-only React + Vite webapp that gamifies student grades by assigning gear tiers. It can import grade data from a GitHub file link (CSV or JSON) and stores data in the browser's localStorage.

## Prerequisites
- Node 18+ and npm

## Install & run
1. npm install
2. npm start
3. Open http://localhost:5173

## GitHub import
- Paste a GitHub blob URL like:
  https://github.com/owner/repo/blob/branch/path/grades.csv
  or a raw URL:
  https://raw.githubusercontent.com/owner/repo/branch/path/grades.csv
- Supported formats:
  - CSV with headers: student (or name), assignment, score, outOf (optional), date (optional)
  - JSON array of objects with similar fields
- Note: Private repositories will not be accessible from the browser.

## Persistence
- Students and grades are saved in localStorage (keys slup_students_v1 and slup_grades_v1).
- Clear data via the Teacher dashboard "Clear all data" button.

## Next improvements you can add
- Sync to a remote backend or GitHub repository for cross-device access.
- Authentication for teacher/student roles.
- CSV sample generator and validation UI.
- More advanced reward rules (improvement bonuses, badges).
```