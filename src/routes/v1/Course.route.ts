import { Router } from "express";
import CourseController from "../../controllers/Course.controller";
import authMiddleware from "../../middlewares/auth.middleware";

const courseController = new CourseController();
const courseRouter = Router();

courseRouter.get(
    '/categories',
    authMiddleware,
    courseController.getCategories
);

courseRouter.get(
    '/categories/:id',
    authMiddleware,
    courseController.getCategory
);

courseRouter.get(
    '/categories/:id/courses',
    authMiddleware,
    courseController.getCoursesByCategory
);

courseRouter.get(
    '/courses/:id',
    authMiddleware,
    courseController.getCourse
);

courseRouter.get(
    '/courses',
    authMiddleware,
    courseController.getCourses
);


export default courseRouter;