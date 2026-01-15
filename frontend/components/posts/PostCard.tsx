'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { StatusBadge } from './StatusBadge'
import { EngagementMetrics } from './EngagementMetrics'
import { AuthorAvatar } from './AuthorAvatar'
import type { Post } from '@/types'

interface PostCardProps {
	post: Post
	showStatus?: boolean
}

function getAuthor(post: Post) {
	if (typeof post.author === 'string') {
		return { _id: post.author, name: 'Unknown', email: '', avatar: '' }
	}
	return post.author
}

function formatDate(dateString: string): string {
	try {
		const date = new Date(dateString)
		const day = date.getDate()
		const month = date.toLocaleDateString('en-US', { month: 'short' })
		const year = date.getFullYear()
		return `${day} ${month} ${year}`
	} catch {
		return dateString
	}
}

function getExcerpt(content: string, maxLength: number = 120): string {
	if (content.length <= maxLength) return content
	return content.substring(0, maxLength).trim() + '...'
}

export function PostCard({ post, showStatus = false }: PostCardProps) {
	const author = getAuthor(post)
	const excerpt = getExcerpt(post.content)
	const status = post.isDeleted ? 'draft' : 'published'
	// Use post image from public/posts folder or external URL
	const getImageUrl = () => {
		if (!post.imageUrl) return ''
		// If it's already a full URL (http/https), use it as-is
		if (post.imageUrl.startsWith('http://') || post.imageUrl.startsWith('https://')) {
			return post.imageUrl
		}
		// Otherwise, treat it as a filename in public/posts folder
		return `/posts/${post.imageUrl}`
	}
	const imageUrl = getImageUrl()

	const handlePostClick = (e: React.MouseEvent) => {
		// Store referrer before navigating
		if (typeof window !== 'undefined') {
			sessionStorage.setItem('postDetailReferrer', window.location.pathname)
		}
	}

	return (
		<Link 
			href={`/posts/${post.slug}`} 
			className="block h-full"
			onClick={handlePostClick}
		>
			<Card 
				className="group overflow-hidden bg-white transition-shadow duration-200 cursor-pointer h-full border-0 rounded-lg" 
			>
				<div className="flex flex-col md:flex-row h-full">
					{/* Content Section - Left side (~60%) */}
					<div className="flex-[1.5] p-6 flex flex-col justify-between min-w-0">
						<div className="space-y-3">
							{/* Status and Date */}
							<div className="flex items-center gap-2 mb-1">
								{showStatus && status === 'draft' && <StatusBadge status={status} />}
								<span className="text-xs text-gray-500 whitespace-nowrap">
									{formatDate(post.createdAt)}
								</span>
							</div>

							{/* Title */}
							<h3 className="text-xl font-semibold text-gray-900 leading-snug group-hover:underline transition-all line-clamp-2">
								{post.title}
							</h3>

							{/* Excerpt */}
							<p className="text-sm text-gray-600 leading-relaxed line-clamp-3 mt-2">
								{excerpt}
							</p>
						</div>

						{/* Engagement Metrics */}
						<div className="mt-6 pt-2">
							<EngagementMetrics
								commentsCount={post.commentCount || 0}
								viewsCount={0} // TODO: Get from backend when available
								sharesCount={0} // TODO: Get from backend when available
							/>
						</div>
					</div>

					{/* Image and Avatar Section - Right side (~40%) */}
					<div className="relative flex-1 md:w-[40%] h-48 md:h-auto flex-shrink-0 overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 rounded-r-lg">
						{imageUrl ? (
							<Image
								src={imageUrl}
								alt={post.title}
								fill
								className="object-cover"
								sizes="(max-width: 768px) 100vw, 40vw"
							/>
						) : (
							<div className="w-full h-full bg-gradient-to-br from-blue-200 to-purple-200" />
						)}
						{/* Author Avatar Overlay */}
						<div className="absolute top-3 right-3 z-10">
							<AuthorAvatar
								avatarUrl={author.avatar}
								name={author.name}
							/>
						</div>
					</div>
				</div>
			</Card>
		</Link>
	)
}
