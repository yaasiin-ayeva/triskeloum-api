import { Router } from "express";
import LevelController from "../../controllers/Level.controller";

const levelController = new LevelController();
const levelRouter = Router();

levelRouter.get(
    '/levels',
    levelController.getLevels
);

export default levelRouter;