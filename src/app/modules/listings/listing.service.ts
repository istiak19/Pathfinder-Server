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

    const {
        searchTerm,
        language,
        priceRange,
        priceMin,
        priceMax,
        ...filterData
    } = params;

    const andConditions: Prisma.ListingWhereInput[] = [];

    if (searchTerm) {
        andConditions.push({
            OR: listingSearchableFields.map(field => ({
                [field]: {
                    contains: searchTerm,
                    mode: "insensitive",
                },
            })),
        });
    }

    if (Object.keys(filterData).length > 0) {
        andConditions.push({
            AND: Object.keys(filterData).map(key => ({
                [key]: {
                    equals: (filterData as any)[key],
                },
            })),
        });
    }

    if (language) {
        const lang = language.toLowerCase();
        andConditions.push({
            guide: {
                languages: {
                    has: lang,
                },
            },
        });
    }

    let min = priceMin ? Number(priceMin) : undefined;
    let max = priceMax ? Number(priceMax) : undefined;

    if (priceRange) {
        const [rawMin, rawMax] = priceRange.split("-");

        if (rawMin !== undefined && rawMin !== "") min = Number(rawMin);
        if (rawMax !== undefined && rawMax !== "") max = Number(rawMax);
    }

    if (min !== undefined || max !== undefined) {
        andConditions.push({
            price: {
                gte: min,
                lte: max,
            },
        });
    }

    const whereConditions: Prisma.ListingWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

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
        data: result,
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