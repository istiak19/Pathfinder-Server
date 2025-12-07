import httpStatus from 'http-status';
import { Request, Response } from "express";
import sendResponse from "../../shared/sendResponse";
import { stripe } from "../../helpers/stripe";
import { catchAsync } from '../../shared/catchAsync';
import { JwtPayload } from 'jsonwebtoken';
import { paymentService } from './payment.service';

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
    // handleStripeWebhookEvent
};