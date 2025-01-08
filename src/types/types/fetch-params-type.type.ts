export type FetchParams = {
    page: number;
    limit: number;
    conditions: Record<string, any>[];
    orConditions?: Record<string, any>[];
}