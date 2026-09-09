import { Router } from "express";
import * as controller from "./gastos-fijos.controller.js";

const router = Router();

router.get("/", controller.listar);
router.post("/", controller.crear);
router.put("/:id", controller.actualizar);
router.delete("/:id", controller.eliminar);
router.post("/:id/pagar", controller.marcarPagado);

export default router;