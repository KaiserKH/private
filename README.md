# Kaizu Chats

Private scalable real-time messaging platform with a modular admin, permission, audit, and socket architecture.

## Stack

- Frontend: React, Vite, Tailwind CSS, Framer Motion, React Router, Socket.io Client, Axios, Zustand
- Backend: Node.js, Express, Socket.io, Prisma ORM
- Database: MySQL
- Auth: JWT access and refresh tokens, HTTP-only cookies, bcrypt

## Structure

- `server/` API, sockets, Prisma schema, and admin services
- `client/` React application and UI

## Local Setup

1. Install dependencies in the root and workspace packages.
2. Configure `server/.env`.
3. Run Prisma migrate and generate the client.
4. Start the backend and frontend dev servers.

## Environment

Create `server/.env` with the variables documented in `server/.env.example`.

## Notes

The codebase is organized to support future expansion for groups, stories, channels, mobile apps, and stronger encryption without changing the core architecture.
# private
# private
