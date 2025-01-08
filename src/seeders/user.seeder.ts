import EnvConfig from "../config/environment.config";
import logger from "../config/logger.config";
import { User } from "../models/User.model";
import { ROLE } from "../types/enums";

const seedDefaultUser = async () => {
    try {

        const existingUser = await User.isUserExists(EnvConfig.DEFAULT_USER_EMAIL, EnvConfig.DEFAULT_USER_PHONE);

        if (!existingUser) {

            const defaultUser = new User({
                firstname: EnvConfig.DEFAULT_USER_FIRST_NAME,
                lastname: EnvConfig.DEFAULT_USER_LAST_NAME,
                email: EnvConfig.DEFAULT_USER_EMAIL,
                phone: EnvConfig.DEFAULT_USER_PHONE,
                password: EnvConfig.DEFAULT_USER_PASSWORD,
                role: ROLE.admin
            });

            await defaultUser.save();
        } else {
            logger.info('Default user already exists in the database.');
        }
    } catch (error) {
        logger.error('Error seeding default user:', error);
    }
};

export default seedDefaultUser;