import logger from "../config/logger.config";
import { Level } from "../models/Level.model";
import LevelService from "../services/Level.service";

const seedLevels = async () => {

    const levelService = new LevelService();
    try {

        const levels: Level[] = [
            new Level({ name: 'Level 0', rank: 0 }),
            new Level({ name: 'Level 1', rank: 1 }),
            new Level({ name: 'Level 2', rank: 2 }),
            new Level({ name: 'Level 3', rank: 3 }),
            new Level({ name: 'Level 4', rank: 4 }),
            new Level({ name: 'Level 5', rank: 5 }),
            new Level({ name: 'Level 6', rank: 6 }),
            new Level({ name: 'Level 7', rank: 7 }),
            new Level({ name: 'Level 8', rank: 8 }),
            new Level({ name: 'Level 9', rank: 9 }),
            new Level({ name: 'Level 10', rank: 10 }),
            new Level({ name: 'Guest level', rank: -1, is_public: true }),
        ];

        for (const level of levels) {
            const existingLevel = await levelService.findOneByName(level.name);
            if (!existingLevel) {
                await level.save();
            }
        }

    } catch (error) {
        logger.error('Error seeding levels:', error);
    }
};

export default seedLevels;