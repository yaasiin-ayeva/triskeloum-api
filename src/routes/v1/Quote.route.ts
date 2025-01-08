import { Router } from "express";
import QuoteController from "../../controllers/Quote.controller";
import authMiddleware from "../../middlewares/auth.middleware";

const quoteController = new QuoteController();
const quoteRouter = Router();

quoteRouter.get(
    '/quotes/random',
    // authMiddleware,
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