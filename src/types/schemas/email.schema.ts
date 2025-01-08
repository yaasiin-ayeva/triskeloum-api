import * as Joi from 'joi';
import { AnySchema } from 'joi';

const email = (): AnySchema => {
  return Joi.string().lowercase().email();
};

export { email }