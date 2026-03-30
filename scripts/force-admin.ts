import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

// Load .env explicitly
dotenv.config({ path: path.join(__dirname, '.env') });

const prisma = new PrismaClient();

async function main() {
  const email = 'euddy.ejcp@gmail.com';
  console.log(`Buscando usuarios con email: ${email}...`);
  
  const users = await prisma.user.findMany({
    where: { email }
  });

  if (users.length === 0) {
    console.log('No se encontraron usuarios con ese email.');
    return;
  }

  console.log(`Encontrados ${users.length} usuarios.`);
  
  for (const user of users) {
    console.log(`Actualizando ID: ${user.id} (Rol actual: ${user.role})...`);
    await prisma.user.update({
      where: { id: user.id },
      data: { role: 'ADMIN' }
    });
  }

  console.log('¡Actualización completada!');
  
  const updatedUsers = await prisma.user.findMany({
    where: { email }
  });
  console.table(updatedUsers);
}

main()
  .catch((e) => {
    console.error('Error corriendo el script:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
