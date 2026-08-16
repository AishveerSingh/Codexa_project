# Coding Platform Starter

This repo is a clean starting point for building a coding platform inspired by CodeTantra using:

- `frontend`: React + Vite
- `backend`: Node.js + Express
- `database`: PostgreSQL via the `pg` driver

## Project Structure

```text
.
|-- backend
|   |-- src
|   `-- .env.example
|-- frontend
|   |-- src
|   `-- .env.example
`-- package.json
```

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Create environment files:

```bash
copy backend\\.env.example backend\\.env
copy frontend\\.env.example frontend\\.env
```

3. Update PostgreSQL credentials in `backend/.env`.

4. Create the database and optional starter tables from [backend/src/database/schema.sql](/c:/Users/HP/OneDrive/Desktop/coding%20Platform/backend/src/database/schema.sql:1).

5. Run the app:

```bash
npm run dev
```

## Default URLs

- Frontend: `http://localhost:5173`
- Backend: `https://codexa-project.onrender.com`
- Health API: `https://codexa-project.onrender.com/api/health`

## Suggested Next Features

- Authentication for students, instructors, and admins
- Coding problem model with test cases
- Code execution service via isolated workers/containers
- Submissions, grading, and plagiarism checks
- Classroom/course and assignment modules
- Realtime proctoring and timed assessments

