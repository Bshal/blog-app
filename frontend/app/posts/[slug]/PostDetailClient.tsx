'use client'

import { useAuth } from '@/hooks/useAuth'
import { PostActions } from '@/components/posts/PostActions'
import type { Post } from '@/types'

interface PostDetailClientProps {
	post: Post
	authorId: string
}

export function PostDetailClient({ post, authorId }: PostDetailClientProps) {
	const { user } = useAuth()

	return (
		<PostActions
			postId={post._id}
			postSlug={post.slug}
			authorId={authorId}
			currentUserId={user?._id}
			currentUserRole={user?.role}
		/>
	)
}
