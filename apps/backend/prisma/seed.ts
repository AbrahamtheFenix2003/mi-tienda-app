import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // --- Función Helper para crear usuarios ---
  const createUser = async (email: string, password: string, name: string, role: Role) => {
    const existingUser = await prisma.user.findFirst({
      where: { email },
    });

    if (existingUser) {
      console.log(`✅ El usuario ${email} (${role}) ya existe. Saltando creación.`);
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: { email, password: hashedPassword, name, role },
    });

    console.log(`✅ Usuario ${role} creado:`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log('');
  };

  // --- Crear usuarios para cada rol ---
  await createUser('admin@mitienda.com', 'admin123', 'Administrador', 'SUPER_ADMIN');
  await createUser('super.vendedor@mitienda.com', 'vendedor123', 'Super Vendedor', 'SUPER_VENDEDOR');
  await createUser('vendedor@mitienda.com', 'vendedor123', 'Vendedor', 'VENDEDOR');

  console.log('⚠️  IMPORTANTE: Cambia las contraseñas después del primer login!');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
