import app from './app';
import { env } from './config/env';
import { prisma } from './lib/prisma';

const startServer = async () => {
  try {
    // Verify database connection before starting
    await prisma.$connect();
    console.log('✅ Conectado a la base de datos PostgreSQL');

    app.listen(env.PORT, '0.0.0.0', () => {
      console.log(`
╔════════════════════════════════════════╗
║    🌴  DominicanGo API - Iniciado     ║
╠════════════════════════════════════════╣
║  Entorno   : ${env.NODE_ENV.padEnd(25)}║
║  Puerto    : ${String(env.PORT).padEnd(25)}║
║  Frontend  : ${env.FRONTEND_URL.padEnd(25)}║
╚════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Cerrando el servidor...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
