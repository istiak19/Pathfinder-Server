import express from "express";
import { paymentController } from "./payment.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "@prisma/client";

const router = express.Router();

router.post("/booking", checkAuth(Role.TOURIST), paymentController.createPayment);
router.post("/success", paymentController.successPayment);
router.post("/fail", paymentController.failPayment);

export const paymentRoutes = router;