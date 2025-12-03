import httpStatus from 'http-status';
import { JwtPayload } from "jsonwebtoken";
import { AppError } from "../../errors/AppError";
import { prisma } from '../../shared/prisma';
import { PaymentStatus, Role, BookingStatus } from '@prisma/client';

const metaData = async (token: JwtPayload) => {
    let metadata;
    switch (token.role) {
        case Role.ADMIN:
            metadata = await getAdminMetaData();
            break;
        case Role.GUIDE:
            metadata = await getGuideMetaData(token);
            break;
        case Role.TOURIST:
            metadata = await getTouristMetaData(token);
            break;
        default:
            throw new AppError(httpStatus.BAD_REQUEST, "Invalid user role!");
    };

    return metadata;
};

// Guide specific metadata
const getGuideMetaData = async (token: JwtPayload) => {
    const guideData = await prisma.user.findUniqueOrThrow({
        where: { email: token.email }
    });

    const bookingCount = await prisma.booking.count({
        where: { listing: { guideId: guideData.id } }
    });

    const touristCount = await prisma.booking.groupBy({
        by: ['touristId'],
        _count: { id: true },
        where: { listing: { guideId: guideData.id } }
    });

    const reviewCount = await prisma.review.count({
        where: { listing: { guideId: guideData.id } }
    });

    const totalRevenue = await prisma.payment.aggregate({
        _sum: { amount: true },
        where: { booking: { listing: { guideId: guideData.id } }, status: PaymentStatus.PAID }
    });

    const bookingStatusDistribution = await prisma.booking.groupBy({
        by: ['status'],
        _count: { id: true },
        where: { listing: { guideId: guideData.id } }
    });

    const formattedBookingStatusDistribution = bookingStatusDistribution.map(({ status, _count }) => ({
        status,
        count: Number(_count.id)
    }));

    return {
        bookingCount,
        reviewCount,
        touristCount: touristCount.length,
        totalRevenue,
        formattedBookingStatusDistribution
    };
};

// Tourist specific metadata
const getTouristMetaData = async (token: JwtPayload) => {
    const touristData = await prisma.user.findUniqueOrThrow({
        where: { email: token.email }
    });

    const bookingCount = await prisma.booking.count({
        where: { touristId: touristData.id }
    });

    const reviewCount = await prisma.review.count({
        where: { touristId: touristData.id }
    });

    const bookingStatusDistribution = await prisma.booking.groupBy({
        by: ['status'],
        _count: { id: true },
        where: { touristId: touristData.id }
    });

    const formattedBookingStatusDistribution = bookingStatusDistribution.map(({ status, _count }) => ({
        status,
        count: Number(_count.id)
    }));

    return {
        bookingCount,
        reviewCount,
        formattedBookingStatusDistribution
    };
};

// Admin specific metadata
const getAdminMetaData = async () => {
    const touristCount = await prisma.user.count({ where: { role: Role.TOURIST } });
    const guideCount = await prisma.user.count({ where: { role: Role.GUIDE } });
    const adminCount = await prisma.user.count({ where: { role: Role.ADMIN } });

    const bookingCount = await prisma.booking.count();
    const paymentCount = await prisma.payment.count();

    const totalRevenue = await prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: PaymentStatus.PAID }
    });

    const barChartData = await getBarChartData();
    const pieChartData = await getPieChartData();

    return {
        touristCount,
        guideCount,
        adminCount,
        bookingCount,
        paymentCount,
        totalRevenue,
        barChartData,
        pieChartData
    };
};

// Bar chart data (bookings per month)
const getBarChartData = async () => {
    const bookingCountPerMonth = await prisma.$queryRaw`
        SELECT DATE_TRUNC('month', "createdAt") AS month,
        CAST(COUNT(*) AS INTEGER) AS count
        FROM "bookings"
        GROUP BY month
        ORDER BY month ASC
    `;

    return bookingCountPerMonth;
};

// Pie chart data (bookings by status)
const getPieChartData = async () => {
    const bookingStatusDistribution = await prisma.booking.groupBy({
        by: ['status'],
        _count: { id: true }
    });

    return bookingStatusDistribution.map(({ status, _count }) => ({
        status,
        count: Number(_count.id)
    }));
};

export const metaService = {
    metaData
};