/**
 * Pagination utility functions
 * Provides consistent pagination across all services
 */

export interface PaginationOptions {
	page?: number
	limit?: number
	sort?: string
	order?: 'asc' | 'desc'
}

export interface PaginationMeta {
	page: number
	limit: number
	total: number
	totalPages: number
	hasNextPage: boolean
	hasPrevPage: boolean
}

export interface PaginatedResult<T> {
	data: T[]
	pagination: PaginationMeta
}

/**
 * Parse and validate pagination options from query parameters
 */
export const parsePaginationOptions = (
	query: any
): PaginationOptions => {
	const page = Math.max(1, parseInt(query.page || '1', 10) || 1)
	const limit = Math.min(
		100,
		Math.max(1, parseInt(query.limit || '10', 10) || 10)
	) // Max 100 items per page
	const sort = query.sort || 'createdAt'
	const order = query.order === 'asc' ? 'asc' : 'desc'

	return { page, limit, sort, order }
}

/**
 * Calculate skip value for pagination
 */
export const calculateSkip = (page: number, limit: number): number => {
	const skip = (page - 1) * limit
	return Math.max(0, skip) // Ensure skip is never negative
}

/**
 * Calculate sort order for MongoDB
 */
export const calculateSortOrder = (
	order: 'asc' | 'desc'
): 1 | -1 => {
	return order === 'asc' ? 1 : -1
}

/**
 * Build pagination metadata
 */
export const buildPaginationMeta = (
	page: number,
	limit: number,
	total: number
): PaginationMeta => {
	const totalPages = Math.ceil(total / limit)

	return {
		page,
		limit,
		total,
		totalPages,
		hasNextPage: page < totalPages,
		hasPrevPage: page > 1,
	}
}

/**
 * Create paginated response
 */
export const createPaginatedResponse = <T>(
	data: T[],
	page: number,
	limit: number,
	total: number
): PaginatedResult<T> => {
	return {
		data,
		pagination: buildPaginationMeta(page, limit, total),
	}
}
