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

    async findAllWithCourseCounts(): Promise<Category[]> {
        const data = await this.repo.createQueryBuilder("categories")
            .leftJoin("categories.courses", "courses")
            .loadRelationCountAndMap("categories.courses_count", "categories.courses")
            .getMany();

        return data;
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