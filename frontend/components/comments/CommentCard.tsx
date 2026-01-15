'use client'

import { AuthorAvatar } from '@/components/posts/AuthorAvatar'
import { formatDistanceToNow } from 'date-fns'
import type { Comment } from '@/types'
import { Button } from '@/components/ui/button'
import { Edit2, Trash2 } from 'lucide-react'
import { useState } from 'react'

interface CommentCardProps {
	comment: Comment
	currentUserId?: string
	onEdit?: (commentId: string, content: string) => void
	onDelete?: (commentId: string) => void
}

function getAuthor(comment: Comment) {
	if (typeof comment.author === 'string') {
		return { _id: comment.author, name: 'Unknown', email: '', avatar: '' }
	}
	return comment.author
}

export function CommentCard({
	comment,
	currentUserId,
	onEdit,
	onDelete,
}: CommentCardProps) {
	const author = getAuthor(comment)
	const [isEditing, setIsEditing] = useState(false)
	const [editContent, setEditContent] = useState(comment.content)
	const [isDeleting, setIsDeleting] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const canModify =
		currentUserId &&
		(typeof comment.author === 'string'
			? comment.author === currentUserId
			: comment.author._id === currentUserId)

	const handleEdit = () => {
		if (!editContent.trim()) {
			setError('Comment cannot be empty')
			return
		}
		
		if (editContent.trim().length > 1000) {
			setError('Comment cannot exceed 1000 characters')
			return
		}

		if (onEdit && editContent.trim() !== comment.content) {
			onEdit(comment._id, editContent.trim())
			setIsEditing(false)
		} else {
			setIsEditing(false)
			setEditContent(comment.content)
		}
	}

	const handleDelete = () => {
		if (onDelete && confirm('Are you sure you want to delete this comment?')) {
			setIsDeleting(true)
			onDelete(comment._id)
		}
	}

	if (isDeleting) {
		return null
	}

	return (
		<div className="border-b border-gray-200 py-4 last:border-b-0">
			<div className="flex gap-3">
				{/* Author Avatar */}
				<AuthorAvatar
					avatarUrl={author.avatar}
					name={author.name}
					className="h-10 w-10 flex-shrink-0"
				/>

				{/* Comment Content */}
				<div className="flex-1 min-w-0">
					<div className="flex items-start justify-between gap-2 mb-1">
						<div>
							<span className="font-semibold text-gray-900 text-sm">
								{author.name}
							</span>
							<span className="text-xs text-gray-500 ml-2">
								{formatDistanceToNow(new Date(comment.createdAt), {
									addSuffix: true,
								})}
							</span>
						</div>

						{canModify && !isEditing && (
							<div className="flex gap-2">
								<Button
									variant="ghost"
									size="sm"
									className="h-7 w-7 p-0"
									onClick={() => setIsEditing(true)}
								>
									<Edit2 className="h-3.5 w-3.5" />
								</Button>
								<Button
									variant="ghost"
									size="sm"
									className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
									onClick={handleDelete}
								>
									<Trash2 className="h-3.5 w-3.5" />
								</Button>
							</div>
						)}
					</div>

					{isEditing ? (
						<div className="space-y-2">
							<textarea
								value={editContent}
								onChange={(e) => {
									setEditContent(e.target.value)
									setError(null)
								}}
								className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
								rows={3}
								maxLength={1000}
							/>
							{error && (
								<p className="text-red-600 text-xs">{error}</p>
							)}
							<div className="flex gap-2">
								<Button
									size="sm"
									onClick={handleEdit}
									disabled={!editContent.trim() || editContent.trim().length > 1000}
								>
									Save
								</Button>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => {
										setIsEditing(false)
										setEditContent(comment.content)
										setError(null)
									}}
								>
									Cancel
								</Button>
							</div>
						</div>
					) : (
						<p className="text-gray-700 text-sm whitespace-pre-wrap">
							{comment.content}
						</p>
					)}
				</div>
			</div>
		</div>
	)
}
