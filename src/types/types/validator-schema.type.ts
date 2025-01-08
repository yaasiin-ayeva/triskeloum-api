import Joi = require("joi");

export type ValidatorSchema = {
    [key: string]: Joi.ObjectSchema<any>
};