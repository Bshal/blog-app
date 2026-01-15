'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api'
import { useToast } from '@/components/ui/toast'
import type { Post, PaginatedPosts } from '@/types'
import { Loader2, Trash2, Eye, FileText } from 'lucide-react'
import { PostList } from '@/components/posts/PostList'
import { Pagination } from '@/components/posts/Pagination'
import Link from 'next/link'

export default function AdminPostsPage() {
	const searchParams = useSearchParams()
	const { user } = useAuth()
	const { addToast } = useToast()
	const [postsData, setPostsData] = useState<PaginatedPosts | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const page = parseInt(searchParams.get('page') || '1', 10)

	useEffect(() => {
		const loadPosts = async () => {
			try {
				setIsLoading(true)
				const data = await apiClient.getAdminPosts({
					page,
					limit: 10,
					sort: 'createdAt',
					order: 'desc',
				})
				setPostsData(data)
			} catch (err) {
				setError(
					err instanceof Error
						? err.message
						: 'Failed to load posts'
				)
				addToast({
					type: 'error',
					message: err instanceof Error ? err.message : 'Failed to load posts',
				})
			} finally {
				setIsLoading(false)
			}
		}

		if (user?.role === 'admin') {
			loadPosts()
		}
	}, [user, page, addToast])

	const handleDelete = async (postId: string, postTitle: string) => {
		if (!confirm(`Are you sure you want to delete post "${postTitle}"?`)) {
			return
		}

		try {
			await apiClient.deletePost(postId)
			addToast({
				type: 'success',
				message: 'Post deleted successfully',
			})
			// Reload posts
			const data = await apiClient.getAdminPosts({
				page,
				limit: 10,
				sort: 'createdAt',
				order: 'desc',
			})
			setPostsData(data)
		} catch (err) {
			addToast({
				type: 'error',
				message: err instanceof Error ? err.message : 'Failed to delete post',
			})
		}
	}

	if (!user || user.role !== 'admin') {
		return null
	}

	return (
		<AuthGuard requireAuth={true} requireAdmin={true}>
			<main className="min-h-screen py-8" style={{ backgroundColor: '#f6f5f4' }}>
				<div className="container mx-auto px-4 max-w-7xl">
					<div className="mb-8">
						<h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
							<FileText className="h-8 w-8" />
							Post Management
						</h1>
						<p className="text-gray-600">Manage all posts in the system (including deleted)</p>
					</div>

					{error && (
						<div className="mb-6 p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
							{error}
						</div>
					)}

					{isLoading ? (
						<div className="flex items-center justify-center py-12">
							<Loader2 className="h-6 w-6 animate-spin text-gray-400" />
						</div>
					) : postsData ? (
						<>
							<Card className="p-6 bg-white border-0 shadow-sm">
								{postsData.posts.length > 0 ? (
									<div className="space-y-4">
										{postsData.posts.map((post) => (
											<div
												key={post._id}
												className="flex items-center justify-between p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
											>
												<div className="flex-1">
													<div className="flex items-center gap-3 mb-2">
														<Link
															href={`/posts/${post.slug}`}
															className="font-semibold text-gray-900 hover:text-blue-600 transition-colors"
														>
															{post.title}
														</Link>
														{post.isDeleted && (
															<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
																Deleted
															</span>
														)}
													</div>
													<p className="text-sm text-gray-600 line-clamp-2">
														{post.content.substring(0, 150)}...
													</p>
												</div>
												<div className="flex items-center gap-2 ml-4">
													<Button
														variant="outline"
														size="sm"
														asChild
													>
														<Link href={`/posts/${post.slug}`}>
															<Eye className="h-4 w-4" />
														</Link>
													</Button>
													<Button
														variant="outline"
														size="sm"
														onClick={() => handleDelete(post._id, post.title)}
														className="text-red-600 hover:text-red-700 hover:bg-red-50"
													>
														<Trash2 className="h-4 w-4" />
													</Button>
												</div>
											</div>
										))}
									</div>
								) : (
									<div className="text-center py-12">
										<p className="text-gray-500">No posts found</p>
									</div>
								)}
							</Card>

							{postsData.pagination.totalPages > 1 && (
								<div className="mt-6 flex justify-center">
									<Pagination 
										pagination={postsData.pagination} 
										basePath="/admin/posts"
									/>
								</div>
							)}
						</>
					) : null}
				</div>
			</main>
		</AuthGuard>
	)
}
