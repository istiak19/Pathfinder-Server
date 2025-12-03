import { Router } from "express";
import { userController } from "./user.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "@prisma/client";
import { validateRequest } from "../../middlewares/validateRequest";
import { createUserZodSchema, } from "./user.validation";
import { multerUpload } from "../../../config/multer.config";

const router = Router();

router.post("/register", validateRequest(createUserZodSchema), userController.createUser);
router.get("/", checkAuth(Role.ADMIN), userController.getAllUsers);
router.get("/:id", checkAuth(Role.ADMIN, Role.GUIDE, Role.TOURIST), userController.getSingleUser);
router.patch(
    "/:id",
    checkAuth(Role.ADMIN, Role.GUIDE, Role.TOURIST),
    multerUpload.single("file"),
    userController.updateUser
);
router.delete("/:id", checkAuth(Role.ADMIN), userController.deleteUser);

export const userRoutes = router;