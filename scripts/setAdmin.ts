import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'euddy.ejcp@gmail.com';
  
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });
  
  if (!existingUser) {
    console.log(`User with email ${email} not found.`);
    return;
  }
  
  const user = await prisma.user.update({
    where: { email },
    data: { role: 'ADMIN' },
  });
  
  console.log('Updated user role to ADMIN:', user);
}

main()
  .catch((e) => {
    console.error('Error in script', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
