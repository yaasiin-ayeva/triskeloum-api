import * as Joi from 'joi';
import { id, url } from '../types/schemas';

const getDataTable = {
    body: Joi.object().keys({
        page: Joi.number().integer().min(1).default(1).label('Page'),
        limit: Joi.number().integer().min(1).default(25).label('Limit'),
        keyword: Joi.string().allow('').optional().max(255).label('Keyword'),
        sortOrder: Joi.string().valid('asc', 'desc').default('asc').label('Sort Order'),
        sortBy: Joi.string().default('id').label('Sort By'),
    }),
};

export {
    getDataTable,
}