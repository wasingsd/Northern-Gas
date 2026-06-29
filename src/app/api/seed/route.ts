import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

import prisma from "@/lib/prisma";

export async function GET() {
  try {
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

    return NextResponse.json({ message: 'Seeded User', email: user.email });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
