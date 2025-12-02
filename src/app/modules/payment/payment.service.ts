import httpStatus from 'http-status';
import Stripe from "stripe";
import { prisma } from "../../shared/prisma";
import { BookingStatus, PaymentStatus } from "@prisma/client";
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
    }

    // Only ACCEPTED bookings can proceed to payment
    if (isExistBooking.status !== BookingStatus.ACCEPTED) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Payment is allowed only for ACCEPTED bookings"
        );
    }

    // ❗ Prevent duplicate payment
    const existingPayment = await prisma.payment.findFirst({
        where: { bookingId: isExistBooking.id }
    });

    if (existingPayment) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "A payment request has already been created for this booking. You cannot pay again."
        );
    }

    // Get listing price
    const listing = await prisma.listing.findUnique({
        where: { id: isExistBooking.listingId },
        select: { price: true },
    });

    if (!listing?.price) {
        throw new AppError(httpStatus.NOT_FOUND, "Listing not found or price unavailable");
    }

    const amount = listing.price * isExistBooking.guests;
    const transactionId = transactionGet();

    // DB transaction — only save payment entry
    const { paymentData } = await prisma.$transaction(async (tnx) => {
        const paymentData = await tnx.payment.create({
            data: {
                bookingId: isExistBooking.id,
                transactionId,
                amount,
            },
        });

        return { paymentData };
    });

    // Stripe session
    const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        customer_email: token.email,
        line_items: [
            {
                price_data: {
                    currency: "usd", // bdt may cause stripe errors
                    product_data: { name: `Tour booking for ${isExistUser.name}` },
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
    if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;

        const bookingId = session.metadata?.bookingId;
        const paymentId = session.metadata?.paymentId;

        if (!bookingId || !paymentId) {
            console.error("❌ Missing metadata in Stripe session");
            return;
        }

        const isPaid = session.payment_status === "paid";

        // Update booking
        await prisma.booking.update({
            where: { id: bookingId },
            data: {
                paymentStatus: isPaid ? PaymentStatus.PAID : PaymentStatus.UNPAID,
                status: BookingStatus.CONFIRMED,
            },
        });

        // Update payment entry
        await prisma.payment.update({
            where: { id: paymentId },
            data: {
                status: isPaid ? PaymentStatus.PAID : PaymentStatus.UNPAID,
                paymentGatewayData: session as any,
            },
        });

        console.log("✅ Payment + Booking updated successfully");
    } else {
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }
};

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

export const paymentService = {
    handleStripeWebhookEvent,
    createPayment
};