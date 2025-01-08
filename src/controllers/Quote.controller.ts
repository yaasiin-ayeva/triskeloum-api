import QuoteService from "../services/Quote.service";
import { NextFunction, Request, Response } from "express";
import { BaseController } from "./Base.controller";

export default class QuoteController extends BaseController<QuoteService> {

    constructor() {
        super(new QuoteService(), 'quote');
    }

    public getAllQuotesHandler = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await this.service.findAll();
            return this.apiResponse(res, 200, "Quotes fetched successfully", data);
        } catch (e) {
            next(e);
        }
    }

    public getQuoteHandler = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return this.apiResponse(res, 400, "Invalid quote", null);
            }
            const data = await this.service.findById(id);
            if (!data) {
                return this.apiResponse(res, 404, "Quote not found", null);
            }
            return this.apiResponse(res, 200, "Quote fetched successfully", data);
        } catch (e) {
            next(e);
        }
    }

    public getRandomQuoteHandler = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const limit = parseInt(req.query.limit as string) || 1;
            const data = await this.service.findRandom(limit);
            return this.apiResponse(res, 200, "Random quote fetched successfully", data);
        } catch (e) {
            next(e);
        }
    }
}