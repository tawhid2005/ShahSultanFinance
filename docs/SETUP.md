# Setup

1. Copy `.env.example` to `.env` and set `DATABASE_URL`, `SHADOW_DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `PRISMA_CLIENT_ENGINE_TYPE`.
2. Run `npm install`.
3. Run `npx prisma generate` and `npx prisma migrate dev --name init`.
4. Seed baseline data: `npm run seed`.
5. Start app with `npm run dev` (default port 3000).
6. Use `/login` for credential entry.
