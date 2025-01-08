import { Category } from "../models/Category.model";
import BaseService from "./Base.service";

export default class CategoryService extends BaseService<Category> {

    private static instance: CategoryService;

    constructor() {
        if (CategoryService.instance) {
            return CategoryService.instance;
        } else {
            super(Category);
            CategoryService.instance = this;
        }
    }

}