import * as Joi from 'joi';
import { AnySchema } from 'joi';

// const password = (type: 'user' | 'smtp'): AnySchema => {
//     const types = [
//         {
//             type: 'user',
//             schema: Joi.string().min(8).max(64)
//         },
//         {
//             type: 'smtp',
//             schema: Joi.string().regex(/^[a-z-0-9\-]{2,12}\.[a-z]{2,16}\.[a-z]{2,8}$/i)
//         }
//     ];
//     return types.filter(h => h.type === type).slice().shift().schema;
// };


const password = (type: 'user-weak' | 'user' | 'smtp'): AnySchema => {
    const types = [
        {
            type: 'user-weak',
            schema: Joi.string().min(8).max(64),
        },
        {
            type: 'user',
            schema: Joi.string()
                .min(8) // Minimum 8 characters
                .max(64) // Maximum 64 characters
                .regex(/[A-Z]/, 'uppercase letter') // At least one uppercase letter
                .regex(/[a-z]/, 'lowercase letter') // At least one lowercase letter
                .regex(/\d/, 'digit') // At least one digit
                .regex(/[!@#$%^&*(),.?":{}|<>]/, 'special character') // At least one special character
                .required()
                .messages({
                    'string.empty': 'Password is required',
                    'string.min': 'Password must contain at least {#limit} characters',
                    'string.max': 'Password must not exceed {#limit} characters',
                    'string.pattern.name': 'Password must include at least one {#name}',
                    'any.required': 'Password is required'
                })
        },
        {
            type: 'smtp',
            schema: Joi.string().regex(/^[a-z-0-9\-]{2,12}\.[a-z]{2,16}\.[a-z]{2,8}$/i)
        }
    ];
    return types.filter(h => h.type === type).slice().shift().schema;
};

export { password }