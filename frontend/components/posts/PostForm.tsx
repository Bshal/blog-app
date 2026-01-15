'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { X } from 'lucide-react'
import Image from 'next/image'
import { useToast } from '@/components/ui/toast'

interface PostFormProps {
	initialData?: {
		title: string
		content: string
		imageUrl?: string
	}
	onSubmit: (data: { title: string; content: string; imageUrl?: string }) => Promise<void>
	onCancel?: () => void
	isLoading?: boolean
	submitLabel?: string
}

export function PostForm({
	initialData,
	onSubmit,
	onCancel,
	isLoading = false,
	submitLabel = 'Create Post',
}: PostFormProps) {
	const [title, setTitle] = useState(initialData?.title || '')
	const [content, setContent] = useState(initialData?.content || '')
	const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || '')
	const getPreviewUrl = (url: string) => {
		if (!url) return null
		// If it's already a full URL (http/https), use it as-is
		if (url.startsWith('http://') || url.startsWith('https://')) {
			return url
		}
		// Otherwise, treat it as a filename in public/posts folder
		return `/posts/${url}`
	}
	const [imagePreview, setImagePreview] = useState<string | null>(
		initialData?.imageUrl ? getPreviewUrl(initialData.imageUrl) : null
	)
	const { addToast } = useToast()

	// Available images in public/posts folder
	const availableImages = [
		'cover-1.webp',
		'cover-2.webp',
		'cover-3.webp',
		'cover-4.webp',
		'cover-5.webp',
		'cover-6.webp',
		'cover-7.webp',
		'cover-8.webp',
	]

	const handleImageSelect = (filename: string) => {
		setImageUrl(filename)
		setImagePreview(getPreviewUrl(filename))
	}

	const handleRemoveImage = () => {
		setImageUrl('')
		setImagePreview(null)
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!title.trim()) {
			addToast({
				type: 'error',
				message: 'Title is required',
			})
			return
		}

		if (!content.trim()) {
			addToast({
				type: 'error',
				message: 'Content is required',
			})
			return
		}

		try {
			// Send just the filename (not the full path)
			const finalImageUrl = imageUrl.trim() || undefined

			await onSubmit({ 
				title: title.trim(), 
				content: content.trim(),
				imageUrl: finalImageUrl
			})
			addToast({
				type: 'success',
				message: submitLabel === 'Create Post' ? 'Post created successfully!' : 'Post updated successfully!',
			})
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Failed to save post. Please try again.'
			
			// Handle specific error cases
			let toastMessage = errorMessage
			if (errorMessage.toLowerCase().includes('entity too large') || errorMessage.toLowerCase().includes('payload too large')) {
				toastMessage = 'Image file is too large. Please use an image smaller than 5MB.'
			}
			
			addToast({
				type: 'error',
				message: toastMessage,
			})
		}
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<div className="space-y-2">
				<label htmlFor="title" className="text-sm font-medium text-gray-700">
					Title
				</label>
				<Input
					id="title"
					type="text"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					required
					placeholder="Enter post title"
					disabled={isLoading}
					className="text-lg"
				/>
			</div>

			<div className="space-y-2">
				<label htmlFor="content" className="text-sm font-medium text-gray-700">
					Content
				</label>
				<Textarea
					id="content"
					value={content}
					onChange={(e) => setContent(e.target.value)}
					required
					placeholder="Write your post content here..."
					disabled={isLoading}
					rows={15}
					className="resize-none"
				/>
			</div>

			<div className="space-y-2">
				<label htmlFor="image" className="text-sm font-medium text-gray-700">
					Post Image (Optional)
				</label>
				<div className="space-y-3">
					<div className="grid grid-cols-4 gap-2">
						{availableImages.map((filename) => (
							<button
								key={filename}
								type="button"
								onClick={() => handleImageSelect(filename)}
								disabled={isLoading}
								className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
									imageUrl === filename
										? 'border-blue-500 ring-2 ring-blue-200'
										: 'border-gray-200 hover:border-gray-300'
								}`}
							>
								<Image
									src={`/posts/${filename}`}
									alt={filename}
									fill
									className="object-cover"
									sizes="(max-width: 768px) 25vw, 200px"
								/>
							</button>
						))}
					</div>
					{imagePreview && (
						<div className="relative w-full h-64 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
							<Image
								src={imagePreview}
								alt="Preview"
								fill
								className="object-cover"
								sizes="(max-width: 768px) 100vw, 800px"
							/>
							<Button
								type="button"
								variant="destructive"
								size="sm"
								onClick={handleRemoveImage}
								className="absolute top-2 right-2"
								disabled={isLoading}
							>
								<X className="h-4 w-4" />
							</Button>
						</div>
					)}
				</div>
			</div>

			<div className="flex gap-3">
				<Button type="submit" disabled={isLoading}>
					{isLoading ? 'Saving...' : submitLabel}
				</Button>
				{onCancel && (
					<Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
						Cancel
					</Button>
				)}
			</div>
		</form>
	)
}
