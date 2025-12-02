import { Router } from 'express';
import { checkAuth } from '../../middlewares/checkAuth';
import { reviewController } from './review.controller';
import { Role } from '@prisma/client';

const router = Router();


router.post("/", checkAuth(Role.TOURIST), reviewController.createReview);
router.get("/", reviewController.getAllReview);
// router.get("/my-prescription/:id", checkAuth(role.patient), prescriptionController.getByMyPrescription);

export const reviewRoutes = router;