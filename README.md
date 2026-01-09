# FindX

This repository contains:

- `backend/`: Node/Express API
- `frontend/`: React app

## Local Development

### Backend

1. Create `backend/.env` (copy from `backend/.env.example`).
2. Install and run:

```bash
cd backend
npm install
npm run dev
```

Backend runs on `http://localhost:5000` (health: `GET /api/health`).

### Frontend

1. Create `frontend/.env` (copy from `frontend/.env.example`).
2. Install and run:

```bash
cd frontend
npm install
npm start
```

## Production / Deployment (Railway)

This repo includes a root `Dockerfile` that:

- Builds the React frontend
- Installs backend dependencies
- Runs the backend, which serves the React build in production

### Required Environment Variables (Railway)

Set these in Railway (Project → Variables):

- `NODE_ENV=production`
- `JWT_SECRET` (required in production)
- `JWT_EXPIRE` (optional, default `7d`)
- MongoDB connection string (recommended; in production the server will exit if it cannot connect). The backend supports:
  - `MONGODB_URI`
  - `MONGODB_URL`
  - `MONGO_URL` (commonly provided by Railway MongoDB plugin)

Railway will provide `PORT` automatically.

### Deploy Steps (Railway)

1. Push this repository to GitHub.
2. On Railway: New Project → Deploy from GitHub Repo.
3. Add a MongoDB plugin (or provide your own MongoDB). If using Railway MongoDB plugin, it will typically provide `MONGO_URL` automatically.
4. Set `JWT_SECRET`.
5. Deploy.

## Notes

- Uploads are stored under `backend/uploads/` and are gitignored. On Railway containers, local disk is ephemeral; for persistent uploads consider using object storage (S3-compatible) or a media service (e.g. Cloudinary).
