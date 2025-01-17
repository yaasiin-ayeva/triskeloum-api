import { Category } from "../models/Category.model";
import BaseService from "./Base.service";

export default class CategoryService extends BaseService<Category> {

    private static instance: CategoryService;

    constructor() {
        if (CategoryService.instance) {
            return CategoryService.instance;
        }
        super(Category);
        CategoryService.instance = this;
    }

    async findAllWithCourseCounts({ page: page = 1, limit: limit = 10 }): Promise<{ pagination: any, data: Category[] }> {

        const offset = (page - 1) * limit;

        const queryBuilder = this.repo.createQueryBuilder("categories")
            .leftJoin("categories.courses", "courses")
            .loadRelationCountAndMap("categories.courses_count", "categories.courses");

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

    async findByIdWithCounts(id: number): Promise<Category> {
        const data = await this.repo.createQueryBuilder("categories")
            .leftJoin("categories.courses", "courses")
            .loadRelationCountAndMap("categories.courses_count", "categories.courses")
            .where("categories.id = :id", { id })
            .getOne();

        return data;
    }

}