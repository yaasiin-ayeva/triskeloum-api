import { Router } from "express";
import UserController from "../../controllers/User.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
const userController = new UserController();
const userRouter = Router();

userRouter.get(
    '/users',
    authMiddleware,
    // restrictTo([ROLE.admin]),
    userController.getUsersHandler
);

userRouter.get(
    '/users/search',
    authMiddleware,
    userController.searchUsersHandler
);

userRouter.get(
    '/levels',
    userController.getLevelsHandler
)

export default userRouter;