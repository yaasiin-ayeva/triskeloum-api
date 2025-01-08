import "reflect-metadata";
import { DataSource } from "typeorm";
import EnvConfig from "./environment.config";
import { ENVIRONMENT } from "../types/enums";

const paths = {
    entities: {
        test: "test/models/**/*.ts",
        development: "src/models/**/*.ts",
        production: "dist/models/**/*.js"
    },
    migrations: {
        test: "test/migrations/**/*.ts",
        development: "src/migrations/**/*.ts",
        production: "dist/migrations/**/*.js"
    },
}

export const config = {
    type: EnvConfig.DB_TYPE as any,
    host: EnvConfig.DB_HOST,
    port: EnvConfig.DB_PORT,
    username: EnvConfig.DB_USER,
    password: EnvConfig.DB_PASS,
    database: EnvConfig.DB_NAME,
    synchronize: EnvConfig.env === ENVIRONMENT.development ? EnvConfig.DB_SYNC : false,
    logging: EnvConfig.DB_LOGGING,
    entities: [paths.entities[EnvConfig.env]],
    migrations: [paths.migrations[EnvConfig.env]],
    subscribers: [],
    cache: EnvConfig.DB_CACHE,
    extra: {
        connectionLimit: EnvConfig.DB_CONNEXION_LIMIT,
    },
}

export const AppDataSource = new DataSource(config);