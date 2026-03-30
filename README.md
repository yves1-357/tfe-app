# TFE Route App

Application fullstack avec Next.js (frontend) et FastAPI (backend).

## Structure du projet

```
tfe-route-app/
├── backend/     # API FastAPI (Python)
├── frontend/    # Application Next.js (React/TypeScript)
```

## Installation

### Backend (FastAPI)
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

### Frontend (Next.js)
```bash
cd frontend
npm install
```

## Démarrage

### Backend
```bash
cd backend
venv\Scripts\activate
uvicorn main:app --reload
```
L'API sera disponible sur http://localhost:8000

### Frontend
```bash
cd frontend
npm run dev
```
L'application sera disponible sur http://localhost:3000

## Développement

- **Backend**: FastAPI + Python
- **Frontend**: Next.js + React + TypeScript + Tailwind CSS
