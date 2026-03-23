const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const dests = await prisma.destination.findMany({
    select: { id: true, name: true, status: true }
  });
  console.log(JSON.stringify(dests, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
