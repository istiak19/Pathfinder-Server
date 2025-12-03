import { uploadToCloudinary } from "./cloudinary.config";
import { UploadApiResponse } from "cloudinary";

export const uploadMultipleFiles = async (
    files: Express.Multer.File[],
    folder: string = "uploads"
): Promise<string[]> => {
    const uploadPromises: Promise<UploadApiResponse>[] = files.map(file => {
        const uniqueFileName =
            Math.random().toString(36).substring(2) +
            "-" +
            Date.now() +
            "-" +
            file.originalname.replace(/\s+/g, "-").toLowerCase();

        return uploadToCloudinary(file.buffer, `${folder}/${uniqueFileName}`);
    });

    const results = await Promise.all(uploadPromises);
    return results.map(res => res.secure_url);
};