import express from 'express';
import { userRoutes } from '../modules/user/user.route';
import { authRouter } from '../modules/auth/auth.route';
import { listingRoutes } from '../modules/listings/listing.route';

const router = express.Router();

const moduleRoutes = [
    {
        path: '/user',
        route: userRoutes
    },
    {
        path: '/auth',
        route: authRouter
    },
    {
        path: '/listing',
        route: listingRoutes
    }
];

moduleRoutes.forEach(route => router.use(route.path, route.route))

export default router;