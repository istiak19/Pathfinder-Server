import { ZodObject, ZodRawShape } from "zod";

type AnyZodObject = ZodObject<ZodRawShape>;
import { NextFunction, Request, Response } from "express";

export const validateRequest = (zodSchema: AnyZodObject) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (req.body?.data) {
            req.body = JSON.parse(req.body.data);
        };
        req.body = await zodSchema.parseAsync(req.body);
        next();
    } catch (error) {
        next(error);
    }
};

// import { ZodObject, ZodRawShape } from "zod";
// import { NextFunction, Request, Response } from "express";

// type AnyZodObject = ZodObject<ZodRawShape>;

// export const validateRequest = (zodSchema: AnyZodObject) => async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         req.body = await zodSchema.parseAsync(req.body); // সরাসরি validate
//         next();
//     } catch (error) {
//         next(error);
//     }
// };