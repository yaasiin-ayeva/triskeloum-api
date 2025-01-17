import { Level } from "../models/Level.model";
import CategoryService from "../services/Category.service";
import CourseService from "../services/Course.service";
import LevelService from "../services/Level.service";
import { BaseController } from "./Base.controller";

export default class CourseController extends BaseController<CourseService> {

    private readonly _categoryService: CategoryService;
    private readonly _levelService: LevelService;

    constructor() {
        super(new CourseService(), 'course');
        this._categoryService = new CategoryService();
        this._levelService = new LevelService();
    }

    public getCategories = async (req, res, next) => {
        try {

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            if (page < 1 || limit < 1 || limit > 100) {
                return this.apiResponse(res, 400, "Invalid pagination parameters", null);
            }

            const data = await this._categoryService.findAllWithCourseCounts({ page, limit });
            return this.apiResponse(res, 200, "Categories fetched successfully", data);
        } catch (e) {
            next(e);
        }
    }

    public getCategory = async (req, res, next) => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return this.apiResponse(res, 400, "Invalid category", null);
            }
            const data = await this._categoryService.findByIdWithCounts(id);
            return this.apiResponse(res, 200, "Category fetched successfully", data);
        } catch (e) {
            next(e);
        }
    }

    public getCourse = async (req, res, next) => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return this.apiResponse(res, 400, "Invalid course", null);
            }
            const data = await this.service.findById(id);
            return this.apiResponse(res, 200, "Course fetched successfully", data);
        } catch (e) {
            next(e);
        }
    }

    public getCourses = async (req, res, next) => {
        try {
            const data = await this.service.findAll();
            return this.apiResponse(res, 200, "Courses Successfully fetched", data);
        } catch (e) {
            next(e);
        }
    }

    public getMyCourses = async (req, res, next) => {
        try {

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            if (page < 1 || limit < 1 || limit > 100) {
                return this.apiResponse(res, 400, "Invalid pagination parameters", null);
            }

            let level: Level;

            if (req.user) {
                level = req.user.level;
            } else {
                const publicLevel = await this._levelService.findPublicLevel();
                if (!publicLevel) {
                    return this.apiResponse(res, 404, "No public level available", null);
                }
                level = publicLevel;
            }

            const result = await this.service.findAndGroupByLevel(level, {
                page,
                limit,
                includeSections: true
            });

            return this.apiResponse(res, 200, "Courses Successfully fetched", result);
        } catch (e) {
            next(e);
        }
    }

    public getCoursesByCategory = async (req, res, next) => {
        try {

            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return this.apiResponse(res, 400, "Invalid category", null);
            }

            const category = await this._categoryService.findById(id);

            if (!category) {
                return this.apiResponse(res, 404, "Category Not Found", null);
            }

            const data = await this.service.findByCategory(category.id);
            return this.apiResponse(res, 200, "Courses Successfully fetched", data);

        } catch (e) {
            next(e);
        }
    }
}