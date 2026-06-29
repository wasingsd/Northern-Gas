import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  console.log("Fetching users from Supabase Auth...");
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) throw error;

  for (const user of data.users) {
    const exists = await prisma.user.findFirst({
      where: {
        OR: [
          { email: user.email },
          { supabaseId: user.id }
        ]
      }
    });

    if (exists) {
      console.log('Updating ' + user.email);
      await prisma.user.update({
        where: { id: exists.id },
        data: { supabaseId: user.id }
      });
    } else {
      console.log('Creating ' + user.email);
      await prisma.user.create({
        data: {
          email: user.email,
          name: user.email.split('@')[0],
          supabaseId: user.id,
          role: 'OWNER'
        }
      });
    }
  }
  console.log('Sync complete!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
