import EnvConfig from "./environment.config";

const swaggerJSDoc = require('swagger-jsdoc');

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: EnvConfig.API_NAME,
            description: EnvConfig.APP_NAME,
            version: EnvConfig.API_VERSION,
        },
        servers: [
            {
                url: EnvConfig.URL,
            },
        ],
    },
    apis: ['src/controllers/*.ts'],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export default swaggerSpec;