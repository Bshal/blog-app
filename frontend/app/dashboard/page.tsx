'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { PostListCompact } from '@/components/posts/PostListCompact'
import { CommentList } from '@/components/comments/CommentList'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogClose,
} from '@/components/ui/dialog'
import { apiClient } from '@/lib/api'
import { useToast } from '@/components/ui/toast'
import type { Post, Comment, PaginatedPosts, PaginatedComments, User, PaginatedUsers } from '@/types'
import { Loader2, ChevronRight, Users, FileText, Trash2 } from 'lucide-react'

export default function DashboardPage() {
	const { user } = useAuth()
	const { addToast } = useToast()
	const [userPosts, setUserPosts] = useState<Post[]>([])
	const [userComments, setUserComments] = useState<Comment[]>([])
	const [totalUsers, setTotalUsers] = useState<number | null>(null)
	const [totalPosts, setTotalPosts] = useState<number | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	
	// Dialog states
	const [usersDialogOpen, setUsersDialogOpen] = useState(false)
	const [postsDialogOpen, setPostsDialogOpen] = useState(false)
	const [usersData, setUsersData] = useState<PaginatedUsers | null>(null)
	const [postsData, setPostsData] = useState<PaginatedPosts | null>(null)
	const [isLoadingUsers, setIsLoadingUsers] = useState(false)
	const [isLoadingPosts, setIsLoadingPosts] = useState(false)
	const [deletingUserId, setDeletingUserId] = useState<string | null>(null)
	const [deletingPostId, setDeletingPostId] = useState<string | null>(null)

	useEffect(() => {
		if (!user) return

		const loadUserData = async () => {
			try {
				setIsLoading(true)
				const [postsData, commentsData] = await Promise.all([
					apiClient.getPostsByAuthor(user._id, { limit: 5, sort: 'createdAt', order: 'desc' }),
					apiClient.getCommentsByAuthor(user._id, { limit: 5, sort: 'createdAt', order: 'desc' }),
				])
				setUserPosts(postsData.posts)
				setUserComments(commentsData.comments)

				// Load stats - try public stats first, fallback to admin dashboard if user is admin
				try {
					const statsData = await apiClient.getPublicStats()
					setTotalUsers(statsData.totalUsers)
					setTotalPosts(statsData.totalPosts)
				} catch (statsError) {
					console.error('Failed to load public stats:', statsError)
					// If public stats fail and user is admin, try admin dashboard
					if (user.role === 'admin') {
						try {
							const adminStats = await apiClient.getAdminDashboard()
							setTotalUsers(adminStats.totalUsers)
							setTotalPosts(adminStats.totalPosts)
						} catch (adminError) {
							console.error('Failed to load admin stats:', adminError)
							// Set to 0 as fallback
							setTotalUsers(0)
							setTotalPosts(0)
						}
					} else {
						// For non-admin users, set to 0 if public stats fail
						setTotalUsers(0)
						setTotalPosts(0)
					}
				}
			} catch (err) {
				setError(
					err instanceof Error
						? err.message
						: 'Failed to load dashboard data'
				)
			} finally {
				setIsLoading(false)
			}
		}

		loadUserData()
	}, [user])

	// Load users when dialog opens
	useEffect(() => {
		if (usersDialogOpen && user?.role === 'admin') {
			const loadUsers = async () => {
				try {
					setIsLoadingUsers(true)
					const data = await apiClient.getAdminUsers({
						page: 1,
						limit: 50,
						sort: 'createdAt',
						order: 'desc',
					})
					setUsersData(data)
				} catch (err) {
					addToast({
						type: 'error',
						message: err instanceof Error ? err.message : 'Failed to load users',
					})
				} finally {
					setIsLoadingUsers(false)
				}
			}
			loadUsers()
		}
	}, [usersDialogOpen, user, addToast])

	// Load posts when dialog opens
	useEffect(() => {
		if (postsDialogOpen && user?.role === 'admin') {
			const loadPosts = async () => {
				try {
					setIsLoadingPosts(true)
					const data = await apiClient.getAdminPosts({
						page: 1,
						limit: 50,
						sort: 'createdAt',
						order: 'desc',
					})
					setPostsData(data)
				} catch (err) {
					addToast({
						type: 'error',
						message: err instanceof Error ? err.message : 'Failed to load posts',
					})
				} finally {
					setIsLoadingPosts(false)
				}
			}
			loadPosts()
		}
	}, [postsDialogOpen, user, addToast])

	const handleDeleteUser = async (userId: string, userName: string) => {
		if (!confirm(`Are you sure you want to delete user "${userName}"?`)) {
			return
		}

		try {
			setDeletingUserId(userId)
			await apiClient.deleteAdminUser(userId)
			addToast({
				type: 'success',
				message: 'User deleted successfully',
			})
			// Reload users
			const data = await apiClient.getAdminUsers({
				page: 1,
				limit: 50,
				sort: 'createdAt',
				order: 'desc',
			})
			setUsersData(data)
			// Update total users count
			const statsData = await apiClient.getPublicStats().catch(() => null)
			if (statsData) {
				setTotalUsers(statsData.totalUsers)
			}
		} catch (err) {
			addToast({
				type: 'error',
				message: err instanceof Error ? err.message : 'Failed to delete user',
			})
		} finally {
			setDeletingUserId(null)
		}
	}

	const handleDeletePost = async (postId: string, postTitle: string) => {
		if (!confirm(`Are you sure you want to delete post "${postTitle}"?`)) {
			return
		}

		try {
			setDeletingPostId(postId)
			await apiClient.deletePost(postId)
			addToast({
				type: 'success',
				message: 'Post deleted successfully',
			})
			// Reload posts
			const data = await apiClient.getAdminPosts({
				page: 1,
				limit: 50,
				sort: 'createdAt',
				order: 'desc',
			})
			setPostsData(data)
		} catch (err) {
			addToast({
				type: 'error',
				message: err instanceof Error ? err.message : 'Failed to delete post',
			})
		} finally {
			setDeletingPostId(null)
		}
	}

	if (!user) return null

	return (
		<AuthGuard>
			<main className="min-h-screen py-8" style={{ backgroundColor: '#f6f5f4' }}>
				<div className="container mx-auto px-4 max-w-7xl">
					<div className="mb-8">
						<h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
						<p className="text-gray-600">Welcome back, {user.name}!</p>
					</div>

					{error && (
						<div className="mb-6 p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
							{error}
						</div>
					)}

					{isLoading ? (
						<div className="flex items-center justify-center py-12">
							<Loader2 className="h-6 w-6 animate-spin text-gray-400" />
						</div>
					) : (
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
							{/* Stats Cards */}
							<div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-4 gap-4">
								<Card className="p-6 bg-white border-0 shadow-none">
									<div className="flex items-start justify-between mb-2">
										<div className="text-sm text-gray-600">Total Users</div>
										{user.role === 'admin' && (
											<button
												onClick={() => setUsersDialogOpen(true)}
												className="text-xs text-blue-600 hover:text-blue-700 underline cursor-pointer flex items-center gap-1.5"
											>
												<Users className="h-3.5 w-3.5" />
												Manage Users
											</button>
										)}
									</div>
									<div className="text-3xl font-bold text-gray-900">
										{totalUsers !== null ? totalUsers : '—'}
									</div>
								</Card>
								<Card className="p-6 bg-white border-0 shadow-none">
									<div className="flex items-start justify-between mb-2">
										<div className="text-sm text-gray-600">Total Posts</div>
										{user.role === 'admin' && (
											<button
												onClick={() => setPostsDialogOpen(true)}
												className="text-xs text-blue-600 hover:text-blue-700 underline cursor-pointer flex items-center gap-1.5"
											>
												<FileText className="h-3.5 w-3.5" />
												Manage Posts
											</button>
										)}
									</div>
									<div className="text-3xl font-bold text-gray-900">
										{totalPosts !== null ? totalPosts : '—'}
									</div>
								</Card>
								<Card className="p-6 bg-white border-0 shadow-none">
									<div className="text-sm text-gray-600 mb-1">Total Comments</div>
									<div className="text-3xl font-bold text-gray-900">{userComments.length}</div>
								</Card>
								<Card className="p-6 bg-white border-0 shadow-none">
									<div className="text-sm text-gray-600 mb-1">Role</div>
									<div className="text-3xl font-bold text-gray-900 capitalize">{user.role}</div>
								</Card>
							</div>

							{/* User Posts */}
							<Card className="p-6 bg-white border-0 shadow-none">
								<div className="mb-4">
									<h2 className="text-xl font-bold text-gray-900">Your Recent Posts</h2>
								</div>
								{userPosts.length > 0 ? (
									<PostListCompact posts={userPosts} />
								) : (
									<div className="text-center py-8">
										<p className="text-gray-500 mb-4">You haven't created any posts yet.</p>
										<Button asChild>
											<Link href="/posts/create">Create Your First Post</Link>
										</Button>
									</div>
								)}
							</Card>

							{/* User Comments */}
							<Card className="p-6 bg-white border-0 shadow-none">
								<div className="mb-4">
									<h2 className="text-xl font-bold text-gray-900">Your Recent Comments</h2>
								</div>
								{userComments.length > 0 ? (
									<CommentList
										comments={userComments}
										currentUserId={user._id}
										onEdit={() => {}}
										onDelete={() => {}}
									/>
								) : (
									<div className="text-center py-8">
										<p className="text-gray-500">You haven't made any comments yet.</p>
									</div>
								)}
							</Card>
						</div>
					)}

					{/* Manage Users Dialog */}
					<Dialog open={usersDialogOpen} onOpenChange={setUsersDialogOpen}>
						<DialogContent className="max-w-3xl max-h-[60vh] flex flex-col">
							<DialogClose onClose={() => setUsersDialogOpen(false)} />
							<DialogHeader>
								<DialogTitle>Manage Users</DialogTitle>
								<DialogDescription>
									View and manage all users. You can delete users from this list.
								</DialogDescription>
							</DialogHeader>
							<div className="flex-1 overflow-y-auto mt-4 custom-scrollbar pr-2">
								{isLoadingUsers ? (
									<div className="flex items-center justify-center py-12">
										<Loader2 className="h-6 w-6 animate-spin text-gray-400" />
									</div>
								) : usersData && usersData.users.length > 0 ? (
									<div className="space-y-2 pl-1">
										{usersData.users.map((u: User) => (
											<div
												key={u._id}
												className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50"
											>
												<div className="flex-1">
													<div className="font-medium text-gray-900">{u.name}</div>
													<div className="text-sm text-gray-600">{u.email}</div>
													<div className="text-xs text-gray-500 mt-1">
														Role: {u.role} • {u.isEmailVerified ? 'Verified' : 'Unverified'}
													</div>
												</div>
												<Button
													variant="outline"
													size="sm"
													onClick={() => handleDeleteUser(u._id, u.name)}
													disabled={deletingUserId === u._id}
													className="text-red-600 hover:text-red-700 hover:bg-red-50"
												>
													{deletingUserId === u._id ? (
														<Loader2 className="h-4 w-4 animate-spin" />
													) : (
														<>
															<Trash2 className="h-4 w-4 mr-1" />
															Delete
														</>
													)}
												</Button>
											</div>
										))}
									</div>
								) : (
									<div className="text-center py-8 text-gray-500">
										No users found.
									</div>
								)}
							</div>
						</DialogContent>
					</Dialog>

					{/* Manage Posts Dialog */}
					<Dialog open={postsDialogOpen} onOpenChange={setPostsDialogOpen}>
						<DialogContent className="max-w-3xl max-h-[60vh] flex flex-col">
							<DialogClose onClose={() => setPostsDialogOpen(false)} />
							<DialogHeader>
								<DialogTitle>Manage Posts</DialogTitle>
								<DialogDescription>
									View and manage all posts. You can delete posts from this list.
								</DialogDescription>
							</DialogHeader>
							<div className="flex-1 overflow-y-auto mt-4 custom-scrollbar pr-2">
								{isLoadingPosts ? (
									<div className="flex items-center justify-center py-12">
										<Loader2 className="h-6 w-6 animate-spin text-gray-400" />
									</div>
								) : postsData && postsData.posts.length > 0 ? (
									<div className="space-y-2 pl-1">
										{postsData.posts
											.filter((p: Post) => p && p._id && p.title) // Filter out null/invalid posts
											.map((p: Post) => (
												<div
													key={p._id}
													className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50"
												>
													<div className="flex-1">
														<div className="font-medium text-gray-900">{p.title || 'Untitled Post'}</div>
														<div className="text-sm text-gray-600 line-clamp-2 mt-1">
															{p.content ? `${p.content.substring(0, 100)}...` : 'No content'}
														</div>
														<div className="text-xs text-gray-500 mt-1">
															{typeof p.author === 'object' && p.author
																? `By ${p.author.name}`
																: ''} • {p.isDeleted ? 'Deleted' : 'Active'}
														</div>
													</div>
													<Button
														variant="outline"
														size="sm"
														onClick={() => handleDeletePost(p._id, p.title || 'Untitled Post')}
														disabled={deletingPostId === p._id}
														className="text-red-600 hover:text-red-700 hover:bg-red-50"
													>
														{deletingPostId === p._id ? (
															<Loader2 className="h-4 w-4 animate-spin" />
														) : (
															<>
																<Trash2 className="h-4 w-4 mr-1" />
																Delete
															</>
														)}
													</Button>
												</div>
											))}
									</div>
								) : (
									<div className="text-center py-8 text-gray-500">
										No posts found.
									</div>
								)}
							</div>
						</DialogContent>
					</Dialog>
				</div>
			</main>
		</AuthGuard>
	)
}
