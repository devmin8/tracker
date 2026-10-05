export type Pagination = {
	page: number;
	pageSize: number;
	pageCount: number;
	total: number;
};

export function parsePage(value: string | null | undefined): number {
	const page = Number(value);

	return Number.isSafeInteger(page) && page >= 1 ? page : 1;
}

export function paginate(requestedPage: number, total: number, pageSize: number): Pagination {
	const pageCount = Math.max(1, Math.ceil(total / pageSize));

	return {
		page: Math.min(Math.max(requestedPage, 1), pageCount),
		pageSize,
		pageCount,
		total
	};
}

export function pageOffset({ page, pageSize }: Pick<Pagination, 'page' | 'pageSize'>): number {
	return (page - 1) * pageSize;
}
