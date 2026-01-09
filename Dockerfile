# syntax=docker/dockerfile:1

FROM node:18-slim AS frontend-build
WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build


FROM node:18-slim AS backend-deps
WORKDIR /app/backend

COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev


FROM node:18-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production

COPY --from=backend-deps /app/backend/node_modules ./backend/node_modules
COPY backend/ ./backend/

COPY --from=frontend-build /app/frontend/build ./frontend/build

RUN mkdir -p ./backend/uploads/avatars

EXPOSE 5000

CMD ["node", "backend/server.js"]
