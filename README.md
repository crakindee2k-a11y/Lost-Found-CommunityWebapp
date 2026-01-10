# FindX

FindX is a full-stack lost & found community web app where users can post lost/found items, communicate securely, and recover items faster.

## Features

- User authentication (JWT)
- Create, browse, and filter lost/found posts
- Comments and messaging
- Location support with maps
- User profiles and avatar upload
- Verification workflow and admin moderation tools

## Tech Stack

- Frontend: React, React Router, Axios, Leaflet
- Backend: Node.js, Express, MongoDB (Mongoose)

## Local Setup

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm start
```

## Environment Variables

Backend (`backend/.env`):

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/findx
JWT_SECRET=change-me
JWT_EXPIRE=7d
```

Mongo connection env fallbacks supported by the backend:

- `MONGODB_URI`
- `MONGODB_URL`
- `MONGO_URL`

Frontend (`frontend/.env`):

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_APP_NAME=FindX
```

## Deployment

This repository includes a root `Dockerfile` for production. In production, the backend serves the built React frontend.

Railway (recommended):

1. Deploy from GitHub
2. Add Railway MongoDB plugin
3. Set `NODE_ENV=production` and `JWT_SECRET`
4. Deploy

Optional demo data (admin, demo user, demo posts):

- Set `SEED_DEMO=true`
- Optional overrides:
  - `SEED_ADMIN_EMAIL` (default `admin@gmail.com`)
  - `SEED_ADMIN_PASSWORD` (default `password123`)
  - `SEED_USER_EMAIL` (default `demo@gmail.com`)
  - `SEED_USER_PASSWORD` (default `password123`)
  - `SEED_RESET_PASSWORDS=true` (reset passwords on existing seeded users)

## Live Demo

- Deployed link: https://deens-lost-found-communitywebapp-production.up.railway.app/

### Demo Accounts
- Admin: `admin@gmail.com` / `password123`
- User: `user1@gmail.com` / `password123`

> These are public demo credentials. Rotate or disable them for production use.

## License

MIT
