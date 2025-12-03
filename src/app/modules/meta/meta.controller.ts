import httpStatus from 'http-status';
import { Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import sendResponse from "../../shared/sendResponse";
import { metaService } from './meta.service';
import { catchAsync } from '../../shared/catchAsync';



const metaData = catchAsync(async (req: Request, res: Response) => {

    const user = req.user as JwtPayload;
    const result = await metaService.metaData(user);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Meta data retrieved successfully!",
        data: result
    })
});

export const metaController = {
    metaData
};