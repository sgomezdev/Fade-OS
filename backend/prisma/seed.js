import { PrismaClient } from "@prisma/client";
import dayjs from "dayjs";

const prisma = new PrismaClient();

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const METODOS = ["EFECTIVO", "EFECTIVO", "EFECTIVO", "NEQUI", "TARJETA", "TRANSFERENCIA"];

async function main() {
  console.log("🌱 Sembrando datos de demo...");

  // Limpiar todo (orden importa por las relaciones)
  await prisma.deudaBarbero.deleteMany();
  await prisma.movimiento.deleteMany();
  await prisma.sesionCaja.deleteMany();
  await prisma.gastoFijo.deleteMany();
  await prisma.producto.deleteMany();
  await prisma.barbero.deleteMany();
  await prisma.categoria.deleteMany();

  // Negocio (config de marca) — singleton id=1
  await prisma.negocio.upsert({
    where: { id: 1 },
    update: { nombre: "FadeOS Barbershop", colorAcento: "#0f172a", mostrarGastosFijos: true },
    create: { id: 1, nombre: "FadeOS Barbershop", colorAcento: "#0f172a", mostrarGastosFijos: true },
  });

  // Barberos
  const [carlos, andres, miguel] = await Promise.all([
    prisma.barbero.create({ data: { nombre: "Carlos Ruiz", comisionPct: 45, telefono: "3001112233" } }),
    prisma.barbero.create({ data: { nombre: "Andrés Gómez", comisionPct: 40, telefono: "3004445566" } }),
    prisma.barbero.create({ data: { nombre: "Miguel Torres", comisionPct: 50, telefono: "3007778899" } }),
  ]);
  const barberos = [carlos.id, andres.id, miguel.id];
  const nombreDe = (id) => [carlos, andres, miguel].find((b) => b.id === id).nombre;

  // Productos (inventario)
  const productos = await Promise.all([
    prisma.producto.create({ data: { nombre: "Coca-Cola 400ml", categoria: "BEBIDA", stock: 18, costo: 2000, precioVenta: 4000, color: "#ef4444" } }),
    prisma.producto.create({ data: { nombre: "Agua con gas", categoria: "BEBIDA", stock: 22, costo: 1500, precioVenta: 3500, color: "#3b82f6" } }),
    prisma.producto.create({ data: { nombre: "Cerveza Club Colombia", categoria: "BEBIDA", stock: 12, costo: 3500, precioVenta: 7000, color: "GOLD" } }),
    prisma.producto.create({ data: { nombre: "Cera mate", categoria: "CAPILAR", stock: 9, costo: 12000, precioVenta: 25000, color: "#8b5cf6" } }),
    prisma.producto.create({ data: { nombre: "Shampoo anticaída", categoria: "CAPILAR", stock: 6, costo: 15000, precioVenta: 32000, color: "SILVER" } }),
  ]);
  const bebidas = productos.filter((p) => p.categoria === "BEBIDA");
  const capilares = productos.filter((p) => p.categoria === "CAPILAR");

  // Gastos fijos
  await prisma.gastoFijo.createMany({
    data: [
      { nombre: "Arriendo del local", monto: 1200000, frecuenciaDias: 30, color: "#f43f5e" },
      { nombre: "Sueldo administrador", monto: 900000, frecuenciaDias: 15, color: "#3b82f6" },
      { nombre: "Internet y servicios", monto: 150000, frecuenciaDias: 30, color: "#94a3b8" },
    ],
  });

  const SERVICIOS = [
    { concepto: "Corte de cabello", monto: 20000 },
    { concepto: "Arreglo de barba", monto: 15000 },
    { concepto: "Corte + barba", monto: 30000 },
    { concepto: "Diseño y línea", monto: 18000 },
  ];

  const movimientos = [];

  for (let d = 24; d >= 0; d--) {
    const dia = dayjs().subtract(d, "day");
    const esDomingo = dia.day() === 0;
    const numServicios = esDomingo ? 3 : 6 + Math.floor(Math.random() * 6);

    for (let i = 0; i < numServicios; i++) {
      const s = rand(SERVICIOS);
      const barberoId = rand(barberos);
      movimientos.push({
        tipo: "INGRESO",
        tipoItem: "SERVICIO",
        monto: s.monto,
        concepto: s.concepto,
        metodoPago: rand(METODOS),
        barberoId,
        fecha: dia.hour(9 + i).minute(Math.floor(Math.random() * 59)).toDate(),
      });

      if (Math.random() > 0.7) {
        movimientos.push({
          tipo: "INGRESO",
          tipoItem: "PROPINA",
          monto: rand([3000, 5000, 8000, 10000]),
          concepto: `Propina - ${nombreDe(barberoId)}`,
          metodoPago: "EFECTIVO",
          barberoId,
          fecha: dia.hour(9 + i).minute(Math.floor(Math.random() * 59)).toDate(),
        });
      }
    }

    if (Math.random() > 0.5) {
      const p = rand(bebidas);
      const cantidad = 1 + Math.floor(Math.random() * 2);
      movimientos.push({
        tipo: "INGRESO",
        tipoItem: "BEBIDA",
        monto: p.precioVenta * cantidad,
        concepto: p.nombre,
        metodoPago: rand(METODOS),
        productoId: p.id,
        cantidad,
        costoUnitario: p.costo,
        fecha: dia.hour(14).minute(0).toDate(),
      });
    }

    if (Math.random() > 0.75) {
      const p = rand(capilares);
      const barberoId = rand(barberos);
      movimientos.push({
        tipo: "INGRESO",
        tipoItem: "CAPILAR",
        monto: p.precioVenta,
        concepto: p.nombre,
        metodoPago: rand(METODOS),
        barberoId,
        productoId: p.id,
        cantidad: 1,
        costoUnitario: p.costo,
        fecha: dia.hour(16).minute(0).toDate(),
      });
    }

    if (Math.random() > 0.75) {
      const egresos = [
        { concepto: "Cuchillas y navajas", monto: 30000 },
        { concepto: "Toallas y aseo", monto: 20000 },
        { concepto: "Mantenimiento de máquinas", monto: 45000 },
      ];
      const e = rand(egresos);
      movimientos.push({
        tipo: "EGRESO",
        tipoItem: "OTRO",
        monto: e.monto,
        concepto: e.concepto,
        metodoPago: "EFECTIVO",
        fecha: dia.hour(18).minute(0).toDate(),
      });
    }
  }

  movimientos.push({
    tipo: "EGRESO",
    tipoItem: "COMPRA_INVENTARIO",
    monto: 180000,
    concepto: "Pedido de bebidas y productos capilares",
    metodoPago: "TRANSFERENCIA",
    fecha: dayjs().subtract(5, "day").hour(10).toDate(),
  });

  movimientos.push({
    tipo: "EGRESO",
    tipoItem: "GASTO_FIJO",
    monto: 1200000,
    concepto: "Arriendo del local",
    metodoPago: "TRANSFERENCIA",
    fecha: dayjs().startOf("month").hour(10).toDate(),
  });

  await prisma.movimiento.createMany({ data: movimientos });

  await prisma.sesionCaja.create({
    data: { fecha: dayjs().startOf("day").toDate(), montoInicial: 100000, estado: "ABIERTA" },
  });

  await prisma.deudaBarbero.create({
    data: { barberoId: andres.id, concepto: "Retiro de caja", monto: 20000, saldado: false },
  });

  console.log(`✅ Listo: 3 barberos, ${productos.length} productos, 3 gastos fijos, ${movimientos.length} movimientos.`);
}

main()
  .catch((e) => {
    console.error("❌ Error en el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
