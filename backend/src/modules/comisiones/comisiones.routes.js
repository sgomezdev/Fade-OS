import { Router } from "express";
import * as controller from "./comisiones.controller.js";

const router = Router();

router.get("/", controller.calcular);

export default router;