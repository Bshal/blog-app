'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/components/ui/toast'
import { apiClient } from '@/lib/api'
import { Edit2, Trash2 } from 'lucide-react'

interface PostActionsProps {
	postId: string
	postSlug: string
	authorId: string
	currentUserId?: string
	currentUserRole?: 'user' | 'admin'
}

export function PostActions({
	postId,
	postSlug,
	authorId,
	currentUserId,
	currentUserRole,
}: PostActionsProps) {
	const router = useRouter()
	const { addToast } = useToast()
	const [isDeleting, setIsDeleting] = useState(false)
	const [showDeleteDialog, setShowDeleteDialog] = useState(false)
	const [deleteError, setDeleteError] = useState<string | null>(null)

	const canEdit = currentUserId === authorId || currentUserRole === 'admin'

	if (!canEdit) {
		return null
	}

	const handleDeleteClick = () => {
		setShowDeleteDialog(true)
		setDeleteError(null)
	}

	const handleDeleteConfirm = async () => {
		try {
			setIsDeleting(true)
			setDeleteError(null)
			await apiClient.deletePost(postId)
			setShowDeleteDialog(false)
			addToast({
				type: 'success',
				message: 'Post deleted successfully!',
			})
			router.push('/posts')
			router.refresh()
		} catch (error) {
			const errorMessage = error instanceof Error
				? error.message
				: 'Failed to delete post. Please try again.'
			setDeleteError(errorMessage)
			addToast({
				type: 'error',
				message: errorMessage,
			})
			setIsDeleting(false)
		}
	}

	const handleEdit = () => {
		router.push(`/posts/${postSlug}/edit`)
	}

	return (
		<>
			<div className="flex gap-2 mt-4">
				<Button 
					variant="outline" 
					size="sm"
					onClick={handleEdit}
				>
					<Edit2 className="mr-2 h-4 w-4" />
					Edit
				</Button>
				<Button
					variant="outline"
					size="sm"
					onClick={handleDeleteClick}
					disabled={isDeleting}
					className="text-red-600 hover:text-red-700 hover:bg-red-50"
				>
					<Trash2 className="mr-2 h-4 w-4" />
					Delete
				</Button>
			</div>

			<Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete Post</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete this post? This action cannot be undone.
						</DialogDescription>
					</DialogHeader>
					{deleteError && (
						<div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
							{deleteError}
						</div>
					)}
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setShowDeleteDialog(false)}
							disabled={isDeleting}
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={handleDeleteConfirm}
							disabled={isDeleting}
						>
							{isDeleting ? 'Deleting...' : 'Delete'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	)
}
