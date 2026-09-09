import express from "express";
import cors from "cors";

import movimientosRoutes from "./modules/movimientos/movimientos.routes.js";
import barberosRoutes from "./modules/barberos/barberos.routes.js";
import comisionesRoutes from "./modules/comisiones/comisiones.routes.js";
import cajaRoutes from "./modules/caja/caja.routes.js";
import inventarioRoutes from "./modules/inventario/inventario.routes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import negocioRoutes from "./modules/negocio/negocio.routes.js";
import { fileURLToPath } from "url";
import path from "path";
import gastosFijosRoutes from "./modules/gastos-fijos/gastos-fijos.routes.js";
import deudasBarberoRoutes from "./modules/deudas-barbero/deudas-barbero.routes.js";

export function createApp() {
  const app = express();

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

  app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
  app.use(express.json());

  app.get("/api/health", (req, res) => {
    res.json({ ok: true, servicio: "Manhattan Caja API", hora: new Date().toISOString() });
  });

  app.use("/api/movimientos", movimientosRoutes);
  app.use("/api/barberos", barberosRoutes);
  app.use("/api/comisiones", comisionesRoutes);
  app.use("/api/caja", cajaRoutes);
  app.use("/api/inventario", inventarioRoutes);
  app.use("/api/negocio", negocioRoutes);
  app.use("/api/gastos-fijos", gastosFijosRoutes);
  app.use("/api/deudas-barbero", deudasBarberoRoutes);

  const rutaFrontend = path.join(__dirname, "../public");
  app.use(express.static(rutaFrontend));

  // Cualquier ruta que NO sea /api/... devuelve el index.html del frontend
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(rutaFrontend, "index.html"));
  });

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
