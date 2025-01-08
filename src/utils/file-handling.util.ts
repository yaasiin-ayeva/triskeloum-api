import multer = require("multer");
import path = require("path");
import EnvConfig from "../config/environment.config";
import logger from "../config/logger.config";

const fs = require("fs");
const crypto = require('crypto');

export interface IGetMedia {
    type: string;
    caption: string;
    filename: string;
    location: string;
}

const file_upload = (filetypes: RegExp, destination: string = EnvConfig.UPLOAD_PATH) => {
    let upload = multer({
        storage: multer.diskStorage({
            destination: function (_req, _file, cb) {
                cb(null, destination);
            },

            filename: function (_req, file, cb) {
                const ext = path.extname(file.originalname);
                cb(null, crypto.randomBytes(16).toString("hex") + ext);
            },
        }),
        fileFilter: function (req, file, cb) {
            if (!req.file) {
                cb(new Error("File is required"));
                return;
            }

            let mimetype = filetypes.test(file.mimetype);

            let extname = filetypes.test(
                path.extname(file?.originalname).toLowerCase()
            );

            if (mimetype || extname) {
                return cb(null, true);
            }

            cb(new Error("File upload only supports the following filetypes - " + filetypes));
        },
    });

    return upload;
};

const file_upload_multi = (fields) => {
    let upload = multer({
        storage: multer.diskStorage({
            destination: (_req, file, cb) => {
                cb(null, fields.find((f) => f.name == file.fieldname).dest);
            },
            filename: (_req, file, cb) => {
                const ext = path.extname(file.originalname);
                cb(null, crypto.randomBytes(16).toString("hex") + ext);
            },
        }),
        fileFilter: (_req, file, cb) => {
            let filetypes = fields.find((f) => f.name == file.fieldname).ftypes;

            let mimetype = filetypes.test(file.mimetype);
            let extname = filetypes.test(
                path.extname(file.originalname).toLowerCase()
            );

            if (mimetype && extname) {
                return cb(null, true);
            }

            cb(new Error("File upload only supports the following filetypes - " + filetypes));
        },
    });

    return upload.fields(
        fields.map((f: any) => ({ name: f.name, maxCount: f.maxCount }))
    );
};

const clean_dir = (dir: string) => {
    try {
        fs.readdirSync(dir).forEach((file: any) => {
            if (!file.endsWith(".gitkeep")) {
                fs.unlinkSync(path.join(dir, file));
                logger.info(`${file} deleted`);
            }
        });
    } catch (err) {
        logger.error(err);
    }
}

const delete_files_by_extensions = (directory, extensions) => {
    try {
        if (!extensions || extensions.length === 0) {
            throw new Error("No provided file extensions.");
        }

        const files = fs.readdirSync(directory);

        for (const file of files) {
            const filePath = path.join(directory, file);

            if (extensions.includes(path.extname(file).toLowerCase())) {
                fs.unlinkSync(filePath);
                logger.info(`File ${file} successfully deleted.`);
            }
        }
    } catch (error) {
        logger.error("Error while deleting file by extension:", error);
    }
}

const check_or_create_dir = (dir: string) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true }, (err) => {
            if (err) {
                logger.error('Error while creating backup directory', err);
            } else {
                logger.info('Backup directory recursively created');
            }
        });
    }
}

const get_asset_urls = (req: any, multi = false): string | null | string[] => {
    const tab = req.files.map((f: any) => `${EnvConfig.URL}/${EnvConfig.UPLOAD_PATH}/${f.filename}`);
    if (tab.length === 0) {
        return null;
    }

    return multi ? tab : tab[0];
}

const get_asset_mime_types = (req: any, multi = false): string | null | string[] => {
    const tab = req.files.map((f: any) => f.mimetype);
    if (tab.length === 0) {
        return null;
    }

    return multi ? tab : tab[0];
}

const get_asset_originalnames = (req: any, multi = false): string | null | string[] => {
    const tab = req.files.map((f: any) => f.originalname);
    if (tab.length === 0) {
        return null;
    }

    return multi ? tab : tab[0];
}

const get_medias = (req: any): IGetMedia[] => {
    return req.files.map((f: any) => {
        return {
            type: f.mimetype,
            caption: f.originalname,
            filename: f.filename,
            location: `${EnvConfig.URL}/${EnvConfig.UPLOAD_PATH}/${f.filename}`,
        }
    })
}

export {
    file_upload,
    file_upload_multi,
    clean_dir,
    check_or_create_dir,
    delete_files_by_extensions,
    get_asset_urls,
    get_asset_mime_types,
    get_asset_originalnames,
    get_medias
}