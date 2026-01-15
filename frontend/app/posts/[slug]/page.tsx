import { apiClient } from '@/lib/api'
import { AuthorAvatar } from '@/components/posts/AuthorAvatar'
import { PostActions } from '@/components/posts/PostActions'
import { CommentsSection } from '@/components/comments/CommentsSection'
import { EngagementMetrics } from '@/components/posts/EngagementMetrics'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import Image from 'next/image'
import type { Post } from '@/types'
import { PostDetailClient } from './PostDetailClient'
import { BackButton } from './BackButton'

interface PostDetailPageProps {
	params: Promise<{
		slug: string
	}>
}

function getAuthor(post: Post) {
	if (typeof post.author === 'string') {
		return { _id: post.author, name: 'Unknown', email: '', avatar: '' }
	}
	return post.author
}

function getImageUrl(post: Post): string | null {
	if (!post.imageUrl) return null
	// If it's already a full URL (http/https), use it as-is
	if (post.imageUrl.startsWith('http://') || post.imageUrl.startsWith('https://')) {
		return post.imageUrl
	}
	// Otherwise, treat it as a filename in public/posts folder
	return `/posts/${post.imageUrl}`
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
	const resolvedParams = await params
	try {
		const slug = resolvedParams.slug
		if (!slug) {
			throw new Error('Post slug is required')
		}
		
		const post = await apiClient.getPostByIdOrSlug(slug)
		if (!post || !post._id) {
			throw new Error('Post not found')
		}
		const author = getAuthor(post)
		const imageUrl = getImageUrl(post)

		return (
			<main className="min-h-screen flex flex-col py-8" style={{ backgroundColor: '#f6f5f4' }}>
					<div className="flex-1 container mx-auto px-4 max-w-4xl">
						<BackButton />

						<article className="bg-white rounded-lg shadow-sm p-8">
							{/* Post Image */}
							{imageUrl && (
								<div className="relative w-full h-64 md:h-96 mb-6 rounded-lg overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300">
									<Image
										src={imageUrl}
										alt={post.title}
										fill
										className="object-cover"
										sizes="(max-width: 768px) 100vw, 896px"
										priority
									/>
								</div>
							)}

							{/* Header */}
							<header className="mb-6">
								<h1 className="text-4xl font-bold text-gray-900 mb-4">
									{post.title}
								</h1>

								{/* Author and Date */}
								<div className="flex items-center gap-4 mb-4">
									<AuthorAvatar
										avatarUrl={author.avatar}
										name={author.name}
										className="h-12 w-12"
									/>
									<div>
										<Link
											href={`/posts/author/${author._id}`}
											className="font-semibold text-gray-900 hover:text-blue-600 transition-colors"
										>
											{author.name}
										</Link>
										<p className="text-sm text-gray-500">
											{formatDistanceToNow(new Date(post.createdAt), {
												addSuffix: true,
											})}
										</p>
									</div>
								</div>

								{/* Updated timestamp if different */}
								{post.updatedAt !== post.createdAt && (
									<p className="text-xs text-gray-400">
										Updated{' '}
										{formatDistanceToNow(new Date(post.updatedAt), {
											addSuffix: true,
										})}
									</p>
								)}

								{/* Engagement Metrics */}
								<div className="mt-4">
									<EngagementMetrics
										commentsCount={post.commentCount || 0}
										viewsCount={0} // TODO: Get from backend when available
										sharesCount={0} // TODO: Get from backend when available
									/>
								</div>
							</header>

							{/* Content */}
							<div
								className="prose prose-lg max-w-none text-gray-700"
								dangerouslySetInnerHTML={{
									__html: post.content.replace(/\n/g, '<br />'),
								}}
							/>

							{/* Post Actions (Edit/Delete) */}
							<PostDetailClient post={post} authorId={author._id} />

							{/* Divider */}
							<hr className="my-8 border-gray-200" />

							{/* Comments Section */}
							<CommentsSection postId={post._id} />
					</article>
				</div>
			</main>
		)
	} catch (error) {
		return (
			<main className="min-h-screen flex flex-col py-8">
				<div className="flex-1 container mx-auto px-4 max-w-4xl">
					<div className="text-center py-12">
						<h1 className="text-2xl font-bold text-gray-900 mb-4">
							Post Not Found
						</h1>
						<p className="text-gray-600 mb-6">
							{error instanceof Error
								? error.message
								: 'The post you are looking for does not exist.'}
						</p>
						<BackButton />
					</div>
				</div>
			</main>
		)
	}
}
