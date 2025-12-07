import sendResponse from "../../shared/sendResponse";
import httpStatus from "http-status";
import { bookingService } from "./booking.service";
import { catchAsync } from "../../shared/catchAsync";
import { Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import pick from "../../helpers/pick";
import { bookingFilterableFields } from "./booking.constant";

const createBooking = catchAsync(async (req: Request, res: Response) => {
    const decoded = req.user as JwtPayload;
    const booking = await bookingService.createBooking(decoded, req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Booking request submitted",
        data: booking,
    });
});

const getMyBookings = catchAsync(async (req: Request, res: Response) => {
    const decoded = req.user as JwtPayload;
    const filters = pick(req.query, bookingFilterableFields) // searching , filtering
    const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]) // pagination and sorting
    const result = await bookingService.getMyBookings(decoded, filters, options);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "My bookings",
        meta: result.meta,
        data: result.data,
    });
});

const getSingleMyBookings = catchAsync(async (req: Request, res: Response) => {
    const decoded = req.user as JwtPayload;
    const result = await bookingService.getSingleMyBookings(decoded, req.params.id);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "My booking",
        data: result,
    });
});

const getGuideBookings = catchAsync(async (req: Request, res: Response) => {
    const decoded = req.user as JwtPayload;
    const filters = pick(req.query, bookingFilterableFields) // searching , filtering
    const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]) // pagination and sorting
    const result = await bookingService.getGuideBookings(decoded, filters, options);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Guide bookings",
        meta: result.meta,
        data: result.data,
    });
});

const getAllBookings = catchAsync(async (req: Request, res: Response) => {
    const decoded = req.user as JwtPayload;
    const filters = pick(req.query, bookingFilterableFields) // searching , filtering
    const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]) // pagination and sorting
    const result = await bookingService.getAllBookings(decoded, filters, options);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "All bookings",
        meta: result.meta,
        data: result.data,
    });
});

const updateBookingStatus = catchAsync(async (req: Request, res: Response) => {
    const decoded = req.user as JwtPayload;
    const booking = await bookingService.updateBookingStatus(decoded, req.params.id, req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Booking updated successfully",
        data: booking,
    });
});

const cancelBooking = catchAsync(async (req: Request, res: Response) => {
    const decoded = req.user as JwtPayload;
    const booking = await bookingService.cancelBooking(decoded, req.params.id);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Booking cancelled",
        data: booking,
    });
});

export const bookingController = {
    createBooking,
    getMyBookings,
    getSingleMyBookings,
    getGuideBookings,
    getAllBookings,
    updateBookingStatus,
    cancelBooking
};
