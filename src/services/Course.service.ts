import { Course } from "../models/Course.model";
import { Level } from "../models/Level.model";
import BaseService from "./Base.service";

export default class CourseService extends BaseService<Course> {

    private static instance: CourseService;

    constructor() {
        if (CourseService.instance) {
            return CourseService.instance;
        }
        super(Course);
        CourseService.instance = this;
    }

    public async findByCategory(categoryId: number) {
        return await this.repo.createQueryBuilder("courses")
            .leftJoinAndSelect("courses.sections", "sections")
            .leftJoin("courses.category", "category")
            .where("courses.category = :category", { category: categoryId })
            .getMany();
    }

    public async findAndGroupByLevel(
        targetLevel: Level,
        options: {
            page?: number;
            limit?: number;
            includeSections?: boolean;
        } = {}
    ) {
        const {
            page = 1,
            limit = 10,
            includeSections = false
        } = options;

        const offset = (page - 1) * limit;

        const queryBuilder = this.repo.createQueryBuilder("courses")
            .leftJoinAndSelect("courses.level", "level")
            .where("level.rank <= :targetRank", { targetRank: targetLevel.rank })
            .orderBy("level.rank", "DESC")
            .addGroupBy("level.id")
            .addGroupBy("courses.id");

        if (includeSections) {
            queryBuilder.leftJoinAndSelect("courses.sections", "sections")
                .addGroupBy("sections.id");
        }

        const [data, total] = await Promise.all([
            queryBuilder
                .take(limit)
                .skip(offset)
                .getMany(),
            queryBuilder.getCount()
        ]);

        return {
            pagination: {
                currentPage: page,
                itemsPerPage: limit,
                totalItems: total,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page < Math.ceil(total / limit),
                hasPreviousPage: page > 1
            },
            data
        };
    }
}