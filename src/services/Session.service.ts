import { Session } from "../models/Session.model";
import { TOKEN_TYPE } from "../types/enums";
import BaseService from "./Base.service";

export default class SessionService extends BaseService<Session> {

    private static instance: SessionService;

    constructor() {
        if (SessionService.instance) {
            return SessionService.instance;
        }
        super(Session);
        SessionService.instance = this;
    }

    public static getInstance(): SessionService {
        return new SessionService();
    }

    public async createSession(session: Partial<Session>): Promise<Session> {
        return this.create(session);
    }

    public async getSession(tokenString: string, type: TOKEN_TYPE, isExpired: boolean = false, isValid: boolean = true, eager: boolean = false): Promise<Session> {

        let session = null;
        const qb = this.repo.createQueryBuilder("sessions");
        if (eager) qb.leftJoinAndSelect("sessions.user", "user");

        let query = qb.where("sessions.token = :token", { token: tokenString })
            .andWhere("sessions.type = :type", { type })

        if (isExpired) {
            query.andWhere("sessions.expires_at < :now", { now: new Date() });
        } else {
            query.andWhere("sessions.expires_at > :now", { now: new Date() });
        }

        if (isValid) {
            query.andWhere("sessions.is_valid = :isValid", { isValid });
        }

        session = await query.getOne();
        if (session && eager) session.user = session.user.getInfo();
        return session;
    }

    public async findSessionByToken(token: string): Promise<Session> {
        return this.findOneByName(token, "token");
    }

    public async findSessionsByUser(userId: string): Promise<Session[]> {
        return this.findManyByField(userId, "user_id");
    }

    public async invalidateSession(session: Session): Promise<Session> {
        session.is_valid = false;
        return this.update(session.id, session);
    }

    public async deleteSession(session: Session): Promise<boolean> {
        return this.delete(session.id);
    }

    public async deleteSessionById(sessionId: number): Promise<boolean> {
        return this.delete(sessionId);
    }

    public async deleteSessionsByUser(userId: string): Promise<boolean> {
        const sessions = await this.findSessionsByUser(userId);
        if (!sessions || sessions.length === 0) return false;

        sessions.forEach(async (session) => {
            await this.deleteSession(session);
        });

        return true;
    }
}