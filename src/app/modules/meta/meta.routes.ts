import { Router } from "express";
import { metaController } from "./meta.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "@prisma/client";

const router = Router();

router.get("/", checkAuth(Role.ADMIN, Role.GUIDE, Role.TOURIST), metaController.metaData);

export const metaDataRoutes = router;