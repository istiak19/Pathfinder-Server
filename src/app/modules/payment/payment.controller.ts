import httpStatus from 'http-status';
import { Request, Response } from "express";
import sendResponse from "../../shared/sendResponse";
import { stripe } from "../../helpers/stripe";
import { catchAsync } from '../../shared/catchAsync';
import { JwtPayload } from 'jsonwebtoken';
import { paymentService } from './payment.service';
import { envVars } from '../../../config/env';
import { AppError } from '../../errors/AppError';

const createPayment = catchAsync(async (req: Request, res: Response) => {
    const decoded = req.user as JwtPayload;
    const payment = await paymentService.createPayment(decoded, req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Payment request submitted",
        data: payment,
    });
});

const successPayment = catchAsync(async (req: Request, res: Response) => {
    // 1️⃣ Explicitly extract query param
    const transactionId = req.query.transactionId as string;
    const amount = req.query.amount as string | undefined;
    const status = req.query.status as string | undefined;

    if (!transactionId) {
        throw new AppError(httpStatus.BAD_REQUEST, "Transaction ID is required");
    }

    // 2️⃣ Call service
    const result = await paymentService.successPayment({ transactionId });

    // 3️⃣ Redirect frontend
    if (result.success) {
        const redirectUrl = `${envVars.SSL.SSL_SUCCESS_FRONTEND_URL}?transactionId=${transactionId}&message=${encodeURIComponent(result.message)}&amount=${amount ?? ""}&status=${status ?? ""}`;
        return res.redirect(redirectUrl);
    }
});

const failPayment = catchAsync(async (req: Request, res: Response) => {
    // 1️⃣ Explicitly extract query param
    const transactionId = req.query.transactionId as string;
    const amount = req.query.amount as string | undefined;
    const status = req.query.status as string | undefined;

    if (!transactionId) {
        throw new AppError(httpStatus.BAD_REQUEST, "Transaction ID is required");
    }

    // 2️⃣ Call service
    const result = await paymentService.failPayment({ transactionId });

    // 3️⃣ Redirect frontend

    if (!result.success) {
        res.redirect(`${envVars.SSL.SSL_FAIL_FRONTEND_URL}?transactionId=${transactionId}&message=${result.message}&amount=${amount ?? ""}&status=${status ?? ""}`)
    }
});

const cancelPayment = catchAsync(async (req: Request, res: Response) => {
    // 1️⃣ Explicitly extract query param
    const transactionId = req.query.transactionId as string;
    const amount = req.query.amount as string | undefined;
    const status = req.query.status as string | undefined;

    if (!transactionId) {
        throw new AppError(httpStatus.BAD_REQUEST, "Transaction ID is required");
    }

    // 2️⃣ Call service
    const result = await paymentService.cancelPayment({ transactionId });

    // 3️⃣ Redirect frontend

    if (!result.success) {
        res.redirect(`${envVars.SSL.SSL_CANCEL_FRONTEND_URL}?transactionId=${transactionId}&message=${result.message}&amount=${amount ?? ""}&status=${status ?? ""}`)
    }
});

// const handleStripeWebhookEvent = catchAsync(async (req: Request, res: Response) => {

//     const sig = req.headers["stripe-signature"] as string;
//     const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

//     let event;
//     try {
//         event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
//     } catch (err: any) {
//         console.error("⚠️ Webhook signature verification failed:", err.message);
//         return res.status(400).send(`Webhook Error: ${err.message}`);
//     }
//     const result = await paymentService.handleStripeWebhookEvent(event);
//     console.log(result)

//     sendResponse(res, {
//         statusCode: httpStatus.OK,
//         success: true,
//         message: 'Webhook req send successfully',
//         data: result,
//     });
// });

export const paymentController = {
    createPayment,
    // handleStripeWebhookEvent,
    successPayment,
    failPayment,
    cancelPayment
};