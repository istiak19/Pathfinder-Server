import multer from "multer";

// Memory storage দিয়ে Multer middleware
export const multerUpload = multer({ storage: multer.memoryStorage() });