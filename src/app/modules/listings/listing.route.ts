import { Router } from "express";
import { listingController } from "./listing.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { createListingZodSchema, updateListingZodSchema } from "./listing.validation";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "@prisma/client";
import { multerUpload } from "../../../config/multer.config";

const router = Router();

router.post("/", checkAuth(Role.ADMIN, Role.GUIDE), multerUpload.array("files"), validateRequest(createListingZodSchema), listingController.createListing);
router.get("/", listingController.getAllListings);
router.get("/:id", checkAuth(Role.ADMIN, Role.GUIDE, Role.TOURIST), listingController.getSingleListing);
router.patch("/:id", checkAuth(Role.GUIDE), multerUpload.array("files"), validateRequest(updateListingZodSchema), listingController.updateListing);
router.patch("/status/:id", checkAuth(Role.GUIDE, Role.ADMIN), listingController.updateListingStatus);
router.delete("/:id", checkAuth(Role.GUIDE), listingController.deleteListing);

export const listingRoutes = router;