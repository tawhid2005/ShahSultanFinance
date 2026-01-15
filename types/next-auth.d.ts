import { Role } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      branchId: string | null;
      partnerId?: string | null;
      name?: string | null;
      email?: string | null;
    };
  }

  interface User {
    role: Role;
    branchId?: string | null;
    partnerId?: string | null;
  }
}
