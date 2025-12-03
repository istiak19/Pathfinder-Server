import { Router } from "express";
import { authController } from "./auth.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "@prisma/client";

const router = Router();

router.get("/me", checkAuth(Role.ADMIN, Role.GUIDE, Role.TOURIST), authController.getMeUser);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
// router.post("/forgot-password", authController.forgotPassword);
// router.post("/reset-password", authController.resetPassword);

export const authRouter = router;