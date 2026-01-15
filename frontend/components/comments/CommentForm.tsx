'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/toast'
import { Loader2 } from 'lucide-react'

interface CommentFormProps {
	postId: string
	onSubmit: (content: string) => Promise<void>
	placeholder?: string
}

export function CommentForm({
	postId,
	onSubmit,
	placeholder = 'Write a comment...',
}: CommentFormProps) {
	const [content, setContent] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)
	const { addToast } = useToast()

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		
		if (!content.trim()) {
			addToast({
				type: 'error',
				message: 'Comment cannot be empty',
			})
			return
		}

		if (content.trim().length > 1000) {
			addToast({
				type: 'error',
				message: 'Comment cannot exceed 1000 characters',
			})
			return
		}

		setIsSubmitting(true)

		try {
			await onSubmit(content.trim())
			setContent('')
		} catch (err) {
			// Error toast is handled in CommentsSection
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-3">
			<div>
				<Textarea
					value={content}
					onChange={(e) => setContent(e.target.value)}
					placeholder={placeholder}
					className="min-h-[100px] resize-none"
					disabled={isSubmitting}
				/>
			</div>
			<div className="flex justify-end">
				<Button
					type="submit"
					disabled={isSubmitting || !content.trim() || content.trim().length > 1000}
				>
					{isSubmitting ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Posting...
						</>
					) : (
						'Post Comment'
					)}
				</Button>
			</div>
		</form>
	)
}
