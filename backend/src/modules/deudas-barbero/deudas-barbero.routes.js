import { Router } from "express";
import * as controller from "./deudas-barbero.controller.js";

const router = Router();

router.get("/pendientes", controller.listarPendientes);
router.get("/:barberoId", controller.listarDetalle);
router.post("/retiro", controller.registrarRetiro);
router.post("/consumo", controller.registrarConsumo);
router.post("/:barberoId/saldar", controller.saldar);

export default router;