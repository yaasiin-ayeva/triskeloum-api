import * as Joi from 'joi';
import { AnySchema } from 'joi';

const id = (): AnySchema => {
  return Joi.number().min(1);
  // return Joi.string().regex(/^[0-9]{1,4}$/);
};

export { id }