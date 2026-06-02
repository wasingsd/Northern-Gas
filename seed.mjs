import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  datasourceUrl: 'file:./dev.db',
});

async function main() {
  const hashedPassword = await bcrypt.hash('Admin9999', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'pluypt@gmail.com' },
    update: {
      password: hashedPassword,
    },
    create: {
      email: 'pluypt@gmail.com',
      name: 'Admin',
      password: hashedPassword,
      role: 'OWNER',
    },
  });

  console.log('Seeded User:', user.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
