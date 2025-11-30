import { Request, Response } from "express";
import httpStatus from "http-status";
import { listingService } from "./listing.service";
import sendResponse from "../../shared/sendResponse";
import { catchAsync } from "../../shared/catchAsync";
import { JwtPayload } from "jsonwebtoken";
import pick from "../../helpers/pick";
import { listingFilterableFields } from "./listing.constant";

const createListing = catchAsync(async (req: Request, res: Response) => {
    const decoded = req.user as JwtPayload;
    const image = (req.files as Express.Multer.File[]).map(file => file.path);
    let bodyData: any = req.body;
    if (req.body.data) {
        bodyData = JSON.parse(req.body.data);
    }

    const payload = {
        images: image,
        ...bodyData
    };
    const listing = await listingService.createListing(decoded, payload);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Listing created successfully",
        data: listing
    });
});

const getAllListings = catchAsync(async (req: Request, res: Response) => {
    const filters = pick(req.query, listingFilterableFields) // searching , filtering
    const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]) // pagination and sorting
    const listings = await listingService.getAllListings(filters, options);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Listings fetched successfully",
        data: listings
    });
});

const getSingleListing = catchAsync(async (req: Request, res: Response) => {
    const decoded = req.user as JwtPayload;
    const listing = await listingService.getSingleListing(decoded, req.params.id);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Listing fetched successfully",
        data: listing
    });
});

const updateListing = catchAsync(async (req: Request, res: Response) => {
    const decoded = req.user as JwtPayload;
    const image = (req.files as Express.Multer.File[]).map(file => file.path);
    let bodyData: any = req.body;
    if (req.body.data) {
        bodyData = JSON.parse(req.body.data);
    }

    const payload = {
        images: image,
        ...bodyData
    };

    const listing = await listingService.updateListing(decoded, req.params.id, payload);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Listing updated successfully",
        data: listing
    });
});

const deleteListing = catchAsync(async (req: Request, res: Response) => {
    const decoded = req.user as JwtPayload;
    const listing = await listingService.deleteListing(decoded, req.params.id);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Listing deleted successfully",
        data: listing
    });
});

export const listingController = {
    createListing,
    getAllListings,
    getSingleListing,
    updateListing,
    deleteListing
};