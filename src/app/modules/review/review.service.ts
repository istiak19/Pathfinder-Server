import httpStatus from 'http-status';
import { JwtPayload } from "jsonwebtoken";
import { prisma } from "../../shared/prisma";
import { AppError } from "../../errors/AppError";
import calculatePagination, { IOptions } from '../../helpers/paginationHelper';
import { IReview } from './review.interface';

const createReview = async (token: JwtPayload, payload: IReview) => {
    const isExistTourist = await prisma.user.findUnique({
        where: {
            email: token.email
        }
    });

    if (!isExistTourist) {
        throw new AppError(httpStatus.BAD_REQUEST, "Tourist not found");
    };

    const isExistBooking = await prisma.booking.findUnique({
        where: {
            id: payload.bookingId
        }
    });

    if (isExistBooking?.touristId !== isExistTourist.id) {
        throw new AppError(httpStatus.BAD_REQUEST, "Appointment not found");
    };

    const reviewData = await prisma.$transaction(async (tnx) => {
        const result = await tnx.review.create({
            data: {
                bookingId: payload.bookingId,
                comment: payload.comment,
                rating: payload.rating,
                listingId: isExistBooking.listingId,
                touristId: isExistTourist.id
            }
        });

        const avgRating = await tnx.review.aggregate({
            _avg: {
                rating: true
            },
            where: {
                listingId: isExistBooking.listingId
            }
        });

        await tnx.listing.update({
            where: {
                id: isExistBooking.listingId
            },
            data: {
                averageRating: avgRating._avg.rating ?? 0
            }
        });

        return result;
    });

    return reviewData;
};

const getAllReview = async (options: IOptions) => {
    const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options);
    const result = await prisma.review.findMany({
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
            tourist: true,
            listing: true
        }
    });

    const total = await prisma.booking.count();
    const totalPages = Math.ceil(total / limit);

    return {
        meta: { page, limit, total, totalPages },
        data: result
    };
};

export const reviewService = {
    createReview,
    getAllReview
};