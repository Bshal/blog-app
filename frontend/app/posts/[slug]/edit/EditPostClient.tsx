'use client'

import { useRouter } from 'next/navigation'
import { PostForm } from '@/components/posts/PostForm'
import { apiClient } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { useEffect, useState } from 'react'
import type { Post } from '@/types'

interface EditPostClientProps {
	post: Post
}

export function EditPostClient({ post }: EditPostClientProps) {
	const router = useRouter()
	const { user, isLoading } = useAuth()
	const [isAuthorized, setIsAuthorized] = useState(false)

	useEffect(() => {
		// Wait for auth to finish loading before checking authorization
		if (isLoading) {
			return
		}

		// Check if user is the author or admin
		const authorId = typeof post.author === 'string' ? post.author : post.author._id
		if (user && (user._id === authorId || user.role === 'admin')) {
			setIsAuthorized(true)
		} else if (user) {
			// User is logged in but not authorized
			router.push('/')
		} else {
			// User is not logged in
			router.push('/auth/login')
		}
	}, [user, isLoading, post, router])

	const handleSubmit = async (data: { title: string; content: string; imageUrl?: string }) => {
		await apiClient.updatePost(post._id, data)
		router.push(`/posts/${post.slug}`)
		router.refresh()
	}

	const handleCancel = () => {
		router.push(`/posts/${post.slug}`)
	}

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-12">
				<div className="text-gray-600">Loading...</div>
			</div>
		)
	}

	if (!isAuthorized) {
		return null
	}

	return (
		<PostForm
			initialData={{
				title: post.title,
				content: post.content,
				imageUrl: post.imageUrl,
			}}
			onSubmit={handleSubmit}
			onCancel={handleCancel}
			submitLabel="Update Post"
		/>
	)
}
