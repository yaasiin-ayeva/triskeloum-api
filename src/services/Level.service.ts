import { Level } from "../models/Level.model";
import BaseService from "./Base.service";

export default class LevelService extends BaseService<Level> {

    private static instance: LevelService;

    constructor() {
        if (LevelService.instance) {
            return LevelService.instance;
        }
        super(Level);
        LevelService.instance = this;
    }

    public async findPublicLevel(): Promise<Level | null> {
        return await this.repo.findOne({
            where: {
                is_public: true
            }
        });
    }

    async findAllWithCounts(): Promise<Level[]> {
        return await this.repo.createQueryBuilder("levels")
            .leftJoin("levels.users", "users")
            .leftJoin("levels.courses", "courses")
            .loadRelationCountAndMap("levels.users_count", "levels.users")
            .loadRelationCountAndMap("levels.courses_count", "levels.courses")
            .getMany();
    }
}