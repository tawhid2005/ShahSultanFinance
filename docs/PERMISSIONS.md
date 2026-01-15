# Permissions

- `SUPER_ADMIN`: Full access; can manage branches, void records, view all dashboards and partners.
- `BRANCH_MANAGER`: Can view their branch dashboard, manage students, invoices, counters within branch scope.
- `ACCOUNTANT`: Can search invoices and manage payments in assigned branch context.
- `RECEPTION`: Can search students and invoices for branch.
- `PARTNER`: Read-only access to `/api/partners/me` and personal dashboard.

RBAC and branch scoping live in `lib/server/rbac.ts` and `lib/services/*`.
