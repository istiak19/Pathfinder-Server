import sendResponse from "../../shared/sendResponse";
import httpStatus from "http-status";
import { bookingService } from "./booking.service";
import { catchAsync } from "../../shared/catchAsync";
import { Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";

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

//   getMyBookings: catchAsync(async (req, res) => {
//   const result = await bookingService.getMyBookings(req.user.userId);

//   sendResponse(res, {
//     success: true,
//     statusCode: httpStatus.OK,
//     message: "My bookings",
//     data: result,
//   });
// }),

// getGuideBookings: catchAsync(async (req, res) => {
//   const result = await bookingService.getGuideBookings(req.user.userId);

//   sendResponse(res, {
//     success: true,
//     statusCode: httpStatus.OK,
//     message: "Guide bookings",
//     data: result,
//   });
// }),

// getAllBookings: catchAsync(async (req, res) => {
//   const result = await bookingService.getAllBookings();

//   sendResponse(res, {
//     success: true,
//     statusCode: httpStatus.OK,
//     message: "All bookings",
//     data: result,
//   });
// }),

// cancelBooking: catchAsync(async (req, res) => {
//   const result = await bookingService.cancelBooking(req.user, req.params.id);

//   sendResponse(res, {
//     success: true,
//     statusCode: httpStatus.OK,
//     message: "Booking cancelled",
//     data: result,
//   });
// }),
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

//   updateBookingStatus: catchAsync(async (req, res) => {
//     const decoded = req.user; // guide/admin
//     const result = await bookingService.updateBookingStatus(decoded, req.params.id, req.body.status);

//     sendResponse(res, {
//       success: true,
//       statusCode: httpStatus.OK,
//       message: "Booking updated successfully",
//       data: result,
//     });
//   })
// };

export const bookingController = {
    createBooking,
    cancelBooking
};
