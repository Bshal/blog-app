import { apiClient } from '@/lib/api'
import { PostList } from '@/components/posts/PostList'
import { Pagination } from '@/components/posts/Pagination'

interface HomePageProps {
	searchParams: Promise<{
		page?: string
		limit?: string
	}>
}

export default async function HomePage({ searchParams }: HomePageProps) {
	const params = await searchParams
	const page = parseInt(params.page || '1', 10)
	const limit = parseInt(params.limit || '10', 10)

	try {
		const data = await apiClient.getPosts({
			page,
			limit,
			sort: 'createdAt',
			order: 'desc',
		})

		return (
			<main className="min-h-screen py-8" style={{ backgroundColor: '#f6f5f4' }}>
				<div className="container mx-auto px-4 max-w-7xl">
					<PostList posts={data.posts} showStatus={true} />

					{data.pagination.totalPages > 1 && (
						<div className="mt-8 flex justify-center">
							<Pagination pagination={data.pagination} />
						</div>
					)}
				</div>
			</main>
		)
	} catch (error) {
		return (
			<main className="min-h-screen py-8" style={{ backgroundColor: '#f6f5f4' }}>
				<div className="container mx-auto px-4 max-w-7xl">
					<div className="text-center py-12">
						<p className="text-red-600 text-lg mb-2">
							Failed to load posts
						</p>
						<p className="text-gray-500 text-sm">
							{error instanceof Error
								? error.message
								: 'Please make sure the backend server is running on http://localhost:5000'}
						</p>
					</div>
				</div>
			</main>
		)
	}
}

