-- CreateTable
CREATE TABLE "DeudaBarbero" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "barberoId" INTEGER NOT NULL,
    "concepto" TEXT NOT NULL,
    "monto" INTEGER NOT NULL,
    "productoId" INTEGER,
    "cantidad" INTEGER,
    "saldado" BOOLEAN NOT NULL DEFAULT false,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DeudaBarbero_barberoId_fkey" FOREIGN KEY ("barberoId") REFERENCES "barberos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DeudaBarbero_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
