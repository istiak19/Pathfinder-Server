import httpStatus from "http-status";
import { AppError } from "../../errors/AppError";
import { JwtPayload } from "jsonwebtoken";
import { prisma } from "../../shared/prisma";
import calculatePagination, { IOptions } from "../../helpers/paginationHelper";
import { FilterParams } from "../../../constants";
import { BookingStatus, Prisma } from "@prisma/client";
import { bookingSearchableFields } from "./booking.constant";
import { transactionGet } from "../../utils/transactionGet";
import { stripe } from "../../helpers/stripe";


// --- Create Booking (Tourist) ---
const createBooking = async (token: JwtPayload, payload: { listingId: string; date: string; guests: number }) => {
    const isExistUser = await prisma.user.findUnique({
        where: { email: token.email },
    });

    if (!isExistUser) {
        throw new AppError(httpStatus.BAD_REQUEST, "User not found");
    };

    const result = await prisma.booking.create({
        data: {
            listingId: payload.listingId,
            touristId: token.userId,
            guests: payload.guests,
            date: new Date(payload.date),
        },
    });

    return result;
};

// const createBooking = async (token: JwtPayload, payload: { listingId: string; date: string; guests: number }) => {
//     const isExistUser = await prisma.user.findUnique({
//         where: { email: token.email },
//     });

//     if (!isExistUser) {
//         throw new AppError(httpStatus.BAD_REQUEST, "User not found");
//     }

//     // Check listing exists
//     const listing = await prisma.listing.findUnique({
//         where: { id: payload.listingId },
//         select: { price: true },
//     });

//     if (!listing?.price) {
//         throw new AppError(httpStatus.NOT_FOUND, "Listing not found or no price available");
//     }

//     const amount = listing.price * payload.guests;
//     const transactionId = transactionGet();

//     // 1️⃣ Transaction for DB operations ONLY
//     const { bookingData, paymentData } = await prisma.$transaction(async (tnx) => {
//         const bookingData = await tnx.booking.create({
//             data: {
//                 listingId: payload.listingId,
//                 touristId: token.userId,
//                 guests: payload.guests,
//                 date: new Date(payload.date),
//             },
//         });

//         const paymentData = await tnx.payment.create({
//             data: {
//                 bookingId: bookingData.id,
//                 transactionId,
//                 amount,
//             },
//         });

//         return { bookingData, paymentData };
//     });

//     // 2️⃣ Stripe session OUTSIDE transaction (IMPORTANT!)
//     const session = await stripe.checkout.sessions.create({
//         mode: "payment",
//         payment_method_types: ["card"],
//         customer_email: token.email,
//         line_items: [
//             {
//                 price_data: {
//                     currency: "bdt",
//                     product_data: {
//                         name: `Tour booking for ${isExistUser.name}`,
//                     },
//                     unit_amount: amount * 100,
//                 },
//                 quantity: 1,
//             },
//         ],
//         success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
//         cancel_url: `${process.env.CLIENT_URL}/payment-cancel`,
//         metadata: {
//             bookingId: bookingData.id,
//             paymentId: paymentData.id,
//         },
//     });

//     return {
//         paymentUrl: session.url,
//     };
// };


const getMyBookings = async (token: JwtPayload, params: FilterParams, options: IOptions) => {
    const isExistUser = await prisma.user.findUnique({
        where: {
            email: token.email
        }
    });

    if (!isExistUser) {
        throw new AppError(httpStatus.BAD_REQUEST, "User not found");
    };

    const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options);
    const { searchTerm, dateFrom, dateTo, ...filterData } = params;

    const andConditions: Prisma.BookingWhereInput[] = [];

    // Text search
    if (searchTerm) {
        andConditions.push({
            OR: bookingSearchableFields.map(field => ({
                [field]: { contains: searchTerm, mode: "insensitive" },
            })),
        });
    }

    // Exact filters
    Object.keys(filterData).forEach(key => {
        if (filterData[key] !== undefined) {
            andConditions.push({ [key]: { equals: filterData[key] } });
        }
    });

    // Date range filter
    if (dateFrom || dateTo) {
        andConditions.push({
            date: {
                gte: dateFrom ? new Date(dateFrom) : undefined,
                lte: dateTo ? new Date(dateTo) : undefined,
            },
        });
    }

    // Only bookings for the tourist's listings
    andConditions.push({
        touristId: token.userId
    });

    const whereConditions: Prisma.BookingWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

    const result = await prisma.booking.findMany({
        skip,
        take: limit,
        where: whereConditions,
        orderBy: { [sortBy || "createdAt"]: sortOrder || "asc" },
        include: {
            listing: true,
            payment: true,
            reviews: true
        },
    });

    return result;
}

export const getGuideBookings = async (token: JwtPayload, params: FilterParams, options: IOptions) => {
    const isExistUser = await prisma.user.findUnique({
        where: {
            email: token.email
        }
    });

    if (!isExistUser) {
        throw new AppError(httpStatus.BAD_REQUEST, "User not found");
    };

    const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options);
    const { searchTerm, guestsMin, guestsMax, dateFrom, dateTo, ...filterData } = params;

    const andConditions: Prisma.BookingWhereInput[] = [];

    // Text search
    if (searchTerm) {
        andConditions.push({
            OR: bookingSearchableFields.map(field => ({
                [field]: { contains: searchTerm, mode: "insensitive" },
            })),
        });
    }

    // Exact filters
    Object.keys(filterData).forEach(key => {
        if (filterData[key] !== undefined) {
            andConditions.push({ [key]: { equals: filterData[key] } });
        }
    });

    // Guests range filter
    if (guestsMin || guestsMax) {
        andConditions.push({
            guests: {
                gte: guestsMin ? Number(guestsMin) : undefined,
                lte: guestsMax ? Number(guestsMax) : undefined,
            },
        });
    }

    // Date range filter
    if (dateFrom || dateTo) {
        andConditions.push({
            date: {
                gte: dateFrom ? new Date(dateFrom) : undefined,
                lte: dateTo ? new Date(dateTo) : undefined,
            },
        });
    }

    // Only bookings for the guide's listings
    andConditions.push({
        listing: { guideId: token.userId },
    });

    const whereConditions: Prisma.BookingWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

    const result = await prisma.booking.findMany({
        skip,
        take: limit,
        where: whereConditions,
        orderBy: { [sortBy || "createdAt"]: sortOrder || "desc" },
        include: {
            listing: true,
            tourist: true,
            payment: true,
            reviews: true
        },
    });

    return result;
};

const getAllBookings = async (token: JwtPayload, params: FilterParams, options: IOptions) => {
    const isExistUser = await prisma.user.findUnique({
        where: {
            email: token.email
        }
    });

    if (!isExistUser) {
        throw new AppError(httpStatus.BAD_REQUEST, "User not found");
    };

    const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options);
    const { searchTerm, guestsMin, guestsMax, dateFrom, dateTo, ...filterData } = params;

    const andConditions: Prisma.BookingWhereInput[] = [];

    // Text search
    if (searchTerm) {
        andConditions.push({
            OR: bookingSearchableFields.map(field => ({
                [field]: { contains: searchTerm, mode: "insensitive" },
            })),
        });
    }

    // Exact filters
    Object.keys(filterData).forEach(key => {
        if (filterData[key] !== undefined) {
            andConditions.push({ [key]: { equals: filterData[key] } });
        }
    });

    // Guests range filter
    if (guestsMin || guestsMax) {
        andConditions.push({
            guests: {
                gte: guestsMin ? Number(guestsMin) : undefined,
                lte: guestsMax ? Number(guestsMax) : undefined,
            },
        });
    }

    // Date range filter
    if (dateFrom || dateTo) {
        andConditions.push({
            date: {
                gte: dateFrom ? new Date(dateFrom) : undefined,
                lte: dateTo ? new Date(dateTo) : undefined,
            },
        });
    };

    const whereConditions: Prisma.BookingWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

    const result = await prisma.booking.findMany({
        skip,
        take: limit,
        where: whereConditions,
        orderBy: { [sortBy || "createdAt"]: (sortOrder || "asc") as "asc" | "desc" },
        include: {
            listing: true,
            tourist: true,
            reviews: true
        },
    });

    return result;
}

const cancelBooking = async (token: JwtPayload, id: string) => {
    const isExistUser = await prisma.user.findUnique({
        where: {
            email: token.email
        }
    });

    if (!isExistUser) {
        throw new AppError(httpStatus.BAD_REQUEST, "User not found");
    };

    const booking = await prisma.booking.findUnique({
        where: { id },
    });

    if (!booking) {
        throw new AppError(httpStatus.NOT_FOUND, "Booking not found")
    };

    if (booking.status.toUpperCase() !== "PENDING") {
        throw new AppError(httpStatus.BAD_REQUEST, "Only bookings with 'PENDING' status can be deleted.");
    }

    const result = await prisma.booking.delete({
        where: { id },
    });

    return result;
};

// --- Update Booking Status (Guide/Admin) ---
const updateBookingStatus = async (token: JwtPayload, id: string, status: { status: string }) => {
    const isExistUser = await prisma.user.findUnique({
        where: {
            email: token.email
        }
    });

    if (!isExistUser) {
        throw new AppError(httpStatus.BAD_REQUEST, "User not found");
    };

    // Check booking exists
    const booking = await prisma.booking.findUnique({
        where: { id },
        include: { listing: true },
    });

    if (!booking) {
        throw new AppError(httpStatus.NOT_FOUND, "Booking not found")
    };

    // Only listing guide can accept/reject
    if (token.role !== "ADMIN" && booking.listing.guideId !== token.userId) {
        throw new AppError(httpStatus.FORBIDDEN, "Not allowed");
    };

    const currentStatus = booking.status.toUpperCase();
    const newStatus = status.status.toUpperCase();

    // Status change rules

    // 1. REJECTED or CANCELLED → no changes allowed
    if (currentStatus === "REJECTED" || currentStatus === "CANCELLED") {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            `Cannot change booking status because it is already '${currentStatus}'`
        );
    };

    // 2. CONFIRMED → cannot change to PENDING, ACCEPTED, REJECTED, CANCELLED
    if (currentStatus === "CONFIRMED") {
        const blockedStatuses = ["PENDING", "ACCEPTED", "REJECTED", "CANCELLED"];
        if (blockedStatuses.includes(newStatus)) {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                `Cannot change status from 'CONFIRMED' to '${newStatus}'`
            );
        };
    };

    // 3. ACCEPTED → cannot change to PENDING, REJECTED, CANCELLED
    if (currentStatus === "ACCEPTED") {
        const blockedStatuses = ["PENDING", "REJECTED", "CANCELLED"];
        if (blockedStatuses.includes(newStatus)) {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                `Cannot change status from 'ACCEPTED' to '${newStatus}'`
            );
        }
    };

    const result = await prisma.booking.update({
        where: { id },
        data: {
            status: status.status as BookingStatus
        },
        include: {
            listing: true,
            tourist: true,
        }
    });

    return result;
};

export const bookingService = {
    createBooking,
    getMyBookings,
    getGuideBookings,
    getAllBookings,
    updateBookingStatus,
    cancelBooking
};
