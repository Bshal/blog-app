import { notFound } from 'next/navigation'
import { apiClient } from '@/lib/api'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { Card } from '@/components/ui/card'
import { EditPostClient } from './EditPostClient'

interface EditPostPageProps {
	params: Promise<{
		slug: string
	}>
}

export default async function EditPostPage({ params }: EditPostPageProps) {
	const { slug } = await params

	try {
		const post = await apiClient.getPostByIdOrSlug(slug)

		return (
			<AuthGuard>
				<main className="min-h-screen py-8" style={{ backgroundColor: '#f6f5f4' }}>
					<div className="container mx-auto px-4 max-w-4xl">
						<Card className="p-8 bg-white">
							<div className="mb-6">
								<h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Post</h1>
								<p className="text-gray-600">Update your post content</p>
							</div>
							<EditPostClient post={post} />
						</Card>
				</div>
			</main>
		</AuthGuard>
		)
	} catch (error) {
		notFound()
	}
}
