import { prisma } from "../../shared/prisma";
import { ICreateListingPayload } from "./listing.interface";
import { AppError } from "../../errors/AppError";
import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";
import calculatePagination, { IOptions } from "../../helpers/paginationHelper";
import { FilterParams } from "../../../constants";
import { ListingStatus, Prisma } from "@prisma/client";
import { listingSearchableFields } from "./listing.constant";

const createListing = async (token: JwtPayload, payload: ICreateListingPayload) => {
    const isExistUser = await prisma.user.findUnique({
        where: {
            email: token.email
        }
    });

    if (!isExistUser) {
        throw new AppError(httpStatus.BAD_REQUEST, "User not found");
    };

    const listing = await prisma.listing.create({
        data: payload
    });

    return listing;
};

const getAllListings = async (params: FilterParams, options: IOptions) => {
    const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options);
    const { searchTerm, priceMin, priceMax, language, ...filterData } = params;

    const andConditions: Prisma.ListingWhereInput[] = [];

    // Text Search (title, description, itinerary)
    if (searchTerm) {
        andConditions.push({
            OR: listingSearchableFields.map(field => ({
                [field]: {
                    contains: searchTerm,
                    mode: "insensitive",
                },
            })),
        });
    };

    // Normal Listing Filters (city, category, status, maxGroupSize)
    if (Object.keys(filterData).length > 0) {
        andConditions.push({
            AND: Object.keys(filterData).map(key => ({
                [key]: {
                    equals: (filterData as any)[key],
                },
            })),
        });
    };

    // Filter by Guide Language (guide.languages array)
    if (language) {
        andConditions.push({
            guide: {
                languages: {
                    has: language,
                },
            },
        });
    };

    //  Price Range Filter
    if (priceMin || priceMax) {
        andConditions.push({
            price: {
                gte: priceMin ? Number(priceMin) : undefined,
                lte: priceMax ? Number(priceMax) : undefined,
            },
        });
    };

    // Final Prisma Where
    const whereConditions: Prisma.ListingWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

    // Query Database
    const result = await prisma.listing.findMany({
        skip,
        take: limit,
        where: whereConditions,
        orderBy: { [sortBy]: sortOrder },
        include: {
            guide: true,
            bookings: true,
            reviews: true,
        },
    });

    const total = await prisma.listing.count({ where: whereConditions });
    const totalPages = Math.ceil(total / limit);

    return {
        meta: { page, limit, total, totalPages },
        data: result
    };
};

const getSingleListing = async (token: JwtPayload, id: string) => {
    const isExistUser = await prisma.user.findUnique({
        where: {
            email: token.email
        }
    });

    if (!isExistUser) {
        throw new AppError(httpStatus.BAD_REQUEST, "User not found");
    };

    const listing = await prisma.listing.findUnique({
        where: { id },
        include: { guide: true, bookings: true, reviews: true }
    });

    if (!listing) throw new AppError(httpStatus.NOT_FOUND, "Listing not found");
    return listing;
};

const updateListing = async (token: JwtPayload, id: string, payload: Partial<ICreateListingPayload>, files?: Express.Multer.File[]) => {
    const isExistUser = await prisma.user.findUnique({
        where: {
            email: token.email
        }
    });

    if (!isExistUser) {
        throw new AppError(httpStatus.BAD_REQUEST, "User not found");
    };

    const isExistListing = await prisma.listing.findUnique({
        where: { id }
    });

    if (!isExistListing) {
        throw new AppError(httpStatus.BAD_REQUEST, "Listing not found");
    };

    return await prisma.listing.update({
        where: { id },
        data: payload,
    });
};

const updateListingStatus = async (token: JwtPayload, listingId: string, status: ListingStatus) => {
    const user = await prisma.user.findUnique({
        where: {
            email: token.email,
        }
    });

    if (!user) {
        throw new AppError(httpStatus.BAD_REQUEST, "User not found");
    }

    // 2. Permission check (only admin or guide)
    if (user.role !== "ADMIN" && user.role !== "GUIDE") {
        throw new AppError(httpStatus.FORBIDDEN, "You do not have permission to update listing status");
    }

    // 3. Listing exists?
    const listing = await prisma.listing.findUnique({
        where: { id: listingId }
    });

    if (!listing) {
        throw new AppError(httpStatus.BAD_REQUEST, "Listing not found");
    }

    // 4. Update only status
    const result = await prisma.listing.update({
        where: { id: listingId },
        data: {
            status,
        }
    });

    return result;
};

const deleteListing = async (token: JwtPayload, id: string) => {
    const isExistUser = await prisma.user.findUnique({
        where: {
            email: token.email
        }
    });

    if (!isExistUser) {
        throw new AppError(httpStatus.BAD_REQUEST, "User not found");
    };

    const isExistListing = await prisma.listing.findUnique({
        where: { id }
    });

    if (!isExistListing) {
        throw new AppError(httpStatus.BAD_REQUEST, "Listing not found");
    };

    return await prisma.listing.delete({
        where: { id }
    });
};

export const listingService = {
    createListing,
    getAllListings,
    getSingleListing,
    updateListing,
    updateListingStatus,
    deleteListing
};