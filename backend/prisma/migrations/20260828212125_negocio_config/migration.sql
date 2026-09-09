-- CreateTable
CREATE TABLE "Negocio" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "nombre" TEXT NOT NULL DEFAULT 'Mi Barbería',
    "logo" TEXT,
    "colorAcento" TEXT,
    "actualizadoEn" DATETIME NOT NULL
);
