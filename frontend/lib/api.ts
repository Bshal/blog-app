/**
 * API client for backend integration
 * Handles all HTTP requests to the backend API
 */

import type {
	Post,
	PaginatedPosts,
	PaginatedComments,
	Comment,
	ApiResponse,
	PostFormData,
	CommentFormData,
	PaginationMeta,
	AuthResponse,
	User,
	DashboardStats,
	PaginatedUsers,
	PublicStats,
} from '@/types'

// Get API base URL - use 127.0.0.1 for server-side requests
// localhost might not resolve correctly in Next.js server components
const getApiBaseUrl = (): string => {
	const envUrl = process.env.NEXT_PUBLIC_API_URL
	if (envUrl) return envUrl
	
	// For server-side requests (Next.js server components), use 127.0.0.1
	// For client-side requests, localhost works fine
	if (typeof window === 'undefined') {
		return 'http://127.0.0.1:5000/api/v1'
	}
	return 'http://localhost:5000/api/v1'
}

class ApiClient {
	private getBaseUrl(): string {
		return getApiBaseUrl()
	}

	private async request<T>(
		endpoint: string,
		options: RequestInit = {},
		retryOn401: boolean = true
	): Promise<T> {
		const url = `${this.getBaseUrl()}${endpoint}`
		const token = this.getToken()

		const headers: Record<string, string> = {
			'Content-Type': 'application/json',
			...(options.headers as Record<string, string>),
		}

		if (token) {
			headers['Authorization'] = `Bearer ${token}`
		}

		try {
			const response = await fetch(url, {
				...options,
				headers,
				cache: 'no-store', // Ensure fresh data in server components
			})

			// Handle 401 Unauthorized - try to refresh token
			if (response.status === 401 && retryOn401 && typeof window !== 'undefined') {
				try {
					// Try to refresh the token
					await this.refreshToken()
					// Retry the request with new token (only once)
					return this.request<T>(endpoint, options, false)
				} catch (refreshError) {
					// Refresh failed - clear tokens and throw error
					this.clearTokens()
					if (typeof window !== 'undefined') {
						localStorage.removeItem('user')
					}
					throw new Error('Session expired. Please log in again.')
				}
			}

			if (!response.ok) {
				let errorMessage = 'Request failed'
				try {
					const error = await response.json()
					errorMessage = error.error?.message || error.message || errorMessage
				} catch {
					// If response is not JSON, use status text
					errorMessage = response.statusText || `HTTP ${response.status}`
				}
				
				// Handle specific error cases
				if (response.status === 413 || errorMessage.toLowerCase().includes('entity too large') || errorMessage.toLowerCase().includes('payload too large')) {
					errorMessage = 'File size is too large. Please use an image smaller than 5MB or provide an image URL instead.'
				}
				
				// For 401 errors, provide more context
				if (response.status === 401) {
					if (!token) {
						// No token provided - user might be logged out, this is expected for some endpoints
						// But we should still throw the error so the caller can handle it appropriately
						errorMessage = errorMessage || 'Authentication required'
					}
				}
				
				throw new Error(errorMessage)
			}

			return response.json()
		} catch (error) {
			// Check for network/connection errors
			if (
				error instanceof TypeError &&
				(error.message.includes('fetch') ||
					error.message.includes('Failed to fetch') ||
					error.message.includes('NetworkError') ||
					error.message.includes('network'))
			) {
				// Network error - backend might not be running or CORS issue
				const baseUrl = this.getBaseUrl()
				const errorMsg = `Failed to connect to backend API at ${baseUrl}. `
				const suggestions = [
					'Ensure the backend server is running (npm run dev in the backend directory)',
					'Check that the backend is accessible at the configured URL',
					'Verify CORS settings if accessing from a different origin',
				]
				throw new Error(errorMsg + suggestions.join(' '))
			}
			// Re-throw other errors as-is
			throw error
		}
	}

	private getToken(): string | null {
		// For server components, tokens should be passed via cookies or headers
		// For now, return null for server-side requests
		if (typeof window === 'undefined') return null
		return localStorage.getItem('accessToken')
	}

	private setTokens(accessToken: string, refreshToken: string): void {
		if (typeof window === 'undefined') return
		localStorage.setItem('accessToken', accessToken)
		localStorage.setItem('refreshToken', refreshToken)
	}

	private clearTokens(): void {
		if (typeof window === 'undefined') return
		localStorage.removeItem('accessToken')
		localStorage.removeItem('refreshToken')
		localStorage.removeItem('user')
	}

	// Auth endpoints
	async register(data: {
		name: string
		email: string
		password: string
	}): Promise<AuthResponse> {
		// Clear any existing tokens before registration
		this.clearTokens()
		
		// Register endpoint is public, so don't retry on 401
		const response = await this.request<{
			success: boolean
			message: string
			data: AuthResponse
		}>('/auth/register', {
			method: 'POST',
			body: JSON.stringify(data),
		}, false) // retryOn401 = false
		
		// Store tokens and user data
		this.setTokens(response.data.accessToken, response.data.refreshToken)
		if (typeof window !== 'undefined') {
			localStorage.setItem('user', JSON.stringify(response.data.user))
		}
		
		return response.data
	}

	async login(data: { email: string; password: string }): Promise<AuthResponse> {
		// Clear any existing tokens before login to prevent stale token issues
		this.clearTokens()
		
		// Login endpoint is public, so don't retry on 401
		const response = await this.request<{
			success: boolean
			message: string
			data: AuthResponse
		}>('/auth/login', {
			method: 'POST',
			body: JSON.stringify(data),
		}, false) // retryOn401 = false
		
		// Store tokens and user data
		this.setTokens(response.data.accessToken, response.data.refreshToken)
		if (typeof window !== 'undefined') {
			localStorage.setItem('user', JSON.stringify(response.data.user))
		}
		
		return response.data
	}

	async logout(): Promise<void> {
		// Try to logout on server first (while we still have the token)
		// If it fails, we'll clear tokens anyway
		try {
			// Don't retry on 401 since we're logging out anyway
			await this.request('/auth/logout', {
				method: 'POST',
			}, false) // retryOn401 = false
		} catch (error) {
			// Logout endpoint might fail if token is invalid/expired, that's okay
			// We'll clear tokens anyway
		} finally {
			// Always clear tokens after attempting server logout
			this.clearTokens()
		}
	}

	async refreshToken(): Promise<{ accessToken: string; refreshToken: string }> {
		const refreshToken = typeof window !== 'undefined' 
			? localStorage.getItem('refreshToken') 
			: null
		
		if (!refreshToken) {
			throw new Error('No refresh token available')
		}

		// Don't retry on 401 for refresh token endpoint itself
		const url = `${this.getBaseUrl()}/auth/refresh`
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ refreshToken }),
			cache: 'no-store',
		})

		if (!response.ok) {
			throw new Error('Failed to refresh token')
		}

		const data = await response.json()

		// Update both access token and refresh token (token rotation)
		if (typeof window !== 'undefined' && data.data) {
			if (data.data.accessToken) {
				localStorage.setItem('accessToken', data.data.accessToken)
			}
			if (data.data.refreshToken) {
				localStorage.setItem('refreshToken', data.data.refreshToken)
			}
		}

		return data.data
	}

	getOAuthUrl(provider: 'google' | 'facebook'): string {
		return `${this.getBaseUrl()}/auth/${provider}`
	}

	// Post endpoints
	async getPosts(options?: {
		page?: number
		limit?: number
		sort?: string
		order?: 'asc' | 'desc'
	}): Promise<PaginatedPosts> {
		const params = new URLSearchParams()
		if (options?.page) params.append('page', options.page.toString())
		if (options?.limit) params.append('limit', options.limit.toString())
		if (options?.sort) params.append('sort', options.sort)
		if (options?.order) params.append('order', options.order)

		const query = params.toString()
		const response = await this.request<{
			success: boolean
			data: Post[]
			pagination: PaginationMeta
		}>(`/posts${query ? `?${query}` : ''}`)
		return {
			posts: response.data,
			pagination: response.pagination,
		}
	}

	async getPostByIdOrSlug(identifier: string): Promise<Post> {
		const response = await this.request<{
			success: boolean
			data: { post: Post }
		}>(`/posts/${identifier}`)
		
		// Backend returns: { success: true, data: { post: Post } }
		if (response && response.data && response.data.post) {
			return response.data.post
		}
		
		// If response structure is different, try to extract post
		if (response && (response as any).post) {
			return (response as any).post
		}
		
		throw new Error('Post not found or invalid response format')
	}

	async getPostsByAuthor(
		authorId: string,
		options?: {
			page?: number
			limit?: number
			sort?: string
			order?: 'asc' | 'desc'
		}
	): Promise<PaginatedPosts> {
		const params = new URLSearchParams()
		if (options?.page) params.append('page', options.page.toString())
		if (options?.limit) params.append('limit', options.limit.toString())
		if (options?.sort) params.append('sort', options.sort)
		if (options?.order) params.append('order', options.order)

		const query = params.toString()
		const response = await this.request<{
			success: boolean
			data: Post[]
			pagination: PaginationMeta
		}>(`/posts/author/${authorId}${query ? `?${query}` : ''}`)
		return {
			posts: response.data,
			pagination: response.pagination,
		}
	}

	async createPost(data: PostFormData): Promise<Post> {
		const response = await this.request<{
			success: boolean
			data: { post: Post }
		}>('/posts', {
			method: 'POST',
			body: JSON.stringify(data),
		})
		return response.data.post
	}

	async updatePost(postId: string, data: Partial<PostFormData>): Promise<Post> {
		const response = await this.request<{
			success: boolean
			data: { post: Post }
		}>(`/posts/${postId}`, {
			method: 'PUT',
			body: JSON.stringify(data),
		})
		return response.data.post
	}

	async deletePost(postId: string): Promise<void> {
		await this.request(`/posts/${postId}`, {
			method: 'DELETE',
		})
	}

	// Comment endpoints
	async getCommentsByPost(
		postId: string,
		options?: {
			page?: number
			limit?: number
			sort?: string
			order?: 'asc' | 'desc'
		}
	): Promise<PaginatedComments> {
		const params = new URLSearchParams()
		if (options?.page) params.append('page', options.page.toString())
		if (options?.limit) params.append('limit', options.limit.toString())
		if (options?.sort) params.append('sort', options.sort)
		if (options?.order) params.append('order', options.order)

		const query = params.toString()
		const response = await this.request<{
			success: boolean
			data: Comment[]
			pagination: PaginationMeta
		}>(`/comments/post/${postId}${query ? `?${query}` : ''}`)
		return {
			comments: response.data,
			pagination: response.pagination,
		}
	}

	async getCommentsByAuthor(
		authorId: string,
		options?: {
			page?: number
			limit?: number
			sort?: string
			order?: 'asc' | 'desc'
		}
	): Promise<PaginatedComments> {
		const params = new URLSearchParams()
		if (options?.page) params.append('page', options.page.toString())
		if (options?.limit) params.append('limit', options.limit.toString())
		if (options?.sort) params.append('sort', options.sort)
		if (options?.order) params.append('order', options.order)

		const query = params.toString()
		const response = await this.request<{
			success: boolean
			data: Comment[]
			pagination: PaginationMeta
		}>(`/comments/author/${authorId}${query ? `?${query}` : ''}`)
		return {
			comments: response.data,
			pagination: response.pagination,
		}
	}

	async getCommentById(commentId: string): Promise<Comment> {
		const response = await this.request<{
			success: boolean
			data: { comment: Comment }
		}>(`/comments/${commentId}`)
		return response.data.comment
	}

	async createComment(data: CommentFormData): Promise<Comment> {
		const response = await this.request<{
			success: boolean
			data: { comment: Comment }
		}>('/comments', {
			method: 'POST',
			body: JSON.stringify(data),
		})
		return response.data.comment
	}

	async updateComment(commentId: string, data: { content: string }): Promise<Comment> {
		const response = await this.request<{
			success: boolean
			data: { comment: Comment }
		}>(`/comments/${commentId}`, {
			method: 'PUT',
			body: JSON.stringify(data),
		})
		return response.data.comment
	}

	async deleteComment(commentId: string): Promise<void> {
		await this.request(`/comments/${commentId}`, {
			method: 'DELETE',
		})
	}

	// Admin endpoints
	async getAdminDashboard(): Promise<DashboardStats> {
		const response = await this.request<{
			success: boolean
			data: DashboardStats
		}>('/admin/dashboard')
		return response.data
	}

	async getAdminUsers(options?: {
		page?: number
		limit?: number
		sort?: string
		order?: 'asc' | 'desc'
	}): Promise<PaginatedUsers> {
		const params = new URLSearchParams()
		if (options?.page) params.append('page', options.page.toString())
		if (options?.limit) params.append('limit', options.limit.toString())
		if (options?.sort) params.append('sort', options.sort)
		if (options?.order) params.append('order', options.order)

		const query = params.toString()
		const response = await this.request<{
			success: boolean
			data: User[]
			pagination: PaginationMeta
		}>(`/admin/users${query ? `?${query}` : ''}`)
		return {
			users: response.data,
			pagination: response.pagination,
		}
	}

	async getAdminUser(userId: string): Promise<User> {
		const response = await this.request<{
			success: boolean
			data: { user: User }
		}>(`/admin/users/${userId}`)
		return response.data.user
	}

	async updateAdminUser(userId: string, data: Partial<User>): Promise<User> {
		const response = await this.request<{
			success: boolean
			data: { user: User }
		}>(`/admin/users/${userId}`, {
			method: 'PUT',
			body: JSON.stringify(data),
		})
		return response.data.user
	}

	async deleteAdminUser(userId: string): Promise<void> {
		await this.request(`/admin/users/${userId}`, {
			method: 'DELETE',
		})
	}

	async getAdminPosts(options?: {
		page?: number
		limit?: number
		sort?: string
		order?: 'asc' | 'desc'
	}): Promise<PaginatedPosts> {
		const params = new URLSearchParams()
		if (options?.page) params.append('page', options.page.toString())
		if (options?.limit) params.append('limit', options.limit.toString())
		if (options?.sort) params.append('sort', options.sort)
		if (options?.order) params.append('order', options.order)

		const query = params.toString()
		const response = await this.request<{
			success: boolean
			data: Post[]
			pagination: PaginationMeta
		}>(`/admin/posts${query ? `?${query}` : ''}`)
		return {
			posts: response.data,
			pagination: response.pagination,
		}
	}

	async getAdminComments(options?: {
		page?: number
		limit?: number
		sort?: string
		order?: 'asc' | 'desc'
	}): Promise<PaginatedComments> {
		const params = new URLSearchParams()
		if (options?.page) params.append('page', options.page.toString())
		if (options?.limit) params.append('limit', options.limit.toString())
		if (options?.sort) params.append('sort', options.sort)
		if (options?.order) params.append('order', options.order)

		const query = params.toString()
		const response = await this.request<{
			success: boolean
			data: Comment[]
			pagination: PaginationMeta
		}>(`/admin/comments${query ? `?${query}` : ''}`)
		return {
			comments: response.data,
			pagination: response.pagination,
		}
	}

	async createAdmin(data: {
		name: string
		email: string
		password: string
	}): Promise<void> {
		await this.request('/admin/create-admin', {
			method: 'POST',
			body: JSON.stringify(data),
		})
	}

	// Public stats endpoint
	async getPublicStats(): Promise<PublicStats> {
		// Public endpoint - fetch without authentication
		const url = `${this.getBaseUrl()}/stats`
		const response = await fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
			cache: 'no-store',
		})

		if (!response.ok) {
			throw new Error(`Failed to fetch stats: ${response.statusText}`)
		}

		const data = await response.json()
		return data.data
	}

	// Health check endpoint
	async checkHealth(): Promise<{ success: boolean; message: string }> {
		try {
			const response = await fetch(`${this.getBaseUrl()}/health`, {
				method: 'GET',
				cache: 'no-store',
			})
			if (!response.ok) {
				throw new Error(`Health check failed: ${response.statusText}`)
			}
			return await response.json()
		} catch (error) {
			if (
				error instanceof TypeError &&
				(error.message.includes('fetch') ||
					error.message.includes('Failed to fetch') ||
					error.message.includes('NetworkError'))
			) {
				throw new Error(
					`Backend server is not reachable at ${this.getBaseUrl()}. Please ensure the backend is running.`
				)
			}
			throw error
		}
	}
}

export const apiClient = new ApiClient()
