import { Token } from "../models/Token.model";
import { TOKEN_TYPE } from "../types/enums";
import BaseService from "./Base.service";

export default class TokenService extends BaseService<Token> {

    private static instance: TokenService;

    constructor() {
        if (TokenService.instance) {
            return TokenService.instance;
        }
        super(Token);
        TokenService.instance = this;
    }

    public static getInstance(): TokenService {
        return new TokenService();
    }

    public async createToken(token: Partial<Token>): Promise<Token> {
        return this.create(token);
    }

    public async getToken(tokenString: string, type: TOKEN_TYPE, isExpired: boolean = false, isValid: boolean = true, eager: boolean = false): Promise<Token> {

        let token = null;
        const qb = this.repo.createQueryBuilder("tokens");
        if (eager) qb.leftJoinAndSelect("tokens.user", "user");

        let query = qb.where("tokens.token = :token", { token: tokenString })
            .andWhere("tokens.type = :type", { type })

        if (isExpired) {
            query.andWhere("tokens.expires_at < :now", { now: new Date() });
        } else {
            query.andWhere("tokens.expires_at > :now", { now: new Date() });
        }

        if (isValid) {
            query.andWhere("tokens.is_valid = :isValid", { isValid });
        }

        token = await query.getOne();
        if (token && eager) token.user = token.user.getInfo();
        return token;
    }

    public async findTokenByToken(token: string): Promise<Token> {
        return this.findOneByName(token, "token");
    }

    public async findTokensByUser(userId: string): Promise<Token[]> {
        return this.findManyByField(userId, "user_id");
    }

    public async invalidateToken(token: Token): Promise<Token> {
        token.is_valid = false;
        return this.update(token.id, token);
    }

    public async deleteToken(token: Token): Promise<boolean> {
        return this.delete(token.id);
    }

    public async deleteTokenById(tokenId: number): Promise<boolean> {
        return this.delete(tokenId);
    }

    public async deleteTokensByUser(userId: string): Promise<boolean> {
        const tokens = await this.findTokensByUser(userId);
        if (!tokens || tokens.length === 0) return false;

        tokens.forEach(async (token) => {
            await this.deleteToken(token);
        });

        return true;
    }
}