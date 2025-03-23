import { Router } from "express";
import authRouter from "./Auth.route";
import userRouter from "./User.route";
import courseRouter from "./Course.route";
import quoteRouter from "./Quote.route";
import appRouter from "./App.route";
import crmRouter from "./Crm.route";

const apiV1Router = Router();

apiV1Router.use('/auth', authRouter);
apiV1Router.use('/app',
    appRouter,
    userRouter,
    courseRouter,
    quoteRouter,
    crmRouter,
);

export default apiV1Router;