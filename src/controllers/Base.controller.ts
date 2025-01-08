import NodeCache = require("node-cache");
import BaseService from "../services/Base.service";
import { Response } from "express";
import { parse_joi_error } from "../utils/error-validator-parser.util";
import ErrorResponse from "../utils/errorResponse.util";
import { PaginationParams } from "../dtos/common.dto";
import CacheConfig from "../config/cache.config";

export class BaseController<S extends BaseService<any>> {

    protected readonly service: S;
    private readonly _cache: any;
    protected readonly cachePrefix: string;

    constructor(service: S, cachePrefix: string) {
        this.service = service;
        this._cache = new NodeCache(CacheConfig);
        this.cachePrefix = cachePrefix;
    }

    protected apiResponse(res: Response, status: number, message: String, payload: any = {}) {
        return res.status(status).json({
            success: status < 400,
            message: message,
            payload: payload
        });
    }

    protected autoAssignDateTypeProperty(req: any, props: string[], plage: 'query' | 'params' | 'body' = 'body',) {
        props.forEach((prop: string) => {
            if (req[plage][prop]) {
                req[plage][prop] = new Date(req[plage][prop]);
            }
        })
    }

    protected autoParseJsonProperty(req: any, props: string[], nullify = false, plage: 'query' | 'params' | 'body' = 'body') {
        props.forEach((prop: string) => {
            if (req[plage][prop]) {
                req[plage][prop] = JSON.parse(req[plage][prop]);
                if (nullify) {
                    req[plage][prop] = req[plage][prop] ? req[plage][prop] : null;
                }
            }
        })
    }

    protected validateRequestArgs(req: any, schema: any, plage: 'query' | 'params' | 'body' = 'body') {
        const { error, parsedErrors } = parse_joi_error(schema, req, plage);
        if (error) {
            throw new ErrorResponse(error.message, 400, parsedErrors);
        }
    }

    protected getSearchParams(req: any): PaginationParams {

        const page = req.body.page ? req.body.page : 1;
        const limit = req.body.limit ? req.body.limit : 25;
        const keyword = (req.body.keyword && req.body.keyword.length > 0) ? req.body.keyword : null;
        const sortOrder = req.body.sortOrder ? req.body.sortOrder : 'desc';
        const sortBy = req.body.sortBy ? req.body.sortBy : 'created_at';

        return {
            page, limit, keyword, sortOrder, sortBy
        }
    }

    protected getFromCache(key: string) {
        return this._cache.get(key);
    }

    protected async putInCache(key: string, data: any) {
        await this._cache.set(key, data);
    }

    protected async deleteFromCache(key: string) {
        await this._cache.del(key);
    }

    protected async resetCache() {
        this._cache.flushAll();
    }
}