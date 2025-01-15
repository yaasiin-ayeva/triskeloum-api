import { Router } from "express";
import QuoteController from "../../controllers/Quote.controller";
import { authMiddleware, optionalAuthMiddleware } from "../../middlewares/auth.middleware";

const quoteController = new QuoteController();
const quoteRouter = Router();

quoteRouter.get(
    '/quotes/random',
    // authMiddleware,
    optionalAuthMiddleware,
    quoteController.getRandomQuoteHandler
);

quoteRouter.get(
    '/quotes/:id',
    authMiddleware,
    quoteController.getQuoteHandler
);

quoteRouter.get(
    '/quotes',
    authMiddleware,
    quoteController.getAllQuotesHandler
);


export default quoteRouter;