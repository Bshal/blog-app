'use client'

import { useState, useEffect } from 'react'
import { CommentList } from './CommentList'
import { CommentForm } from './CommentForm'
import { apiClient } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/ui/toast'
import type { Comment, PaginatedComments } from '@/types'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface CommentsSectionProps {
	postId: string
}

export function CommentsSection({ postId }: CommentsSectionProps) {
	const { user, isAuthenticated } = useAuth()
	const { addToast } = useToast()
	const [comments, setComments] = useState<Comment[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [pagination, setPagination] = useState<{
		page: number
		totalPages: number
		hasNextPage: boolean
	} | null>(null)

	const loadComments = async (page: number = 1, append: boolean = false) => {
		try {
			setIsLoading(true)
			setError(null)
			const data: PaginatedComments = await apiClient.getCommentsByPost(postId, {
				page,
				limit: 10,
				sort: 'createdAt',
				order: 'desc',
			})
			
			if (append) {
				setComments((prev) => [...prev, ...data.comments])
			} else {
				setComments(data.comments)
			}
			
			setPagination({
				page: data.pagination.page,
				totalPages: data.pagination.totalPages,
				hasNextPage: data.pagination.hasNextPage,
			})
		} catch (err) {
			let errorMessage = 'Failed to load comments'
			if (err instanceof Error) {
				errorMessage = err.message
				// Format connection errors to be more user-friendly
				if (errorMessage.includes('Failed to connect') || errorMessage.includes('not reachable')) {
					errorMessage = 'Unable to connect to the server. Please ensure the backend is running.'
				}
			}
			setError(errorMessage)
		} finally {
			setIsLoading(false)
		}
	}

	useEffect(() => {
		loadComments()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [postId])

	const handleCreateComment = async (content: string) => {
		try {
			await apiClient.createComment({
				content,
				postId,
			})
			// Reload comments to get the new one
			await loadComments(1)
			addToast({
				type: 'success',
				message: 'Comment posted successfully!',
			})
		} catch (err) {
			if (err instanceof Error) {
				if (err.message.includes('401') || err.message.includes('Authentication')) {
					addToast({
						type: 'error',
						message: 'Please log in to post a comment',
					})
					throw err
				}
			}
			addToast({
				type: 'error',
				message: err instanceof Error ? err.message : 'Failed to post comment. Please try again.',
			})
			throw err
		}
	}

	const handleEditComment = async (commentId: string, content: string) => {
		try {
			await apiClient.updateComment(commentId, { content })
			// Reload comments to reflect the update
			await loadComments(pagination?.page || 1)
			addToast({
				type: 'success',
				message: 'Comment updated successfully!',
			})
		} catch (err) {
			if (err instanceof Error) {
				if (err.message.includes('401') || err.message.includes('Authentication')) {
					addToast({
						type: 'error',
						message: 'Please log in to edit comments',
					})
					return
				}
				if (err.message.includes('403') || err.message.includes('permission')) {
					addToast({
						type: 'error',
						message: 'You do not have permission to edit this comment',
					})
					return
				}
			}
			addToast({
				type: 'error',
				message: err instanceof Error ? err.message : 'Failed to update comment. Please try again.',
			})
		}
	}

	const handleDeleteComment = async (commentId: string) => {
		try {
			await apiClient.deleteComment(commentId)
			// Remove comment from local state
			setComments((prev) => prev.filter((c) => c._id !== commentId))
			addToast({
				type: 'success',
				message: 'Comment deleted successfully!',
			})
		} catch (err) {
			if (err instanceof Error) {
				if (err.message.includes('401') || err.message.includes('Authentication')) {
					addToast({
						type: 'error',
						message: 'Please log in to delete comments',
					})
					return
				}
				if (err.message.includes('403') || err.message.includes('permission')) {
					addToast({
						type: 'error',
						message: 'You do not have permission to delete this comment',
					})
					return
				}
			}
			addToast({
				type: 'error',
				message: err instanceof Error ? err.message : 'Failed to delete comment',
			})
		}
	}

	return (
		<div className="mt-8">
			<h2 className="text-2xl font-bold text-gray-900 mb-6">
				Comments {comments.length > 0 && `(${comments.length})`}
			</h2>

			{/* Comment Form */}
			{isAuthenticated ? (
				<div className="mb-8">
					<CommentForm
						postId={postId}
						onSubmit={handleCreateComment}
					/>
				</div>
			) : (
				<div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
					<p className="text-sm text-gray-600 mb-2">
						Please log in to leave a comment.
					</p>
					<Button asChild size="sm" variant="outline">
						<a href="/auth/login">Log In</a>
					</Button>
				</div>
			)}

			{/* Comments List */}
			{isLoading ? (
				<div className="flex items-center justify-center py-8">
					<Loader2 className="h-6 w-6 animate-spin text-gray-400" />
				</div>
			) : error ? (
				<div className="text-center py-8">
					<div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
						<p className="text-red-800 text-sm font-medium mb-2">
							Error loading comments
						</p>
						<p className="text-red-600 text-sm">{error}</p>
						{error.includes('backend') || error.includes('server') ? (
							<div className="mt-3 text-xs text-red-500">
								<p className="mb-1">Troubleshooting steps:</p>
								<ul className="list-disc list-inside space-y-1 text-left max-w-md mx-auto">
									<li>Make sure the backend server is running</li>
									<li>Run <code className="bg-red-100 px-1 rounded">npm run dev</code> in the backend directory</li>
									<li>Check that the backend is accessible at http://localhost:5000</li>
								</ul>
							</div>
						) : null}
					</div>
					<Button
						variant="outline"
						size="sm"
						onClick={() => loadComments()}
						className="mt-2"
					>
						Retry
					</Button>
				</div>
			) : (
				<>
					<CommentList
						comments={comments}
						currentUserId={user?._id}
						onEdit={handleEditComment}
						onDelete={handleDeleteComment}
					/>

					{/* Load More Button */}
					{pagination?.hasNextPage && (
						<div className="mt-6 text-center">
							<Button
								variant="outline"
								onClick={() => loadComments((pagination.page || 1) + 1, true)}
								disabled={isLoading}
							>
								{isLoading ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Loading...
									</>
								) : (
									'Load More Comments'
								)}
							</Button>
						</div>
					)}
				</>
			)}
		</div>
	)
}
