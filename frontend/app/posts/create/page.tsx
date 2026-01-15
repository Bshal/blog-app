'use client'

import { useRouter } from 'next/navigation'
import { PostForm } from '@/components/posts/PostForm'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { apiClient } from '@/lib/api'
import { Card } from '@/components/ui/card'

export default function CreatePostPage() {
	const router = useRouter()

	const handleSubmit = async (data: { title: string; content: string; imageUrl?: string }) => {
		await apiClient.createPost(data)
		router.push('/dashboard')
		router.refresh()
	}

	return (
		<AuthGuard>
			<main className="min-h-screen py-8" style={{ backgroundColor: '#f6f5f4' }}>
				<div className="container mx-auto px-4 max-w-4xl">
					<Card className="p-8 bg-white">
						<div className="mb-6">
							<h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Post</h1>
							<p className="text-gray-600">Share your thoughts with the community</p>
						</div>
						<PostForm onSubmit={handleSubmit} />
					</Card>
				</div>
			</main>
		</AuthGuard>
	)
}
