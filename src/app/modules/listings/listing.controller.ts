import { Request, Response } from "express";
import httpStatus from "http-status";
import { listingService } from "./listing.service";
import sendResponse from "../../shared/sendResponse";
import { catchAsync } from "../../shared/catchAsync";
import { JwtPayload } from "jsonwebtoken";
import pick from "../../helpers/pick";
import { listingFilterableFields } from "./listing.constant";
import { uploadMultipleFiles } from "../../../config/fileUpload.service";

const createListing = catchAsync(async (req: Request, res: Response) => {
    const decoded = req.user as JwtPayload;
    const images = req.files ? await uploadMultipleFiles(req.files as Express.Multer.File[], "listings") : [];

    let bodyData: any = req.body;
    if (req.body.data) bodyData = JSON.parse(req.body.data);

    const payload = { images, ...bodyData };
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
    const result = await listingService.getAllListings(filters, options);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Listings fetched successfully",
        meta: result.meta,
        data: result.data
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
    const images = req.files ? await uploadMultipleFiles(req.files as Express.Multer.File[], "listings") : [];

    let bodyData: any = req.body;
    if (req.body.data) bodyData = JSON.parse(req.body.data);

    const payload = { images, ...bodyData };;

    const listing = await listingService.updateListing(decoded, req.params.id, payload);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Listing updated successfully",
        data: listing
    });
});

const updateListingStatus = catchAsync(async (req, res) => {
    const decoded = req.user as JwtPayload;
    const updated = await listingService.updateListingStatus(decoded, req.params.id, req.body.status);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Listing status updated successfully",
        data: updated,
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
    updateListingStatus,
    deleteListing
};