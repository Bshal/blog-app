'use client'

import Link from 'next/link'
import Image from 'next/image'
import { EngagementMetrics } from './EngagementMetrics'
import { formatDistanceToNow } from 'date-fns'
import type { Post } from '@/types'

interface PostListItemProps {
	post: Post
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
		return formatDistanceToNow(date, { addSuffix: true })
	} catch {
		return dateString
	}
}

export function PostListItem({ post }: PostListItemProps) {
	const author = getAuthor(post)
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
			className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors group"
			onClick={handlePostClick}
		>
			{/* Small square image */}
			<div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300">
				{imageUrl ? (
					<Image
						src={imageUrl}
						alt={post.title}
						fill
						className="object-cover"
						sizes="64px"
					/>
				) : (
					<div className="w-full h-full bg-gradient-to-br from-blue-200 to-purple-200" />
				)}
			</div>

			{/* Content */}
			<div className="flex-1 min-w-0">
				<h3 className="text-base font-semibold text-gray-900 group-hover:underline line-clamp-1 mb-1">
					{post.title}
				</h3>
				<div className="flex items-center gap-4 mb-2">
					<span className="text-xs text-gray-500">{formatDate(post.createdAt)}</span>
					<EngagementMetrics
						commentsCount={post.commentCount || 0}
						viewsCount={0} // TODO: Get from backend when available
						sharesCount={0} // TODO: Get from backend when available
					/>
				</div>
			</div>
		</Link>
	)
}
