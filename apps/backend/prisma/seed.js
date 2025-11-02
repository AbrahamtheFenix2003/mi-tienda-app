import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Verificar si ya existe un usuario administrador
  const existingAdmin = await prisma.user.findFirst({
    where: { role: 'SUPER_ADMIN' },
  });

  if (existingAdmin) {
    console.log('✅ Ya existe un usuario SUPER_ADMIN. Seed completado.');
    return;
  }

  // Crear usuario administrador por defecto
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@mitienda.com',
      password: hashedPassword,
      name: 'Administrador',
      role: 'SUPER_ADMIN',
    },
  });

  console.log('✅ Usuario administrador creado:');
  console.log('   Email: admin@mitienda.com');
  console.log('   Password: admin123');
  console.log('   Role: SUPER_ADMIN');
  console.log('');
  console.log('⚠️  IMPORTANTE: Cambia la contraseña después del primer login!');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
