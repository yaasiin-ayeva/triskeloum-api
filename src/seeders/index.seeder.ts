import logger from "../config/logger.config";
import seedLevels from "./level.seeder";
import seedDefaultUser from "./user.seeder";

export async function runSeeders() {

    const seeders = [
        seedDefaultUser,
        seedLevels,
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