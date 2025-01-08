import { Course } from "../models/Course.model";
import BaseService from "./Base.service";

export default class CourseService extends BaseService<Course> {

    private static instance: CourseService;

    constructor() {
        if (CourseService.instance) {
            return CourseService.instance;
        } else {
            super(Course);
            CourseService.instance = this;
        }
    }

    public async findByCategory(categoryId: number) {
        return await this.repo.createQueryBuilder("courses")
            .leftJoinAndSelect("courses.sections", "sections")
            .leftJoin("courses.category", "category")
            .where("courses.category = :category", { category: categoryId })
            .getMany();
    }
}