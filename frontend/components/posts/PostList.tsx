'use client'

import { PostCard } from './PostCard'
import type { Post } from '@/types'
import { cn } from '@/lib/utils'

interface PostListProps {
	posts: Post[]
	showStatus?: boolean
	className?: string
	vertical?: boolean
}

export function PostList({ posts, showStatus = false, className, vertical = false }: PostListProps) {
	if (posts.length === 0) {
		return (
			<div className="text-center py-12">
				<p className="text-gray-500 text-lg">No posts found.</p>
			</div>
		)
	}

	return (
		<div
			className={cn(
				vertical 
					? 'flex flex-col gap-4' 
					: 'grid grid-cols-1 md:grid-cols-2 gap-6',
				className
			)}
		>
			{posts.map((post) => (
				<PostCard key={post._id} post={post} showStatus={showStatus} />
			))}
		</div>
	)
}
