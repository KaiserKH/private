# Kaizu Chats (local development)

This repository contains a full-stack chat application (server + client).

## Prerequisites
- Node.js 18+ and npm
- MySQL 8+ (or compatible) for the server database
- Optional: Docker (to run MySQL in a container)

## Quick start (development)

1. Install dependencies for workspace (root):

```bash
npm install
```

2. Create a `.env` file for the server. You can copy the example and edit values:

```bash
cp server/.env.example server/.env
# Then edit server/.env and set DATABASE_URL and JWT secrets
```

Example minimal `server/.env` values (replace with secure values):

```
DATABASE_URL=mysql://user:password@localhost:3306/kaizu_chats
JWT_ACCESS_SECRET=change_me_access
JWT_REFRESH_SECRET=change_me_refresh
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d
```

3. Generate Prisma client and prepare the database

- If you want Prisma to create the schema automatically and you have a running MySQL instance pointed by `DATABASE_URL`:

```bash
cd server
npx prisma generate
npx prisma migrate dev --name init
```

- If you prefer to apply the SQL directly, there's a generated SQL file at `server/prisma/schema.sql`. Import it into your MySQL server (for example using `mysql` CLI or a GUI):

```bash
# from project root
mysql -u root -p kaizu_chats < server/prisma/schema.sql
```

4. Start the server and client (concurrently)

From the repository root you can run both:

```bash
npm run dev
```

Or start individually:

```bash
# server
npm run dev --workspace=server

# client
npm run dev --workspace=client
```

5. Build for production

```bash
npm run build
```

6. Notes
- The server TypeScript config is relaxed (`strict` disabled) to ease local builds. If you want stricter checks, re-enable `strict` in `server/tsconfig.json` and fix type errors.
- Prisma schema is in `server/prisma/schema.prisma`. A generated SQL export is at `server/prisma/schema.sql` if you prefer native SQL.

If you run into issues, please open an issue or ask for help.
