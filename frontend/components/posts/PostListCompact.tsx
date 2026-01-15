'use client'

import { PostListItem } from './PostListItem'
import type { Post } from '@/types'

interface PostListCompactProps {
	posts: Post[]
	className?: string
}

export function PostListCompact({ posts, className }: PostListCompactProps) {
	if (posts.length === 0) {
		return (
			<div className="text-center py-8">
				<p className="text-gray-500 text-sm">No posts found.</p>
			</div>
		)
	}

	return (
		<div className={className}>
			<div className="space-y-1">
				{posts.map((post) => (
					<PostListItem key={post._id} post={post} />
				))}
			</div>
		</div>
	)
}
