import { AnySchema } from "joi";
import Joi = require("joi");

const url = (): AnySchema => {
  return Joi.string()
    .uri({ scheme: [/https?/] })
    // .min(10)
    // .max(2048)
    .messages({
      'string.uri': 'The URL must be a valid URI',
      'string.min': 'The URL must be at least 10 characters long',
      'string.max': 'The URL must be at most 2048 characters long',
      'string.empty': 'The URL is required',
    });
}

export { url }