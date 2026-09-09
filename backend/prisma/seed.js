import { PrismaClient } from "@prisma/client";
import dayjs from "dayjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Sembrando datos de ejemplo...");

  // Limpiar datos previos (orden importa por las relaciones)
  await prisma.movimiento.deleteMany();
  await prisma.sesionCaja.deleteMany();
  await prisma.categoria.deleteMany();
  await prisma.barbero.deleteMany();

  // Categorías
  const categorias = await Promise.all([
    prisma.categoria.create({ data: { nombre: "Corte", tipo: "INGRESO", color: "#3b82f6" } }),
    prisma.categoria.create({ data: { nombre: "Barba", tipo: "INGRESO", color: "#8b5cf6" } }),
    prisma.categoria.create({ data: { nombre: "Corte + Barba", tipo: "INGRESO", color: "#06b6d4" } }),
    prisma.categoria.create({ data: { nombre: "Productos", tipo: "INGRESO", color: "#10b981" } }),
    prisma.categoria.create({ data: { nombre: "Arriendo", tipo: "EGRESO", color: "#ef4444" } }),
    prisma.categoria.create({ data: { nombre: "Insumos", tipo: "EGRESO", color: "#f59e0b" } }),
    prisma.categoria.create({ data: { nombre: "Servicios", tipo: "EGRESO", color: "#ec4899" } }),
  ]);

  const cat = (nombre) => categorias.find((c) => c.nombre === nombre).id;

  // Barberos
  const [carlos, andres, miguel] = await Promise.all([
    prisma.barbero.create({ data: { nombre: "Carlos Ruiz", comisionPct: 45, telefono: "3001112233" } }),
    prisma.barbero.create({ data: { nombre: "Andrés Gómez", comisionPct: 40, telefono: "3004445566" } }),
    prisma.barbero.create({ data: { nombre: "Miguel Torres", comisionPct: 50, telefono: "3007778899" } }),
  ]);

  const barberos = [carlos.id, andres.id, miguel.id];
  const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const metodos = ["EFECTIVO", "EFECTIVO", "NEQUI", "TARJETA", "TRANSFERENCIA"];

  // Generar movimientos de los últimos 20 días
  const movimientos = [];
  for (let d = 19; d >= 0; d--) {
    const dia = dayjs().subtract(d, "day");
    // Domingo con menos actividad
    const esDomingo = dia.day() === 0;
    const numServicios = esDomingo ? 3 : 6 + Math.floor(Math.random() * 6);

    for (let i = 0; i < numServicios; i++) {
      const servicios = [
        { concepto: "Corte de cabello", catNombre: "Corte", monto: 20000 },
        { concepto: "Arreglo de barba", catNombre: "Barba", monto: 15000 },
        { concepto: "Corte + barba", catNombre: "Corte + Barba", monto: 30000 },
        { concepto: "Venta de cera", catNombre: "Productos", monto: 25000 },
      ];
      const s = rand(servicios);
      movimientos.push({
        tipo: "INGRESO",
        monto: s.monto,
        concepto: s.concepto,
        metodoPago: rand(metodos),
        categoriaId: cat(s.catNombre),
        barberoId: rand(barberos),
        fecha: dia.hour(9 + i).minute(Math.floor(Math.random() * 59)).toDate(),
      });
    }

    // Un egreso ocasional
    if (Math.random() > 0.6) {
      const egresos = [
        { concepto: "Compra de shampoo y cera", catNombre: "Insumos", monto: 45000 },
        { concepto: "Pago de energía", catNombre: "Servicios", monto: 60000 },
        { concepto: "Cuchillas y navajas", catNombre: "Insumos", monto: 30000 },
      ];
      const e = rand(egresos);
      movimientos.push({
        tipo: "EGRESO",
        monto: e.monto,
        concepto: e.concepto,
        metodoPago: "EFECTIVO",
        categoriaId: cat(e.catNombre),
        fecha: dia.hour(18).minute(0).toDate(),
      });
    }
  }

  // Arriendo el día 1 del mes actual
  movimientos.push({
    tipo: "EGRESO",
    monto: 800000,
    concepto: "Arriendo del local",
    metodoPago: "TRANSFERENCIA",
    categoriaId: cat("Arriendo"),
    fecha: dayjs().startOf("month").hour(10).toDate(),
  });

  await prisma.movimiento.createMany({ data: movimientos });

  console.log(`✅ Listo: ${categorias.length} categorías, 3 barberos, ${movimientos.length} movimientos.`);
}

main()
  .catch((e) => {
    console.error("❌ Error en el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
