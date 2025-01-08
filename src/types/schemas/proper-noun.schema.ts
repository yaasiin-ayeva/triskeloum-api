import * as Joi from 'joi';
import { AnySchema } from 'joi';

const proper_noun = (label: string = "This field"): AnySchema => {
  return Joi.string().min(1).max(70).pattern(/^[a-zA-ZàâäéèêëîïôöùûüÿçÀÂÄÉÈÊËÎÏÔÖÙÛÜŸÇ\-'\s]+$/).messages({
    'string.pattern.base': `${label} must be alphabetic and may include accented characters, spaces, hyphens, and apostrophes.`,
    'string.empty': `${label} is required`,
  });
}

export { proper_noun };
