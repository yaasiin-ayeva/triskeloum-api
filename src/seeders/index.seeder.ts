import logger from "../config/logger.config";
import seedCategories from "./category.seeder";
import seedCourses from "./course.seeder";
import seedCrm from "./crm.seeder";
import seedLevels from "./level.seeder";
import seedQuotes from "./quote.seeder";
import seedDefaultUser from "./user.seeder";

export async function runSeeders() {

    const seeders = [
        seedDefaultUser,
        seedLevels,
        seedCategories,
        seedCourses,
        seedQuotes,
        seedCrm
    ];

    for (const seeder of seeders) {
        try {
            await seeder();
            logger.info(`${seeder.name} seeding completed`);
        } catch (error) {
            logger.error(`Error when running ${seeder.name}: ${error}`);
        }
    }
}