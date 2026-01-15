'use client'

import { CommentCard } from './CommentCard'
import type { Comment } from '@/types'

interface CommentListProps {
	comments: Comment[]
	currentUserId?: string
	onEdit?: (commentId: string, content: string) => void
	onDelete?: (commentId: string) => void
}

export function CommentList({
	comments,
	currentUserId,
	onEdit,
	onDelete,
}: CommentListProps) {
	if (comments.length === 0) {
		return (
			<div className="text-center py-8">
				<p className="text-gray-500 text-sm">No comments yet. Be the first to comment!</p>
			</div>
		)
	}

	return (
		<div className="space-y-0">
			{comments.map((comment) => (
				<CommentCard
					key={comment._id}
					comment={comment}
					currentUserId={currentUserId}
					onEdit={onEdit}
					onDelete={onDelete}
				/>
			))}
		</div>
	)
}
