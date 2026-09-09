import { Router } from "express";
import * as controller from "./caja.controller.js";

const router = Router();

router.get("/actual", controller.actual);
router.post("/abrir", controller.abrir);
router.post("/cerrar", controller.cerrar);

export default router;