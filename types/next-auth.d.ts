import { Role } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      branchId: string | null;
      name?: string | null;
      email?: string | null;
    };
  }

  interface User {
    role: Role;
    branchId?: string | null;
  }
}
