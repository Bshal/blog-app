'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api'
import { useToast } from '@/components/ui/toast'
import type { Comment, PaginatedComments } from '@/types'
import { Loader2, Trash2, MessageSquare } from 'lucide-react'
import { Pagination } from '@/components/posts/Pagination'
import Link from 'next/link'
import { AuthorAvatar } from '@/components/posts/AuthorAvatar'

// Format date helper
function formatDate(dateString: string): string {
	try {
		const date = new Date(dateString)
		const day = date.getDate()
		const month = date.toLocaleDateString('en-US', { month: 'short' })
		const year = date.getFullYear()
		return `${day} ${month} ${year}`
	} catch {
		return dateString
	}
}

function getAuthor(comment: Comment) {
	if (typeof comment.author === 'string') {
		return { _id: comment.author, name: 'Unknown', email: '', avatar: '' }
	}
	return comment.author
}

function getPost(comment: Comment) {
	if (typeof comment.post === 'string') {
		return { _id: comment.post, title: 'Unknown Post', slug: '' }
	}
	return comment.post
}

export default function AdminCommentsPage() {
	const searchParams = useSearchParams()
	const { user } = useAuth()
	const { addToast } = useToast()
	const [commentsData, setCommentsData] = useState<PaginatedComments | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const page = parseInt(searchParams.get('page') || '1', 10)

	useEffect(() => {
		const loadComments = async () => {
			try {
				setIsLoading(true)
				const data = await apiClient.getAdminComments({
					page,
					limit: 10,
					sort: 'createdAt',
					order: 'desc',
				})
				setCommentsData(data)
			} catch (err) {
				setError(
					err instanceof Error
						? err.message
						: 'Failed to load comments'
				)
				addToast({
					type: 'error',
					message: err instanceof Error ? err.message : 'Failed to load comments',
				})
			} finally {
				setIsLoading(false)
			}
		}

		if (user?.role === 'admin') {
			loadComments()
		}
	}, [user, page, addToast])

	const handleDelete = async (commentId: string) => {
		if (!confirm('Are you sure you want to delete this comment?')) {
			return
		}

		try {
			await apiClient.deleteComment(commentId)
			addToast({
				type: 'success',
				message: 'Comment deleted successfully',
			})
			// Reload comments
			const data = await apiClient.getAdminComments({
				page,
				limit: 10,
				sort: 'createdAt',
				order: 'desc',
			})
			setCommentsData(data)
		} catch (err) {
			addToast({
				type: 'error',
				message: err instanceof Error ? err.message : 'Failed to delete comment',
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
							<MessageSquare className="h-8 w-8" />
							Comment Management
						</h1>
						<p className="text-gray-600">Manage all comments in the system (including deleted)</p>
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
					) : commentsData ? (
						<>
							<Card className="p-6 bg-white border-0 shadow-sm">
								{commentsData.comments.length > 0 ? (
									<div className="space-y-4">
										{commentsData.comments.map((comment) => {
											const author = getAuthor(comment)
											const post = getPost(comment)
											return (
												<div
													key={comment._id}
													className="p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
												>
													<div className="flex items-start gap-4">
														<AuthorAvatar
															avatarUrl={author.avatar}
															name={author.name}
															className="h-10 w-10 flex-shrink-0"
														/>
														<div className="flex-1 min-w-0">
															<div className="flex items-center gap-2 mb-2">
																<span className="font-semibold text-gray-900">{author.name}</span>
																<span className="text-sm text-gray-500">
																	on{' '}
																	<Link
																		href={`/posts/${post.slug || post._id}`}
																		className="text-blue-600 hover:text-blue-700 hover:underline"
																	>
																		{post.title}
																	</Link>
																</span>
																{comment.isDeleted && (
																	<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
																		Deleted
																	</span>
																)}
															</div>
															<p className="text-gray-700 mb-2">{comment.content}</p>
															<div className="flex items-center justify-between">
																<span className="text-xs text-gray-500">
																	{formatDate(comment.createdAt)}
																</span>
																<Button
																	variant="outline"
																	size="sm"
																	onClick={() => handleDelete(comment._id)}
																	className="text-red-600 hover:text-red-700 hover:bg-red-50"
																>
																	<Trash2 className="h-4 w-4" />
																</Button>
															</div>
														</div>
													</div>
												</div>
											)
										})}
									</div>
								) : (
									<div className="text-center py-12">
										<p className="text-gray-500">No comments found</p>
									</div>
								)}
							</Card>

							{commentsData.pagination.totalPages > 1 && (
								<div className="mt-6 flex justify-center">
									<Pagination 
										pagination={commentsData.pagination} 
										basePath="/admin/comments"
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
