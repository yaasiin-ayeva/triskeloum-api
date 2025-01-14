import { Router } from "express";
import UserController from "../../controllers/User.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const userController = new UserController();

const authRouter = Router();

authRouter.post('/signin', userController.loginHandler);
authRouter.post('/signup', userController.signupHandler);
authRouter.post('/signout', userController.signoutHandler);
authRouter.post('/refresh-token', userController.refreshTokenHandler);

authRouter.post('/forgot-password', userController.forgotPasswordHandler);
authRouter.post('/reset-password/:token', userController.resetPasswordHandler);

authRouter.post('/update-password', authMiddleware, userController.updatePasswordHandler);
authRouter.post('/update-user-info', authMiddleware, userController.updateUserInfoHandler);

export default authRouter;