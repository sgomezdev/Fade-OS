-- CreateTable
CREATE TABLE "Producto" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "categoria" TEXT NOT NULL DEFAULT 'BEBIDA',
    "stock" INTEGER NOT NULL DEFAULT 0,
    "costo" INTEGER NOT NULL,
    "precioVenta" INTEGER NOT NULL,
    "stockMinimo" INTEGER NOT NULL DEFAULT 2,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_movimientos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tipo" TEXT NOT NULL,
    "monto" REAL NOT NULL,
    "concepto" TEXT NOT NULL,
    "metodoPago" TEXT NOT NULL DEFAULT 'EFECTIVO',
    "tipoItem" TEXT,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "categoriaId" INTEGER,
    "barberoId" INTEGER,
    "sesionId" INTEGER,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "productoId" INTEGER,
    "cantidad" INTEGER,
    CONSTRAINT "movimientos_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "movimientos_barberoId_fkey" FOREIGN KEY ("barberoId") REFERENCES "barberos" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "movimientos_sesionId_fkey" FOREIGN KEY ("sesionId") REFERENCES "sesiones_caja" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "movimientos_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_movimientos" ("barberoId", "categoriaId", "concepto", "creadoEn", "fecha", "id", "metodoPago", "monto", "sesionId", "tipo", "tipoItem") SELECT "barberoId", "categoriaId", "concepto", "creadoEn", "fecha", "id", "metodoPago", "monto", "sesionId", "tipo", "tipoItem" FROM "movimientos";
DROP TABLE "movimientos";
ALTER TABLE "new_movimientos" RENAME TO "movimientos";
CREATE INDEX "movimientos_fecha_idx" ON "movimientos"("fecha");
CREATE INDEX "movimientos_tipo_idx" ON "movimientos"("tipo");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
