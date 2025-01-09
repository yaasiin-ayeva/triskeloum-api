import { DeepPartial, EntityManager, EntityTarget, FindOptionsWhere, ILike, Repository, SelectQueryBuilder, UpdateResult } from "typeorm";
import { JoinTableOption } from "../types/types";
import { AppDataSource } from "../config/database.config";

export type Condition = {
    field: string;
    operator: '=' | '!=' | '>' | '>=' | '<' | '<=' | 'LIKE' | 'IN';
    value: any;
};

export type WhereCondition = {
    type: 'AND' | 'OR';
    conditions: Array<Condition | WhereCondition>;
};

export default class BaseService<T> {

    protected readonly repo: Repository<T>;
    protected readonly entityManager: EntityManager;

    constructor(model: EntityTarget<T>) {
        this.repo = AppDataSource.getRepository(model);
        this.entityManager = AppDataSource.manager;
    }

    protected async create(data: T | DeepPartial<T>) {
        return await this.repo.save(data);
    }

    async findAll(): Promise<T[]> {
        return await this.repo.find();
    }

    async findById(id: number): Promise<T | null> {
        return await this.repo.findOne({
            where: { id: id } as unknown as FindOptionsWhere<T>
        });
    }

    async findByIds(ids: number[]): Promise<T[]> {
        return await this.repo.createQueryBuilder()
            .where("id IN (:...ids)", { ids })
            .getMany();
    }

    async findOneByName(name: string, fieldName: string = 'name', applyCaseSensitive = false): Promise<T | null> {
        const whereClause = applyCaseSensitive ? { [fieldName]: name } : { [fieldName]: ILike(name) };
        return await this.repo.findOne({ where: whereClause as unknown as FindOptionsWhere<T> });
    }

    async findManyByField(value: any, fieldName: string): Promise<T[]> {
        return await this.repo.find({ where: { [fieldName]: value } as unknown as FindOptionsWhere<T> });
    }

    async addNew(data: T | DeepPartial<T>): Promise<T> {
        return await this.create(data);
    }

    async update(id: number, data: Partial<T> | any): Promise<T | null> {

        const updateResult: UpdateResult = await this.repo.update(id, data);

        if (updateResult.affected && updateResult.affected > 0) {
            return await this.findById(id);
        } else {
            return null;
        }
    }

    async delete(id: number): Promise<boolean> {
        const entityToDelete = await this.findById(id);
        if (!entityToDelete) return false;

        await this.repo.remove(entityToDelete);
        return true;
    }

    async count(): Promise<number> {
        return await this.repo.count();
    }

    async wipe(): Promise<boolean> {

        await this.repo
            .createQueryBuilder()
            .delete()
            .execute();

        return true;
    }

    async bulkCreate(data: any[], queryRunner: any) {
        try {
            return await queryRunner.manager.createQueryBuilder()
                .insert()
                .into(this.repo.target)
                .values(data)
                .execute();
        } catch (err) {
            throw new Error(`Error when inserting ${this.repo.target} batch, check details below ${err}`);
        }
    }

    async prepareQueryRunner() {
        return this.repo.manager.connection.createQueryRunner();
    }

    protected async listData(
        page: number = 1,
        limit: number = 10,
        keyword: string,
        sortOrder: 'asc' | 'desc',
        sortBy: string,
        searchColumns: string[],
        joinOptions: JoinTableOption[] = [],
        whereConditions: WhereCondition | null = null,
        selectColumns: string[] = [],
        callback?: (obj: any) => any
    ) {
        const start = (page - 1) * limit;
        let queryBuilder = this.repo.createQueryBuilder(this.repo.metadata.tableName);

        if (selectColumns && selectColumns.length > 0) {
            queryBuilder = queryBuilder.select(selectColumns);
        }

        const totalQuery = queryBuilder.getCount();
        const recordsTotal = await totalQuery;

        let recordsFiltered = recordsTotal;

        if (joinOptions && joinOptions.length > 0) {
            for (const joinOption of joinOptions) {
                if (joinOption.implicit && joinOption.implicit === true) {
                    queryBuilder.leftJoin(`${joinOption.mainTable}.${joinOption.joinField}`, joinOption.referencedTable);
                } else {
                    queryBuilder.leftJoinAndSelect(`${joinOption.mainTable}.${joinOption.joinField}`, joinOption.referencedTable);
                }
            }
        }

        if (keyword && searchColumns && searchColumns.length > 0) {
            queryBuilder.where(searchColumns.map(column => `${column} ILIKE :search`).join(' OR '), { search: `%${keyword}%` });
            recordsFiltered = await queryBuilder.getCount();
        }

        if (whereConditions) {
            this.applyWhereConditions(queryBuilder, whereConditions);
            if (!keyword || searchColumns.length === 0) {
                recordsFiltered = await queryBuilder.getCount();
            }
        }

        if (sortBy && sortOrder) {
            queryBuilder.orderBy({ [sortBy]: sortOrder === 'asc' ? 'ASC' : 'DESC' });
        }

        queryBuilder.skip(start).take(limit);

        const data = await queryBuilder.getMany();

        if (callback) {
            data.forEach(async (obj: any, index: number) => { data[index] = callback(obj) });
        }

        const totalPages = Math.ceil(recordsFiltered / limit);

        return { totalPages, recordsTotal, recordsFiltered, data };
    }

    private applyWhereConditions(queryBuilder: SelectQueryBuilder<any>, whereConditions: WhereCondition) {
        const buildCondition = (condition: Condition | WhereCondition): string => {
            if ('conditions' in condition) {
                const subConditions = condition.conditions.map(buildCondition).join(` ${condition.type} `);
                return `(${subConditions})`;
            } else {
                const { field, operator } = condition;
                if (operator === 'IN') {
                    return `${field} ${operator} (:...${field.replace('.', '_')})`;
                } else {
                    return `${field} ${operator} :${field.replace('.', '_')}`;
                }
            }
        };

        const conditionString = buildCondition(whereConditions);
        const parameters = whereConditions.conditions.reduce((params, condition) => {
            if ('conditions' in condition) {
                condition.conditions.forEach(subCondition => {
                    if (!('conditions' in subCondition)) {
                        params[subCondition.field.replace('.', '_')] = subCondition.value;
                    }
                });
            } else {
                params[condition.field.replace('.', '_')] = condition.value;
            }
            return params;
        }, {});

        queryBuilder.andWhere(conditionString, parameters);
    }

}