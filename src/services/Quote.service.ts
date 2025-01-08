import { ILike } from "typeorm";
import { Quote } from "../models/Quote.model";
import BaseService from "./Base.service";
import ErrorResponse from "../utils/errorResponse.util";

export default class QuoteService extends BaseService<Quote> {

    private static instance: QuoteService;

    constructor() {
        if (QuoteService.instance) {
            return QuoteService.instance;
        }
        super(Quote);
        QuoteService.instance = this;
    }

    public async findByAuthor(author: string): Promise<Quote[]> {
        return this.repo.find({
            where: { author: ILike(`%${author}%`) }
        });
    }

    public async findRandom(limit: number = 1): Promise<Quote[]> {
        return this.repo
            .createQueryBuilder("quotes")
            .orderBy("RANDOM()")
            .limit(limit)
            .getMany();
    }

    public async search(query: string): Promise<Quote[]> {
        return this.repo.find({
            where: [
                { content: ILike(`%${query}%`) },
                { author: ILike(`%${query}%`) },
            ]
        });
    }

    public async createQuote(quoteData: Partial<Quote>): Promise<Quote> {
        const quote = this.repo.create(quoteData);
        await this.validateQuote(quote);
        return this.repo.save(quote);
    }

    async updateQuote(id: number, quoteData: Partial<Quote>): Promise<Quote> {
        const quote = await this.repo.findOneOrFail({ where: { id } });
        Object.assign(quote, quoteData);
        await this.validateQuote(quote);
        return this.repo.save(quote);
    }

    private async validateQuote(quote: Quote): Promise<void> {
        if (!quote.content) {
            throw new ErrorResponse("Quote content is required", 400);
        }
        if (!quote.author) {
            throw new ErrorResponse("Quote author is required", 400);
        }
        if (quote.content.length > 1000) {
            throw new ErrorResponse("Quote content must be less than 1000 characters", 400);
        }
    }
}