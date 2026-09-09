import { Router } from "express";
import { upload } from "../../middleware/upload.js";
import * as controller from "./negocio.controller.js";

const router = Router();

router.get("/", controller.obtener);
router.put("/", controller.actualizar);
router.post("/logo", upload.single("logo"), controller.subirLogo);

export default router;