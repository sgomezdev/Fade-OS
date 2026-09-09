import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const { count } = await prisma.producto.deleteMany();
  console.log(`✓ Se eliminaron ${count} producto(s) del inventario.`);
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });