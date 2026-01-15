import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const dir = join("app", "api", "auth", "[...nextauth]");
mkdirSync(dir, { recursive: true });

writeFileSync(
  join(dir, "route.ts"),
  `import { authOptions } from "@/lib/auth/options";
import NextAuth from "next-auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
`,
);
