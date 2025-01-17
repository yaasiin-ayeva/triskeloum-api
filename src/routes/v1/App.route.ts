import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import AppController from "../../controllers/App.controller";
import restrictTo from "../../middlewares/rbac.middleware";
import { ROLE } from "../../types/enums";

const appController = new AppController();
const appRouter = Router();

appRouter.post(
    '/info',
    authMiddleware,
    restrictTo([ROLE.admin]),
    appController.updateAppInfoHandler
);

appRouter.post(
    '/location',
    authMiddleware,
    restrictTo([ROLE.admin]),
    appController.updateAppLocationHandler
);

appRouter.post(
    '/status',
    authMiddleware,
    restrictTo([ROLE.admin]),
    appController.updateAppStatusHandler
);

appRouter.post(
    '/currency',
    authMiddleware,
    restrictTo([ROLE.admin]),
    appController.updateAppCurrencyHandler
);

appRouter.post(
    '/email',
    authMiddleware,
    restrictTo([ROLE.admin]),
    appController.updateAppEmailConfigHandler
);

appRouter.post(
    '/links',
    authMiddleware,
    restrictTo([ROLE.admin]),
    appController.updateMobileAppLinksHandler
);

appRouter.post(
    '/social',
    authMiddleware,
    restrictTo([ROLE.admin]),
    appController.updateSocialMediaLinksHandler
);

appRouter.get(
    '/settings',
    authMiddleware,
    restrictTo([ROLE.admin]),
    appController.getAppSettingsHandler
);

appRouter.post(
    '/send-email',
    authMiddleware,
    restrictTo([ROLE.admin]),
    appController.createEmailHandler
);

export default appRouter;