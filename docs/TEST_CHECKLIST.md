# Test Checklist

1. Run `npm run lint`.
2. Run `npx prisma migrate dev --name init` against local Postgres.
3. Run `npm run seed` and verify admin user.
4. Access `/login`, sign-in as SUPER_ADMIN and confirm dashboard fetch.
5. Query `/api/dashboard` with branch-scoped token as BRANCH_MANAGER.
6. Create invoice via services (unit test helper) and confirm `/api/invoices/[uuid]` returns data.
7. Fetch `/api/partners/me` as PARTNER and check share calculations.
8. Void a record (hooked via audit logs) and ensure reports exclude it.
