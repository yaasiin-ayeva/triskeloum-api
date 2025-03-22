import logger from "../config/logger.config";
import { Room } from "../models/crm/Room.model";
import { User } from "../models/User.model";
import RoomService from "../services/Room.service";
import UserService from "../services/User.service";
import { ROLE } from "../types/enums";

const seedCrm = async () => {
    try {

        const userService = new UserService();

        const users_sample = [
            {
                firstname: 'John',
                lastname: 'Doe',
                email: 'john@doe.com',
                phone: '1234567890',
                password: 'password123',
                role: ROLE.user
            },
            {
                firstname: 'Jane',
                lastname: 'Doe',
                email: 'jane@doe.com',
                phone: '9876543210',
                password: 'password123',
                role: ROLE.user
            },
            {
                firstname: 'Mat',
                lastname: 'Doe',
                email: 'mat@doe.com',
                phone: '5555555555',
                password: 'password123',
                role: ROLE.user
            }
        ];

        const users = [];

        for (const user of users_sample) {
            let existingUser = await userService.isUserExists(user.email, user.phone);

            if (!existingUser) {
                const newUser = new User(user);
                const createdUser = await newUser.save();
                users.push(createdUser);
            } else {
                users.push(existingUser);
                logger.info(`User with email ${user.email} and phone ${user.phone} already exists in the database.`);
            }
        }

        const roomService = new RoomService();

        const room_samples = [
            {
                name: 'Room 1',
                users: [users[0], users[1]],
                isDraft: false
            },
            {
                name: 'Room 2',
                users: [users[0], users[2]],
                isDraft: false
            },
            {
                name: 'Room 3',
                users: [users[1], users[2]],
                isDraft: false
            }
        ];

        for (const room of room_samples) {
            let existingRoom = await roomService.findOneByName(room.name);

            if (!existingRoom) {
                const newRoom = new Room(room);
                await newRoom.save();
            }
        }

        logger.info('Default rooms seeded successfully.');
    } catch (error) {
        logger.error('Error seeding default room:', error);
    }
};

export default seedCrm;