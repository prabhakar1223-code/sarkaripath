<<<<<<< HEAD
# Sarkari Path

A React and Node.js MVP that helps students explore government exam paths based on their age, completed education, career interests, work preferences, and study routine.

## Run locally

```powershell
npm install
npm run dev
```

Open the Vite URL shown in the terminal (usually `http://localhost:5173`). The Node API runs on port `3001`; Vite proxies `/api` requests to it.

## Production

```powershell
npm run build
$env:NODE_ENV = "production"
npm start
```

The server serves the built React app and API from port `3001`. Set `PORT` to change the server port.

## API

- `GET /api/health` — service health
- `GET /api/exams` — exam catalogue
- `POST /api/recommendations` — ranked profile-fit recommendations

The recommendation score is a transparent, rule-based profile fit—not a probability of passing, a validated prediction, or a guarantee of eligibility. Exam criteria and external resource pages may change; verify the latest official notification before applying.

The MVP does not store submitted profiles. It asks only about comfort with roles that may have physical or medical standards and does not request medical diagnoses or health details.

## Checks

```powershell
npm test
npm run build
```
=======
# sarkaripath
>>>>>>> 388d2012efe81123894b683e750183b2877a3557
