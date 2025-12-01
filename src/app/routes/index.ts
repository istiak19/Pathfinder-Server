import express from 'express';
import { userRoutes } from '../modules/user/user.route';
import { authRouter } from '../modules/auth/auth.route';
import { listingRoutes } from '../modules/listings/listing.route';
import { bookingRoutes } from '../modules/booking/booking.route';

const router = express.Router();

const moduleRoutes = [
    {
        path: "/users",
        route: userRoutes
    },
    {
        path: "/auth",
        route: authRouter
    },
    {
        path: "/listings",
        route: listingRoutes
    },
    {
        path: "/bookings",
        route: bookingRoutes
    }
];

moduleRoutes.forEach(route => router.use(route.path, route.route))

export default router;