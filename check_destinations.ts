import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const total = await prisma.destination.count();
    const published = await prisma.destination.count({ where: { status: 'PUBLISHED' } });
    const all = await prisma.destination.findMany({ 
        where: { status: 'PUBLISHED' },
        select: { name: true, type: true, provinceId: true }
    });
    
    console.log('Total Destinations:', total);
    console.log('Published Destinations:', published);
    console.log('Data:', JSON.stringify(all, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
