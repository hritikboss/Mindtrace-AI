# MindTrace AI Frontend — Integrated Package

This package contains the React + Vite frontend with the existing MindTrace UI retained and the backend integration paths wired into the frontend.

## Included
- Email/password login and signup aligned with the backend `LoginRequest(email, password)` and `SignupRequest(username, email, password)` DTOs.
- JWT token attached to protected API requests.
- Dashboard analytics, progress summary and gamification points API calls.
- Courses API integration with existing UI fallback.
- AI Tutor request aligned to `{ question, topic, learnerLevel }`.
- Progress and concept mastery views backed by user APIs.
- Concept Galaxy loads concepts and mastery when those APIs return data.
- Quiz Center flow: courses → modules → lessons → quizzes → questions → submit. A passed quiz attempts to mark lesson progress complete.
- Responsive mobile bottom navigation.

## Setup
1. Extract the ZIP.
2. Open a terminal in `MindTrace-AI/frontend`.
3. Keep your existing `.env` file. If you need a template, copy `.env.example` to `.env` and set `VITE_API_BASE_URL` to the current backend URL. Do not include `/swagger-ui/index.html` in the base URL.
4. Install packages with `npm install` if needed.
5. Start the frontend with `npm run dev`.

## Important
- The backend must be running and reachable. If using ngrok, keep the tunnel process running and update `VITE_API_BASE_URL` if the URL changes. Restart Vite after changing `.env`.
- The frontend is aligned to the backend controller/DTO source supplied for this integration, but it has not been verified against a live running backend or database in this package.
- The Quiz Center requires existing course, module, lesson, quiz and question records in the backend.
- Do not commit `.env`, database credentials, JWT signing secrets, or AI provider keys. Those belong on the backend only.
- This ZIP intentionally excludes `.env`, `node_modules`, and build output. Use `npm install` on the target computer.
