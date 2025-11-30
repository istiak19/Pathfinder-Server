import httpStatus from 'http-status';
import { Request, Response } from 'express';
import { catchAsync } from '../../shared/catchAsync';
import { userService } from './user.service';
import sendResponse from '../../shared/sendResponse';

const createUser = catchAsync(async (req: Request, res: Response) => {
    const user = await userService.createUser(req.body);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "User created successfully",
        data: user
    });
});

export const userController = {
    createUser,
};