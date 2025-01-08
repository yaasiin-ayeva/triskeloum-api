import logger from "../config/logger.config";

export function scheduleCrons() {

    const crons = [
    ];

    if (crons.length > 0) {
        logger.info('Scheduling crons...');
    }

    for (const cron of crons) {
        try {
            cron();
            logger.info(`${cron.name} scheduling completed`);
        } catch (error) {
            logger.error(`Error when running ${cron.name}: ${error}`);
        }
    }

    logger.info('Crons scheduling run completed.');
}