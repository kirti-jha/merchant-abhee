import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding admin user only...');

  const adminEmail = 'admin@telering.com';
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existingAdmin) {
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    const createdAdmin = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: adminPasswordHash,
        roles: {
          create: { role: 'admin' }
        },
        profile: {
          create: {
            fullName: 'Admin User',
            businessName: 'Telering Admin',
            status: 'active',
            isMasterAdmin: true
          }
        },
        wallet: {
          create: { balance: 0 }
        }
      }
    });
    console.log(`Created admin user: ${createdAdmin.email} (${createdAdmin.id})`);
  } else {
    console.log(`Admin user ${adminEmail} already exists, skipping.`);
  }

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
