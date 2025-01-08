import { Router } from "express";
import apiv1Router from "./v1/index.route.v1";
import corsMiddleware from "../middlewares/cors.middleware";

const apiRouter = Router();

apiRouter.use("/v1", corsMiddleware, apiv1Router);

export default apiRouter;