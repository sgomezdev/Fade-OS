import { Router } from "express";
import * as controller from "./movimientos.controller.js";

const router = Router();

// Resúmenes (van antes de /:id para no colisionar con la ruta dinámica)
router.get("/resumen/dia", controller.resumenDia);
router.get("/resumen/calendario", controller.resumenCalendario);

// CRUD de movimientos
router.get("/", controller.listar);
router.post("/", controller.crear);
router.get("/:id", controller.obtener);
router.put("/:id", controller.actualizar);
router.delete("/:id", controller.eliminar);

export default router;
