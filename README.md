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

- If you prefer to apply the SQL directly, there's a generated SQL file at the repository root (`schema.sql`). A copy is also kept at `server/prisma/schema.sql`. Import it into your MySQL server (for example using `mysql` CLI or a GUI):

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

## Performed Actions
- Added a root-level `schema.sql` export for MySQL setup and kept the Prisma copy in `server/prisma/schema.sql`.
- Installed project dependencies with `npm install` and generated the Prisma client with `npm run prisma:generate` in the server workspace.
- Pulled and started a local MySQL Docker container for development, then imported the schema into the `kaizu_chats` database.
- Created a local `server/.env` with development defaults and generated secrets for JWT, cookies, and CSRF.
- Updated `.gitignore` so local secrets like `server/.env` stay out of git.
- Verified the backend by starting the server and checking `GET /health` returned `{"success":true,"status":"ok"}`.
- Verified the frontend by starting the Vite dev server locally.
- Committed and pushed the repo updates to GitHub on `main`.

## What I Changed
- Added a root `schema.sql` file for easier MySQL database creation.
- Refreshed the Prisma SQL export in `server/prisma/schema.sql`.
- Updated the README setup steps and added this activity log.
- Kept local credentials and environment values out of version control.

## Commands & Actions I Ran (ordered)
Below are the exact commands I executed while preparing and verifying the project locally, with a short purpose for each.

- Check Docker is available:

```bash
docker --version
```

- Check MySQL client availability (may not be present in environment):

```bash
mysql --version
```

- Install workspace dependencies:

```bash
npm install
```

- Build server to surface TypeScript errors (first run failed; used to iterate fixes):

```bash
npm run build --workspace=server
```

- Build client (Vite + TypeScript):

```bash
npm run build --workspace=client
```

- Generate SQL export from Prisma datamodel (produces `schema.sql`):

```bash
# from /workspaces/private/server
npx prisma migrate diff --from-empty --to-schema-datamodel=prisma/schema.prisma --script > ../schema.sql
cp ../schema.sql prisma/schema.sql
```

- Generate strong secrets for local dev (example using OpenSSL):

```bash
ACCESS=$(openssl rand -hex 32)
REFRESH=$(openssl rand -hex 32)
COOKIE=$(openssl rand -hex 32)
CSRF=$(openssl rand -hex 32)
```

- Create local `server/.env` (edited with generated secrets):

```bash
cp server/.env.example server/.env
# edit server/.env and paste generated secrets
```

- Start a local MySQL container for development:

```bash
docker run -d --name kaizu-mysql -e MYSQL_ROOT_PASSWORD=password -e MYSQL_DATABASE=kaizu_chats -p 3306:3306 mysql:8.4
```

- Import the generated SQL schema into the running MySQL container:

```bash
# from repo root
docker exec -i kaizu-mysql mysql -uroot -ppassword kaizu_chats < schema.sql
```

- Generate Prisma client (inside `server`):

```bash
cd server
npx prisma generate
```

- Start the backend server (from repo root):

```bash
npm run start --workspace=server
```

- Start the client dev server (Vite):

```bash
npm run dev --workspace=client
```

- Quick health check (successful):

```bash
curl -s http://localhost:4000/health
# -> {"success":true,"status":"ok"}
```

If any of the commands above fail, check `server/.env` values and that the MySQL container is running.
