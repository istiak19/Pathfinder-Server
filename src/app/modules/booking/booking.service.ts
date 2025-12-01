import httpStatus from "http-status";
import { AppError } from "../../errors/AppError";
import { JwtPayload } from "jsonwebtoken";
import { prisma } from "../../shared/prisma";


// --- Create Booking (Tourist) ---
const createBooking = async (token: JwtPayload, payload: { listingId: string; date: string }) => {

    // Check listing exists
    const listing = await prisma.listing.findUnique({
        where: { id: payload.listingId },
    });

    if (!listing) {
        throw new AppError(httpStatus.NOT_FOUND, "Listing not found");
    };

    // Save booking
    const result = await prisma.booking.create({
        data: {
            listingId: payload.listingId,
            touristId: token.userId,
            date: new Date(payload.date),
        },
        include: {
            listing: true,
            tourist: true,
        }
    });

    return result
};

// getMyBookings: async (touristId: string) => {
//   return prisma.booking.findMany({
//     where: { touristId },
//     include: { listing: true },
//     orderBy: { createdAt: "desc" },
//   });
// },

// getGuideBookings: async (guideId: string) => {
//   return prisma.booking.findMany({
//     where: {
//       listing: { guideId }
//     },
//     include: {
//       listing: true,
//       tourist: true,
//     },
//     orderBy: { createdAt: "desc" },
//   });
// },

// getAllBookings: async () => {
//   return prisma.booking.findMany({
//     include: { listing: true, tourist: true },
//     orderBy: { createdAt: "desc" },
//   });
// },

// cancelBooking: async (decoded: JwtPayload, id: string) => {
//   const booking = await prisma.booking.findUnique({
//     where: { id },
//   });

//   if (!booking) throw new AppError(httpStatus.NOT_FOUND, "Booking not found");

//   // Only owner or admin can cancel
//   if (decoded.role !== "ADMIN" && booking.touristId !== decoded.userId) {
//     throw new AppError(httpStatus.FORBIDDEN, "Not allowed");
//   }

//   const result = await prisma.booking.delete({
//     where: { id },
//   });

//   return result;
// },

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

    const result = await prisma.booking.delete({
        where: { id },
    });

    return result;
};

//   // --- Update Booking Status (Guide/Admin) ---
//   updateBookingStatus: async (decoded: JwtPayload, id: string, status: string) => {

//     // Check booking exists
//     const booking = await prisma.booking.findUnique({
//       where: { id },
//       include: { listing: true },
//     });

//     if (!booking) throw new AppError(httpStatus.NOT_FOUND, "Booking not found");

//     // Only listing guide can accept/reject
//     if (
//       decoded.role !== "ADMIN" &&
//       booking.listing.guideId !== decoded.userId
//     ) {
//       throw new AppError(httpStatus.FORBIDDEN, "Not allowed");
//     }

//     const result = await prisma.booking.update({
//       where: { id },
//       data: { status },
//       include: {
//         listing: true,
//         tourist: true,
//       }
//     });

//     return result;
//   },

export const bookingService = {
    createBooking,
    cancelBooking
};
