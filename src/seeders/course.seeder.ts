import logger from "../config/logger.config";
import { Course } from "../models/Course.model";
import CourseService from "../services/Course.service";

const json = require("./json/courses.json");

const seedCourses = async () => {
    const courseService = new CourseService();
    try {

        const courses = json.courses.map((courseData: any) => { return new Course({ ...courseData }); });

        for (const course of courses) {
            const existingCourse = await courseService.findOneByName(course.title, 'title');
            if (!existingCourse) {
                await course.save();
            }
        }

    } catch (error) {
        logger.error('Error seeding courses:', error);
    }
};

export default seedCourses;
