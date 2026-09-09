-- CreateTable
CREATE TABLE "GastoFijo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "monto" INTEGER NOT NULL,
    "frecuenciaDias" INTEGER NOT NULL,
    "ultimoPago" DATETIME,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Negocio" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "nombre" TEXT NOT NULL DEFAULT 'Mi Barbería',
    "logo" TEXT,
    "colorAcento" TEXT,
    "actualizadoEn" DATETIME NOT NULL,
    "mostrarGastosFijos" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Negocio" ("actualizadoEn", "colorAcento", "id", "logo", "nombre") SELECT "actualizadoEn", "colorAcento", "id", "logo", "nombre" FROM "Negocio";
DROP TABLE "Negocio";
ALTER TABLE "new_Negocio" RENAME TO "Negocio";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
