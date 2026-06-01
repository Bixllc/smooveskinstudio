/**
 * Creates a Smoove Skin Studio admin account in Supabase Auth.
 *
 * Prerequisites:
 *   - NEXT_PUBLIC_SUPABASE_URL in .env.local
 *   - SUPABASE_SERVICE_ROLE_KEY in .env.local  (Project Settings → API → service_role)
 *   - DATABASE_URL in .env.local
 *   - Run `npx prisma db seed` first so the Smoove client exists
 *
 * Usage:
 *   npx tsx scripts/create-smoove-admin.ts <email> <password>
 *
 * Example:
 *   npx tsx scripts/create-smoove-admin.ts anisha@smooveskinstudio.com MySecurePass123
 */

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.error(
      "Usage: npx tsx scripts/create-smoove-admin.ts <email> <password>"
    );
    process.exit(1);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
    );
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
  });

  try {
    // Find Smoove client
    const client = await prisma.client.findUnique({
      where: { slug: "smooveskinstudio" },
    });

    if (!client) {
      console.error(
        'Smoove client not found. Run `npx prisma db seed` first.'
      );
      process.exit(1);
    }

    console.log(`Found Smoove client: ${client.id}`);

    // Create Supabase auth user with clientId in metadata
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { clientId: client.id },
    });

    if (error) {
      console.error("Failed to create user:", error.message);
      process.exit(1);
    }

    console.log(`\n✅ Admin account created successfully!`);
    console.log(`   User ID:  ${data.user?.id}`);
    console.log(`   Email:    ${email}`);
    console.log(`   clientId: ${client.id}`);
    console.log(`\nYou can now log in at /admin/login`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
