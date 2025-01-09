require('dotenv').config();

const authorizedDomainsParser = (value: string) => {
    const authorizedDomains = value.split(',');
    return authorizedDomains;
}

const EnvConfig = {

    env: String(process.env.NODE_ENV),

    APP_NAME: String(process.env.APP_NAME),

    API_NAME: String(process.env.API_NAME),
    API_PORT: Number(process.env.API_PORT),
    API_VERSION: String(process.env.API_VERSION),
    URL: String(process.env.URL),

    AUTHORIZED: authorizedDomainsParser(String(process.env.AUTHORIZED)),

    WINDOWS_MS: Number(process.env.WINDOWS_MS),
    MAX: Number(process.env.MAX),
    STANDARD_HEADERS: Number(process.env.STANDARD_HEADERS) === 1 ? true : false,
    LEGACY_HEADERS: Number(process.env.LEGACY_HEADERS) === 1 ? true : false,

    STD_TTL: Number(process.env.STD_TTL),
    CHECK_PERIOD: Number(process.env.CHECK_PERIOD),
    MAX_KEYS: Number(process.env.MAX_KEYS),
    DELETE_ON_EXPIRE: Number(process.env.DELETE_ON_EXPIRE) === 1 ? true : false,

    JWT_KEY: String(process.env.JWT_KEY),
    JWT_DEV_EXPIRE: String(process.env.JWT_DEV_EXPIRE),
    JWT_PROD_EXPIRE: String(process.env.JWT_PROD_EXPIRE),
    JWT_REMEMBER_ME_EXPIRE: String(process.env.JWT_REMEMBER_ME_EXPIRE),

    PWD_RESET_ACCESS_TOKEN_DURATION: Number(process.env.PWD_RESET_ACCESS_TOKEN_DURATION),
    REFRESH_TOKEN_DURATION: Number(process.env.REFRESH_TOKEN_DURATION),
    RESET_PASSWORD_CLIENT_URL: String(process.env.RESET_PASSWORD_CLIENT_URL),

    DB_TYPE: String(process.env.DB_TYPE),
    DB_HOST: String(process.env.DB_HOST),
    DB_PORT: Number(process.env.DB_PORT),
    DB_USER: String(process.env.DB_USER),
    DB_PASS: String(process.env.DB_PASS),
    DB_NAME: String(process.env.DB_NAME),
    DB_SYNC: Number(process.env.DB_SYNC) === 1 ? true : false,
    DB_LOGGING: Number(process.env.DB_LOGGING) === 1 ? true : false,
    DB_CACHE: Number(process.env.DB_CACHE) === 1 ? true : false,
    DB_CONNEXION_LIMIT: Number(process.env.DB_CONNEXION_LIMIT),

    TWILIO_ACCOUNT_SID: String(process.env.TWILIO_ACCOUNT_SID),
    TWILIO_AUTH_TOKEN: String(process.env.TWILIO_AUTH_TOKEN),
    VERIFICATION_SID: String(process.env.VERIFICATION_SID),
    SENDGRID_API_KEY: String(process.env.SENDGRID_API_KEY),
    FROM_EMAIL: String(process.env.FROM_EMAIL),
    ENABLE_EMAIL: Number(process.env.ENABLE_EMAIL) === 1 ? true : false,
    ENABLE_SMS: Number(process.env.ENABLE_SMS) === 1 ? true : false,

    LOGS_PATH: String(process.env.LOGS_PATH),
    LOGS_TOKEN: String(process.env.LOGS_TOKEN),

    UPLOAD_PATH: String(process.env.UPLOAD_PATH),
    PUBLIC_PATH: String(process.env.PUBLIC_PATH),
    THUMB_PATH: String(process.env.THUMB_PATH),
    UPLOAD_MAX_FILE_SIZE: Number(process.env.UPLOAD_MAX_FILE_SIZE),
    UPLOAD_MAX_FILES: Number(process.env.UPLOAD_MAX_FILES),

    UPLOAD_WILDCARDS: String(process.env.UPLOAD_WILDCARDS),
    UPLOAD_KEY: String(process.env.UPLOAD_KEY),

    DEFAULT_USER_EMAIL: String(process.env.DEFAULT_USER_EMAIL),
    DEFAULT_USER_USERNAME: String(process.env.DEFAULT_USER_USERNAME),
    DEFAULT_USER_PHONE: String(process.env.DEFAULT_USER_PHONE),
    DEFAULT_USER_PASSWORD: String(process.env.DEFAULT_USER_PASSWORD),
    DEFAULT_USER_FIRST_NAME: String(process.env.DEFAULT_USER_FIRST_NAME),
    DEFAULT_USER_LAST_NAME: String(process.env.DEFAULT_USER_LAST_NAME),

    DEFAULT_EMAIL_PROVIDER: String(process.env.DEFAULT_EMAIL_PROVIDER) as 'nodemailer' | 'sendgrid',
    SMTP_SERVICE: String(process.env.SMTP_SERVICE),
    SMTP_HOST: String(process.env.SMTP_HOST),
    SMTP_PORT: Number(process.env.SMTP_PORT),
    SMTP_SECURE: Number(process.env.SMTP_SECURE) === 1 ? true : false,
    SMTP_USER: String(process.env.SMTP_USER),
    SMTP_PASS: String(process.env.SMTP_PASS),
}

export default EnvConfig;