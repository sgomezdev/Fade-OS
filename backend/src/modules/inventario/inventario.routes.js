import { Router } from "express";
import * as controller from "./inventario.controller.js";

const router = Router();

router.get("/", controller.listar);
router.post("/", controller.crear);
router.put("/:id", controller.actualizar);
router.post("/:id/ajustar-stock", controller.ajustarStock);
router.post("/:id/reponer", controller.reponer);
router.delete("/:id", controller.eliminar);

export default router;