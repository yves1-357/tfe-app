# NextStop App

Application fullstack avec Next.js (frontend) et FastAPI (backend).

## Structure du projet

```
tfe-route-app/
├── backend/     # API FastAPI (Python)
├── frontend/    # Application Next.js (React/TypeScript)
├── start-dev.ps1   # Script de démarrage unifié
└── package.json    # Configuration globale
```

## Installation 

### Backend (FastAPI)
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
cd ..
```

### Frontend (Next.js)
```bash
cd frontend
npm install
cd ..
```

## Démarrage rapide - Une Seule commande

Depuis la racine du projet :

### Option 1 - Via npm
```bash
npm run dev
```

### Option 2 - Via PowerShell directement
```bash
.\start-dev.ps1
```

Cette commande lance automatiquement :
- Backend FastAPI sur http://localhost:8000
- Frontend Next.js sur http://localhost:3000

Pour arrêter : `Ctrl+C`

## URLs de l'application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Documentation API**: http://localhost:8000/docs

## Développement

- **Backend**: FastAPI + Python
- **Frontend**: Next.js + React + TypeScript + Tailwind CSS
