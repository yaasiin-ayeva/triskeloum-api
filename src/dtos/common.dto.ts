export interface PaginationParams {
    page?: number;
    limit?: number;
    keyword?: string;
    sortOrder?: 'asc' | 'desc';
    sortBy?: string;
}

export interface PaginationDto<T> {
    data: T[];
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
}