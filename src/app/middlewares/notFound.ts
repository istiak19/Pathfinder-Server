import httpStatus from "http-status";
import { Request, Response } from "express";

const notFound = (req: Request, res: Response) => {
    res.status(httpStatus.NOT_FOUND).json({
        success: false,
        message: "Route not found",
        error: {
            path: req.originalUrl,
            method: req.method,
        },
    });
};

export default notFound;