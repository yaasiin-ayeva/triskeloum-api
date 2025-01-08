import logger from "../config/logger.config";
import { Category } from "../models/Category.model";
import CategoryService from "../services/Category.service";

const seedCategories = async () => {

    const categoryService = new CategoryService();
    try {

        const categories = [
            new Category({ title: 'Personnal Development' }),
            new Category({ title: 'Productivity' }),
            new Category({ title: 'Psychology' }),
            new Category({ title: 'Self Development' }),
            new Category({ title: 'Social Skills' }),
        ]

        for (const category of categories) {
            const existingCategory = await categoryService.findOneByName(category.title, 'title');
            if (!existingCategory) {
                await category.save();
            }
        }

    } catch (error) {
        logger.error('Error seeding categories:', error);
    }
};

export default seedCategories;
