import { Router } from "express";
import UserController from "../../controllers/User.controller";
import authMiddleware from "../../middlewares/auth.middleware";
import restrictTo from "../../middlewares/rbac.middleware";
import { ROLE } from "../../types/enums";

const userController = new UserController();

const userRouter = Router();

userRouter.get(
    '/users',
    authMiddleware,
    restrictTo([ROLE.admin]),
    // userController.getUsersHandler
);

export default userRouter;