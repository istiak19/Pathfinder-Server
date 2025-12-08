import httpStatus from 'http-status';
import { prisma } from "../../shared/prisma";
import { BookingStatus, PaymentStatus } from "@prisma/client";
import { JwtPayload } from "jsonwebtoken";
import { AppError } from "../../errors/AppError";
import { transactionGet } from '../../utils/transactionGet';
import Stripe from 'stripe';
import { ISSLCommerz } from '../sslCommerz/sslCommerz.interface';
import { SSLService } from '../sslCommerz/sslCommerz.service';

const createPayment = async (token: JwtPayload, payload: { bookingId: string }) => {
    const user = await prisma.user.findUnique({
        where: { email: token.email }
    });

    if (!user) throw new AppError(httpStatus.BAD_REQUEST, "User not found");

    const booking = await prisma.booking.findUnique({ where: { id: payload.bookingId } });

    if (!booking) throw new AppError(httpStatus.BAD_REQUEST, "Booking not found");

    if (booking.status !== BookingStatus.ACCEPTED)
        throw new AppError(httpStatus.BAD_REQUEST, "Payment is allowed only for ACCEPTED bookings");

    // Get listing price
    const listing = await prisma.listing.findUnique({
        where: { id: booking.listingId },
        select: { price: true },
    });

    if (!listing?.price) throw new AppError(httpStatus.NOT_FOUND, "Listing not found or price unavailable");

    const amount = listing.price * booking.guests;

    // Check existing payment
    let paymentRecord = await prisma.payment.findFirst({ where: { bookingId: booking.id } });

    if (paymentRecord) {
        if (paymentRecord.status === PaymentStatus.FAILED) {
            // Retry failed payment
            paymentRecord = await prisma.payment.update({
                where: { id: paymentRecord.id },
                data: { transactionId: transactionGet(), amount },
            });
        } else {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                "A payment request already exists for this booking. You cannot pay again."
            );
        }
    } else {
        // Create new payment
        paymentRecord = await prisma.payment.create({
            data: { bookingId: booking.id, transactionId: transactionGet(), amount },
        });
    }

    // Prepare SSLCommerz payload
    const sslPayload: ISSLCommerz = {
        name: user.name,
        email: user.email,
        amount,
        transactionId: paymentRecord.transactionId!,
    };

    const sslResponse = await SSLService.sslPaymentInit(sslPayload);

    return { gateway_url: sslResponse.GatewayPageURL };
};

// const handleStripeWebhookEvent = async (event: Stripe.Event) => {
//     if (event.type === "checkout.session.completed") {
//         const session = event.data.object as Stripe.Checkout.Session;

//         const bookingId = session.metadata?.bookingId;
//         const paymentId = session.metadata?.paymentId;

//         if (!bookingId || !paymentId) {
//             console.error("❌ Missing metadata in Stripe session");
//             return;
//         }

//         const isPaid = session.payment_status === "paid";

//         // Update booking
//         await prisma.booking.update({
//             where: { id: bookingId },
//             data: {
//                 paymentStatus: isPaid ? PaymentStatus.PAID : PaymentStatus.UNPAID,
//                 status: BookingStatus.CONFIRMED,
//             },
//         });

//         // Update payment entry
//         await prisma.payment.update({
//             where: { id: paymentId },
//             data: {
//                 status: isPaid ? PaymentStatus.PAID : PaymentStatus.UNPAID,
//                 paymentGatewayData: session as any,
//             },
//         });

//         console.log("✅ Payment + Booking updated successfully");
//     } else {
//         console.log(`ℹ️ Unhandled event type: ${event.type}`);
//     }
// };

// const processGuidePayout = async (bookingId: string) => {
//     // 1️⃣ Booking get
//     const booking = await prisma.booking.findUnique({
//         where: { id: bookingId },
//         include: { listing: { include: { guide: true } } },
//     });

//     if (!booking) {
//         throw new AppError(404, "Booking not found");
//     }

//     // 2️⃣ Check if tour is completed
//     if (booking.status !== BookingStatus.COMPLETED) {
//         throw new AppError(400, "Payout can only be processed for COMPLETED tours");
//     }

//     const guide = booking.listing.guide;

//     if (!guide) {
//         throw new AppError(404, "Guide not found for this listing");
//     }

//     // 3️⃣ Calculate payout
//     // Example: payout = dailyRate × number of days (or guests)
//     const dailyRate = booking.listing.dailyRate;
//     const numberOfDays = booking.days || 1; // assume 1 day if not stored
//     const totalPayout = dailyRate * numberOfDays * booking.guests;

//     // 4️⃣ Create payout record
//     const payout = await prisma.payout.create({
//         data: {
//             guideId: guide.id,
//             bookingId: booking.id,
//             amount: totalPayout,
//             status: PaymentStatus.PENDING, // mark as pending until transferred
//         },
//     });

//     // 5️⃣ Optionally: mark booking as payoutProcessed
//     await prisma.booking.update({
//         where: { id: booking.id },
//         data: { payoutProcessed: true },
//     });

//     return {
//         message: "Payout processed successfully",
//         guideId: guide.id,
//         bookingId: booking.id,
//         amount: totalPayout,
//     };
// };


// import { Request, Response } from "express";
// import Stripe from "stripe";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
//     apiVersion: "2025-11-17.clover",
// });

// const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

// export const handleStripeWebhookEvent = async (req: Request, res: Response) => {
//     let event: Stripe.Event;

//     // Fix: header type
//     const signature = req.headers["stripe-signature"] as string;

//     try {
//         // Fix: req.body MUST be Buffer
//         event = stripe.webhooks.constructEvent(
//             req.body as Buffer,
//             signature,
//             WEBHOOK_SECRET
//         );
//     } catch (err: any) {
//         console.error("❌ Webhook verification failed:", err.message);
//         return res.status(400).send(`Webhook Error: ${err.message}`);
//     }

//     console.log("📩 Received Stripe event:", event.type);

//     if (event.type === "checkout.session.completed") {
//         const session = event.data.object as Stripe.Checkout.Session;

//         const bookingId = session.metadata?.bookingId;
//         const paymentId = session.metadata?.paymentId;

//         if (!bookingId || !paymentId) {
//             console.error("❌ Missing metadata");
//             return res.status(400).send("Missing metadata");
//         }

//         const isPaid = session.payment_status === "paid";

//         try {
//             await prisma.booking.update({
//                 where: { id: bookingId },
//                 data: {
//                     paymentStatus: isPaid ? PaymentStatus.PAID : PaymentStatus.UNPAID,
//                     status: BookingStatus.CONFIRMED,
//                 },
//             });

//             await prisma.payment.update({
//                 where: { id: paymentId },
//                 data: {
//                     status: isPaid ? PaymentStatus.PAID : PaymentStatus.UNPAID,
//                     paymentGatewayData: session as any,
//                 },
//             });

//             console.log("✅ Payment + Booking updated");
//         } catch (err) {
//             console.error("❌ DB update error:", err);
//             return res.status(500).send("Database update failed");
//         }
//     }

//     return res.json({ received: true });
// };

const successPayment = async (query: { transactionId: string }) => {
    return await prisma.$transaction(async (tx) => {
        // 1️⃣ Find Payment by transactionId
        const payment = await tx.payment.findUnique({
            where: { transactionId: query.transactionId },
            include: { booking: true },
        });

        if (!payment) {
            throw new AppError(httpStatus.BAD_REQUEST, "Payment not found");
        }

        // 2️⃣ Update Payment Status
        const updatedPayment = await tx.payment.update({
            where: { id: payment.id },
            data: { status: PaymentStatus.PAID },
        });

        // 3️⃣ Update Booking Status
        await tx.booking.update({
            where: { id: payment.bookingId },
            data: {
                paymentStatus: PaymentStatus.PAID,
                status: BookingStatus.CONFIRMED
            },
        });

        return {
            success: true,
            message: "Payment Completed Successfully",
            payment: updatedPayment,
        };
    });
};

const failPayment = async (query: { transactionId: string }) => {
    return await prisma.$transaction(async (tx) => {
        // 1️⃣ Find Payment by transactionId
        const payment = await tx.payment.findUnique({
            where: { transactionId: query.transactionId },
            include: { booking: true },
        });

        if (!payment) {
            throw new AppError(httpStatus.BAD_REQUEST, "Payment not found");
        }

        // 2️⃣ Update Payment Status
        const updatedPayment = await tx.payment.update({
            where: { id: payment.id },
            data: { status: PaymentStatus.FAILED },
        });

        // 3️⃣ Update Booking Status
        await tx.booking.update({
            where: { id: payment.bookingId },
            data: {
                paymentStatus: PaymentStatus.FAILED,
                status: BookingStatus.ACCEPTED
            },
        });

        return {
            success: false,
            message: "Payment Failed",
            payment: updatedPayment,
        };
    });
};

const cancelPayment = async (query: { transactionId: string }) => {
    return await prisma.$transaction(async (tx) => {
        // 1️⃣ Find Payment by transactionId
        const payment = await tx.payment.findUnique({
            where: { transactionId: query.transactionId },
            include: { booking: true },
        });

        if (!payment) {
            throw new AppError(httpStatus.BAD_REQUEST, "Payment not found");
        }

        // 2️⃣ Update Payment Status
        const updatedPayment = await tx.payment.update({
            where: { id: payment.id },
            data: { status: PaymentStatus.CANCELLED },
        });

        // 3️⃣ Update Booking Status
        await tx.booking.update({
            where: { id: payment.bookingId },
            data: {
                paymentStatus: PaymentStatus.CANCELLED,
                status: BookingStatus.CANCELLED
            },
        });

        return {
            success: false,
            message: "Payment Failed",
            payment: updatedPayment,
        };
    });
};

export const paymentService = {
    // handleStripeWebhookEvent,
    createPayment,
    successPayment,
    failPayment,
    cancelPayment
};