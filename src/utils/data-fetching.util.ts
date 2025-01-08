import { EntityTarget } from "typeorm";
import { AppDataSource } from "../config/database.config";


/**
 * Fetches data for a datatable and applies filters and sorting based on the request parameters.
 *
 * @param {any} req - the request object
 * @param {EntityTarget<any>} model - the entity model to fetch data from
 * @param {string[]} columns - the columns to retrieve data for (default: [])
 * @param {string[]} searchColumns - the columns to apply search filter on (default: [])
 * @param {(obj: any) => void} [callback] - a callback function to apply on each data object
 * @param {{ mainTableAlias: string; joinTableAlias: string; join: string }[]} [joinOptions] - the join options for left joins (default: [])
 * @param {string} [modelAlias] - the alias for the model (default: null)
 * @return {Promise<{ draw: number, recordsTotal: number, recordsFiltered: number, data: any[] }>} the fetched data along with total and filtered record counts
 */
const fetch_data_for_datatable = async (
    req: any,
    model: EntityTarget<any>,
    columns: string[] = [],
    searchColumns: string[] = [],
    callback?: (obj: any) => void,
    joinOptions: { mainTableAlias: string; joinTableAlias: string; join: string }[] = [],
    modelAlias: string = null,
    whereConditions: any = null
) => {

    const draw = parseInt(req.body.draw);
    const start = parseInt(req.body.start);
    const length = parseInt(req.body.length);
    const searchValue = req.body.search.value;
    const order = req.body.order[0];
    const orderColumnName = columns[parseInt(order.column)];
    const orderDir = order.dir;

    let queryBuilder = null;

    if (joinOptions && joinOptions.length > 0 && !modelAlias) {
        throw new Error('Join options used, you need to provide the model alias');
    }

    queryBuilder = model ?
        AppDataSource.getRepository(model).createQueryBuilder(modelAlias) :
        AppDataSource.getRepository(model).createQueryBuilder();

    // Total records query construction
    const totalQuery = queryBuilder.getCount();
    const recordsTotal = await totalQuery;

    let recordsFiltered = recordsTotal;

    // apply left join
    if (joinOptions && joinOptions.length > 0) {
        for (const joinOption of joinOptions) {
            queryBuilder.leftJoinAndSelect(joinOption.join, joinOption.joinTableAlias);
        }
    }

    // Apply search filter
    if (searchValue && searchColumns && searchColumns.length > 0) {
        queryBuilder.where(searchColumns.map(column => `${column} ILIKE :search`).join(' OR '), { search: `%${searchValue}%` });
        recordsFiltered = await queryBuilder.getCount();
    }

    // Apply WHERE conditions if provided
    if (whereConditions) {
        queryBuilder.andWhere(whereConditions);
        if (!searchValue || searchColumns.length === 0) {
            recordsFiltered = await queryBuilder.getCount();
        }
    }

    // Apply order filter
    if (orderColumnName && orderDir) {
        queryBuilder.orderBy({ [orderColumnName]: orderDir === 'asc' ? 'ASC' : 'DESC' });
    }

    queryBuilder.skip(start).take(length);

    const data = await queryBuilder.getMany();

    let counter = 0;

    data.forEach(obj => {
        obj.___no___ = ++counter;
    })

    // Apply callback if provided
    if (callback) {
        data.forEach(async (obj: any) => callback(obj));
    }

    return { draw, recordsTotal, recordsFiltered, data };
};

export { fetch_data_for_datatable };