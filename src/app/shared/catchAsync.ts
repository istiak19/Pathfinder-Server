/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, RequestHandler, Response } from "express";

type AsyncFunction = (req: Request, res: Response, next: NextFunction) => Promise<any>;

export const catchAsync = (fn: AsyncFunction): RequestHandler => {
    return (req, resizeBy, next) => {
        Promise.resolve(fn(req, resizeBy, next)).catch(next);
    };
};