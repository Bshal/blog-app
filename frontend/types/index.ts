/**
 * TypeScript types for the frontend application
 * These types match the backend API responses
 */

export interface User {
	_id: string
	name: string
	email: string
	role: 'user' | 'admin'
	avatar?: string
	isEmailVerified: boolean
	createdAt: string
	updatedAt: string
}

export interface Post {
	_id: string
	title: string
	slug: string
	content: string
	imageUrl?: string
	author: User | string
	isDeleted: boolean
	deletedAt?: string
	createdAt: string
	updatedAt: string
	commentCount?: number
}

export interface Comment {
	_id: string
	content: string
	post: Post | string
	author: User | string
	isDeleted: boolean
	deletedAt?: string
	createdAt: string
	updatedAt: string
}

export interface PaginationMeta {
	page: number
	limit: number
	total: number
	totalPages: number
	hasNextPage: boolean
	hasPrevPage: boolean
}

export interface DashboardStats {
	totalUsers: number
	totalPosts: number
	totalComments: number
	activeUsers: number
	activePosts: number
	activeComments: number
}

export interface PaginatedUsers {
	users: User[]
	pagination: PaginationMeta
}

export interface PaginatedPosts {
	posts: Post[]
	pagination: PaginationMeta
}

export interface PaginatedComments {
	comments: Comment[]
	pagination: PaginationMeta
}

export interface ApiResponse<T> {
	success: boolean
	message?: string
	data: T
}

export interface ApiError {
	success: false
	error: {
		message: string
		stack?: string
	}
}

export interface PublicStats {
	totalUsers: number
	totalPosts: number
	totalComments: number
}

export interface AuthResponse {
	user: User
	accessToken: string
	refreshToken: string
}

export interface PostFormData {
	title: string
	content: string
	imageUrl?: string
}

export interface CommentFormData {
	content: string
	postId: string
}
