import { NextFunction, Request, Response } from "express";
import multer = require("multer");
import EnvConfig from "../config/environment.config";
import logger from "../config/logger.config";
import { clean_dir } from "../utils/file-handling.util";
import ErrorResponse from "../utils/errorResponse.util";
import { extname, join } from "path";

// TODO Work on thumbnails

const uploadKey = EnvConfig.UPLOAD_KEY;
const thumbFolder = EnvConfig.THUMB_PATH;

const NO_FILE_FOUND = "No file found";
const SOMETHING_WENT_WRONG = "Something went wrong";

export const SHEETS_ALLOWED_FORMATS = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
];

export const PICTURES_ALLOWED_FORMATS = [
    'image/jpeg',  // .jpg, .jpeg
    'image/png',   // .png
    'image/gif',   // .gif
    'image/webp',  // .webp
    'image/bmp',   // .bmp
];

const DEFAULT_THUMBNAILS: IThumbnails[] = [
    { width: 200, height: 200, quality: 100, folder: `${thumbFolder}/200x200` },
    { width: 500, height: 500, quality: 100, folder: `${thumbFolder}/500x500` }
];

export type TUPloadArgs = {
    isFileRequired?: boolean;
    allowedFormats?: string[];
    fileSizeLimit?: number;
    multi?: boolean | false;
    fieldname?: string;
    maxNumberOfFiles?: number;
    thumbnails?: IThumbnails[];
    defaultThumbnails?: boolean;
    destination?: string
    callback?: (() => void) | null;
}

export interface IThumbnails {
    width: number;
    height: number;
    quality?: number;
    folder?: string;
}

export interface IFileUpload {
    filename: string;
    path: string;
    mimetype: string;
    size: number;
    originalname: string;
    thumbnails?: string[];
}

export default function uploadMiddleware(data: TUPloadArgs) {

    data.destination = data.destination ?? EnvConfig.UPLOAD_PATH;
    data.isFileRequired = data.isFileRequired ?? true;
    data.allowedFormats = data.allowedFormats ?? SHEETS_ALLOWED_FORMATS;
    data.fileSizeLimit = data.fileSizeLimit ?? 1024 * 1024 * 1024 * 10;
    data.multi = data.multi ?? false;
    data.callback = data.callback ?? null;
    data.fieldname = data.fieldname ?? (uploadKey ?? "file");
    data.maxNumberOfFiles = data.maxNumberOfFiles ?? 1;
    data.thumbnails = data.thumbnails ?? [];
    data.thumbnails = data.defaultThumbnails ? DEFAULT_THUMBNAILS : data.thumbnails;

    // const uploads: IFileUpload[] = [];

    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const multerStorage = multer.diskStorage({
                destination: (_req, _file, cb) => {
                    cb(null, data.destination);
                },
                filename: (_req, file, cb) => {
                    const fileUniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9);
                    const extension = extname(file.originalname);
                    cb(null, file.fieldname + '-' + fileUniqueName + extension);
                }
            });

            const upload = data.multi
                ? multer({ storage: multerStorage, limits: { fileSize: data.fileSizeLimit } }).array(data.fieldname)
                : multer({ storage: multerStorage, limits: { fileSize: data.fileSizeLimit } }).single(data.fieldname);

            upload(req, res, async (error: any) => {
                if (error) {
                    logger.error(`${SOMETHING_WENT_WRONG} while uploading file(s): ${error.message}`);
                    return next(new ErrorResponse(`${SOMETHING_WENT_WRONG} while uploading file(s): ${error.message}`, 400));
                }

                let files: Express.Multer.File[] = [];
                if (data.multi) {
                    if (Array.isArray(req.files)) {
                        files = req.files as Express.Multer.File[];
                    } else {
                        for (const key in req.files) {
                            if (req.files.hasOwnProperty(key)) {
                                files = files.concat(req.files[key] as Express.Multer.File[]);
                            }
                        }
                    }
                } else {
                    if (req.file) {
                        files.push(req.file);
                    }
                }

                if (data.isFileRequired && files.length === 0) {
                    logger.error(NO_FILE_FOUND);
                    next(new ErrorResponse(NO_FILE_FOUND, 400));
                    return;
                }

                if (files.length > data.maxNumberOfFiles) {
                    files.forEach(file => clean_dir(file.path));
                    logger.error(`Exceeded max number of files: ${data.maxNumberOfFiles}`);
                    next(new ErrorResponse(`Exceeded max number of files: ${data.maxNumberOfFiles}`, 400));
                    return;
                }

                for (const file of files) {
                    if (file && !data.allowedFormats.includes(file.mimetype)) {
                        clean_dir(file.path);
                        logger.error('Incorrect File Format');
                        next(new ErrorResponse('Incorrect File Format', 400));
                        return;
                    }

                    if (file) {
                        logger.info(`File ${file.originalname} saved successfully on the server at ${file.path}`);

                        const uploadedFile: IFileUpload = {
                            filename: file.filename,
                            path: file.path,
                            mimetype: file.mimetype,
                            size: file.size,
                            originalname: file.originalname,
                            thumbnails: []
                        }

                        // for (const thumbnail of data.thumbnails) {
                        //     const thumbnailPath = join(data.destination,  thumbnail.folder, file.filename);

                        //     await sharp(file.path)
                        //         .resize(thumbnail.width, thumbnail.height)
                        //         .toFile(thumbnailPath)
                        //         .catch(err => {
                        //             logger.error(`Error generating thumbnail: ${err.message}`);
                        //             next(new ErrorResponse(`Error generating thumbnail: ${err.message}`, 500));
                        //             return;
                        //         }).then(() => {
                        //             uploadedFile.thumbnails.push(thumbnailPath);
                        //         })
                        //     logger.info(`Thumbnail generated at ${thumbnailPath}`);
                        // }
                    }
                }

                if (data.callback) {
                    data.callback();
                }

                req.files = files;
                // req["uploads"] = uploads;

                next();
            });
        } catch (e) {
            logger.error(`${SOMETHING_WENT_WRONG} ${e.message}`);
            next(e);
        }
    };
};
