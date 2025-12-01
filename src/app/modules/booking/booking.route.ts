import express from "express";
import { bookingController } from "./booking.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "@prisma/client";
import { createBookingZodSchema, updateBookingStatusZodSchema } from "./booking.validation";

const router = express.Router();

router.post("/", checkAuth(Role.TOURIST, Role.ADMIN), validateRequest(createBookingZodSchema), bookingController.createBooking);
// Get my bookings (tourist)
router.get("/me", checkAuth(Role.TOURIST), bookingController.getMyBookings);
// Admin → all bookings
router.get("/", checkAuth(Role.ADMIN), bookingController.getAllBookings);
// Guide → bookings for his listings
router.get("/guide/my", checkAuth(Role.GUIDE), bookingController.getGuideBookings);
// Guide Admin accepts/rejects
router.patch("/:id", checkAuth(Role.GUIDE, Role.ADMIN), validateRequest(updateBookingStatusZodSchema), bookingController.updateBookingStatus);
// Cancel
router.delete("/:id", checkAuth(Role.TOURIST, Role.ADMIN), bookingController.cancelBooking);

export const bookingRoutes = router;