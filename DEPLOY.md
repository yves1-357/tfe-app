# DEPLOY.md — Procédure de déploiement NextStop

Architecture de production :
```
Vercel (Next.js frontend)  →  Render (FastAPI backend)  →  Supabase (PostgreSQL)
```

---

## Étape A — Préparer le repo GitHub

```bash
git add .
git commit -m "chore: prep for deployment"
git push origin main
```

---

## Étape B — Frontend sur Vercel

1. https://vercel.com → login GitHub → "Add New Project"
2. Sélectionner le repo `tfe-route-app`
3. **Root Directory** : `frontend/`
4. Framework : Next.js (auto-détecté)
5. Variables d'env à configurer sur Vercel :
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` = clé Google frontend
   - `NEXT_PUBLIC_API_URL` = URL Render (à ajouter après l'étape E)
6. Deploy → noter l'URL (ex: `https://tfe-route-app.vercel.app`)
7. Restreindre la clé Google frontend au domaine Vercel :
   `https://tfe-route-app.vercel.app/*`

---

## Étape C — Base de données sur Supabase

1. https://supabase.com → New project → region : Frankfurt
2. Settings → Database → **Connection string → URI** → copier
3. La connection string ressemble à :
   `postgresql+psycopg2://postgres.<project>:<password>@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`
4. Garder cette valeur comme `DATABASE_URL` pour les étapes D et E

---

## Étape D — Migrations Alembic vers la DB de prod

```powershell
cd backend
$env:DATABASE_URL = "postgresql+psycopg2://postgres.xxx:password@aws-...supabase.com:6543/postgres"
.\venv\Scripts\python.exe -m alembic upgrade head
```

Vérifier dans Supabase → Table Editor que les tables `users` et `saved_routes` existent.

---

## Étape E — Backend sur Render

1. https://render.com → login GitHub → "New Web Service"
2. Sélectionner le repo `tfe-route-app`
3. **Root Directory** : `backend/`
4. Build command : `pip install -r requirements.txt`
5. Start command : `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Variables d'env à configurer sur Render :
   - `DATABASE_URL` = connection string Supabase
   - `GOOGLE_MAPS_API_KEY` = clé Google backend
   - `JWT_SECRET` = string aléatoire longue (`openssl rand -hex 32`)
   - `FRONTEND_ORIGIN` = `https://tfe-route-app.vercel.app`
7. Deploy → noter l'URL (ex: `https://tfe-route-app-api.onrender.com`)
8. Tester : `https://tfe-route-app-api.onrender.com/docs` → Swagger doit s'afficher

---

## Étape F — Câbler Vercel ↔ Render

1. Vercel → Settings → Environment Variables
2. Mettre à jour `NEXT_PUBLIC_API_URL` = `https://tfe-route-app-api.onrender.com`
3. Redeploy le frontend (Deployments → Redeploy)
4. Test E2E en navigation privée : register → login → optimize

---

## Variables d'environnement — récapitulatif

| Service | Variable | Valeur |
|---|---|---|
| Vercel | `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Clé Google frontend |
| Vercel | `NEXT_PUBLIC_API_URL` | URL Render |
| Render | `DATABASE_URL` | Connection string Supabase |
| Render | `GOOGLE_MAPS_API_KEY` | Clé Google backend |
| Render | `JWT_SECRET` | Secret JWT (32+ chars) |
| Render | `FRONTEND_ORIGIN` | URL Vercel |

---

## Notes importantes

- **Cold start Render** : le free tier s'endort après 15 min. Le premier appel prend ~30s.
  → Solution : appel automatique à `/health` au mount de la page principale.
- **CORS** : `FRONTEND_ORIGIN` doit correspondre exactement à l'URL Vercel (sans trailing slash).
- **Alembic vs create_all** : en prod, Alembic gère les migrations. `create_all()` dans `main.py` est désactivé en prod via la variable `DATABASE_URL` qui pointe vers Supabase.
- **Icônes PWA** : générer `icon-192.png` et `icon-512.png` depuis `frontend/public/icons/icon.svg` avant le déploiement final.

---

## Rollback

```powershell
# Annuler la dernière migration
cd backend
$env:DATABASE_URL = "..."
.\venv\Scripts\python.exe -m alembic downgrade -1
```
