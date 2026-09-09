import { Router } from "express";
import * as controller from "./barberos.controller.js";

const router = Router();

router.get("/", controller.listar);
router.post("/", controller.crear);

export default router;