import { prisma } from "../../shared/prisma";
import { ICreateListingPayload } from "./listing.interface";
import { AppError } from "../../errors/AppError";
import httpStatus from "http-status";
import { v2 as cloudinary } from "cloudinary";
import { JwtPayload } from "jsonwebtoken";

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

const getAllListings = async () => {
    return await prisma.listing.findMany({
        include: { guide: true, bookings: true, reviews: true }
    });
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

const deleteListing = async (id: string) => {
    return await prisma.listing.delete({
        where: { id }
    });
};

export const listingService = {
    createListing,
    getAllListings,
    getSingleListing,
    updateListing,
    deleteListing
};