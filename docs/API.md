# API Reference

- `POST /api/auth/[...nextauth]`: NextAuth credential login.
- `GET /api/dashboard?type=...`: Super/Branch metrics (requires SUPER_ADMIN/BRANCH_MANAGER).
- `GET /api/invoices/search?q=`: Invoice search for staff roles with branch scope.
- `GET /api/invoices/[uuid]`: Invoice details accessible to branch and admin roles.
- `GET /api/partners/me?month=YYYY-MM`: Partner monthly share and settlements overview.
