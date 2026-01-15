import { apiClient } from '@/lib/api'
import { PostList } from '@/components/posts/PostList'
import { Pagination } from '@/components/posts/Pagination'
import { AuthorAvatar } from '@/components/posts/AuthorAvatar'
import { notFound } from 'next/navigation'

interface AuthorPostsPageProps {
	params: Promise<{
		authorId: string
	}>
	searchParams: Promise<{
		page?: string
		limit?: string
		sort?: string
		order?: 'asc' | 'desc'
	}>
}

export default async function AuthorPostsPage({
	params,
	searchParams,
}: AuthorPostsPageProps) {
	const [resolvedParams, resolvedSearchParams] = await Promise.all([
		params,
		searchParams,
	])
	const page = parseInt(resolvedSearchParams.page || '1', 10)
	const limit = parseInt(resolvedSearchParams.limit || '10', 10)
	const sort = resolvedSearchParams.sort || 'createdAt'
	const order = resolvedSearchParams.order || 'desc'

	try {
		const data = await apiClient.getPostsByAuthor(resolvedParams.authorId, {
			page,
			limit,
			sort,
			order,
		})

		// Get author info from first post if available
		const author =
			data.posts.length > 0 && typeof data.posts[0].author !== 'string'
				? data.posts[0].author
				: { _id: resolvedParams.authorId, name: 'Unknown', email: '', avatar: '' }

		return (
			<main className="min-h-screen flex flex-col py-8">
				<div className="flex-1 container mx-auto px-4 max-w-7xl">
					{/* Author Header */}
					<div className="mb-8 flex items-center gap-4">
						<AuthorAvatar
							avatarUrl={author.avatar}
							name={author.name}
							className="h-16 w-16"
						/>
						<div>
							<h1 className="text-3xl font-bold text-gray-900 mb-2">
								{author.name}'s Posts
							</h1>
							<p className="text-gray-600">
								{data.pagination.total} post{data.pagination.total !== 1 ? 's' : ''}
							</p>
						</div>
					</div>

					<PostList posts={data.posts} />

					{data.pagination.totalPages > 1 && (
						<div className="mt-8 flex justify-center">
							<Pagination
								pagination={data.pagination}
								basePath={`/posts/author/${resolvedParams.authorId}`}
							/>
						</div>
					)}
				</div>
			</main>
		)
	} catch (error) {
		notFound()
	}
}
