-- CreateTable
CREATE TABLE "barberos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT,
    "comisionPct" REAL NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "categorias" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#3b82f6',
    "activo" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "movimientos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tipo" TEXT NOT NULL,
    "monto" REAL NOT NULL,
    "concepto" TEXT NOT NULL,
    "metodoPago" TEXT NOT NULL DEFAULT 'EFECTIVO',
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "categoriaId" INTEGER,
    "barberoId" INTEGER,
    "sesionId" INTEGER,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "movimientos_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "movimientos_barberoId_fkey" FOREIGN KEY ("barberoId") REFERENCES "barberos" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "movimientos_sesionId_fkey" FOREIGN KEY ("sesionId") REFERENCES "sesiones_caja" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sesiones_caja" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "montoInicial" REAL NOT NULL DEFAULT 0,
    "cierreEsperado" REAL,
    "cierreReal" REAL,
    "diferencia" REAL,
    "estado" TEXT NOT NULL DEFAULT 'ABIERTA',
    "notas" TEXT,
    "abiertaEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cerradaEn" DATETIME
);

-- CreateIndex
CREATE UNIQUE INDEX "categorias_nombre_key" ON "categorias"("nombre");

-- CreateIndex
CREATE INDEX "movimientos_fecha_idx" ON "movimientos"("fecha");

-- CreateIndex
CREATE INDEX "movimientos_tipo_idx" ON "movimientos"("tipo");
