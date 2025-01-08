import { Router } from "express";
import authRouter from "./Auth.route";
import userRouter from "./User.route";
import courseRouter from "./Course.route";

const apiV1Router = Router();

apiV1Router.use('/auth', authRouter);
apiV1Router.use('/app',
    userRouter,
    courseRouter,
);

export default apiV1Router;