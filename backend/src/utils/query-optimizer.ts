/**
 * Query optimization utilities
 * Helps optimize MongoDB queries for better performance
 */

import mongoose from 'mongoose'

/**
 * Select only necessary fields to reduce data transfer
 */
export const selectFields = (fields: string[]): string => {
	return fields.join(' ')
}

/**
 * Common field selections for populated documents
 */
export const POPULATE_FIELDS = {
	user: 'name email avatar',
	post: 'title slug createdAt',
	author: 'name email avatar',
	postAuthor: 'name email',
	commentAuthor: 'name email',
}

/**
 * Optimize populate options for better performance
 */
export const getPopulateOptions = (
	path: string,
	select?: string
): mongoose.PopulateOptions => {
	return {
		path,
		select: select || POPULATE_FIELDS[path as keyof typeof POPULATE_FIELDS] || '',
	}
}

/**
 * Build efficient query with lean option for read-only operations
 * Use lean() for better performance when you don't need Mongoose documents
 */
export const buildLeanQuery = <T>(
	query: mongoose.Query<T[], T>
): mongoose.Query<any[], any> => {
	return query.lean() as any
}

/**
 * Build query with select to limit fields
 */
export const buildSelectQuery = <T>(
	query: mongoose.Query<T[], T>,
	fields: string
): mongoose.Query<T[], T> => {
	return query.select(fields)
}

/**
 * Execute query with count in parallel for pagination
 */
export const executePaginatedQuery = async <T>(
	query: mongoose.Query<T[], T>,
	countQuery: mongoose.Query<number, T>
): Promise<{ data: T[]; total: number }> => {
	const [data, total] = await Promise.all([
		query.exec(),
		countQuery.exec(),
	])

	return { data, total }
}

/**
 * Build compound query filter for common patterns
 */
export const buildCompoundFilter = (filters: Record<string, any>) => {
	const compoundFilter: Record<string, any> = {}

	Object.entries(filters).forEach(([key, value]) => {
		if (value !== undefined && value !== null && value !== '') {
			compoundFilter[key] = value
		}
	})

	return compoundFilter
}

/**
 * Optimize text search query
 */
export const buildTextSearchQuery = (
	searchTerm: string,
	fields: string[]
): Record<string, any> => {
	if (!searchTerm || searchTerm.trim() === '') {
		return {}
	}

	// Use regex for case-insensitive search
	const regex = new RegExp(searchTerm.trim(), 'i')

	// Build $or query for multiple fields
	if (fields.length === 1) {
		return { [fields[0]]: regex }
	}

	return {
		$or: fields.map((field) => ({ [field]: regex })),
	}
}
