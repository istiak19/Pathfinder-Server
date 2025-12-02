import httpStatus from 'http-status';
import Stripe from "stripe";
import { prisma } from "../../shared/prisma";
import { PaymentStatus } from "@prisma/client";
import { JwtPayload } from "jsonwebtoken";
import { AppError } from "../../errors/AppError";
import { stripe } from '../../helpers/stripe';
import { transactionGet } from '../../utils/transactionGet';

const createPayment = async (token: JwtPayload, payload: { bookingId: string }) => {
    const isExistUser = await prisma.user.findUnique({
        where: { email: token.email },
    });

    if (!isExistUser) {
        throw new AppError(httpStatus.BAD_REQUEST, "User not found");
    }

    const isExistBooking = await prisma.booking.findUnique({
        where: { id: payload.bookingId },
    });

    if (!isExistBooking) {
        throw new AppError(httpStatus.BAD_REQUEST, "Booking not found");
    };

    // Check listing exists
    const listing = await prisma.listing.findUnique({
        where: { id: isExistBooking.listingId },
        select: { price: true },
    });

    if (!listing?.price) {
        throw new AppError(httpStatus.NOT_FOUND, "Listing not found or no price available");
    }

    const amount = listing.price * isExistBooking.guests;
    const transactionId = transactionGet();

    // 1️⃣ Transaction for DB operations ONLY
    const { paymentData } = await prisma.$transaction(async (tnx) => {
        // const bookingData = await tnx.booking.create({
        //     data: {
        //         listingId: payload.listingId,
        //         touristId: token.userId,
        //         guests: payload.guests,
        //         date: new Date(payload.date),
        //     },
        // });

        const paymentData = await tnx.payment.create({
            data: {
                bookingId: isExistBooking.id,
                transactionId,
                amount,
            },
        });

        return { paymentData };
    });

    // 2️⃣ Stripe session OUTSIDE transaction (IMPORTANT!)
    const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        customer_email: token.email,
        line_items: [
            {
                price_data: {
                    currency: "bdt",
                    product_data: {
                        name: `Tour booking for ${isExistUser.name}`,
                    },
                    unit_amount: amount * 100,
                },
                quantity: 1,
            },
        ],
        success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.CLIENT_URL}/payment-cancel`,
        metadata: {
            bookingId: isExistBooking.id,
            paymentId: paymentData.id,
        },
    });

    return {
        paymentUrl: session.url,
    };
};

const handleStripeWebhookEvent = async (event: Stripe.Event) => {
    switch (event.type) {
        case "checkout.session.completed": {
            const session = event.data.object as any;

            const bookingId = session.metadata?.bookingId;
            const paymentId = session.metadata?.paymentId;

            await prisma.booking.update({
                where: {
                    id: bookingId
                },
                data: {
                    paymentStatus: session.payment_status === "paid" ? PaymentStatus.PAID : PaymentStatus.UNPAID
                }
            });

            await prisma.payment.update({
                where: {
                    id: paymentId
                },
                data: {
                    status: session.payment_status === "paid" ? PaymentStatus.PAID : PaymentStatus.UNPAID,
                    paymentGatewayData: session
                }
            });

            break;
        }

        default:
            console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }
};

export const paymentService = {
    handleStripeWebhookEvent,
    createPayment
};