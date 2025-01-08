// import { exec, spawn } from "child_process";
import logger from "../config/logger.config";
import { check_or_create_dir } from "./file-handling.util";

const cron = require('node-cron');

const backup_db = (db_name?: string, archive_path?: string) => {

    check_or_create_dir(archive_path);

    // TODO: Add backup process

    logger.info('Backup process started');
}

const restore_db = async (db_name?: string, archive_path?: string) => {

    check_or_create_dir(archive_path);

    // TODO: Add restore process

    logger.info('Backup Restore process started');
}

const schedule_backup = () => {
    backup_db();
    cron.schedule('00 20 * * *', () => {
        backup_db();
    });
}

const awaiter = async (limit: number = 4500) => {
    await new Promise(resolve => setTimeout(resolve,
        Math.floor(Math.random() * limit)
    ));
}

export {
    awaiter,
    backup_db,
    restore_db,
    schedule_backup,
}