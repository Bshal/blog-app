'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
	DialogClose,
} from '@/components/ui/dialog'
import { apiClient } from '@/lib/api'
import { useToast } from '@/components/ui/toast'
import type { User, PaginatedUsers } from '@/types'
import { Loader2, Trash2, Edit, Users as UsersIcon, UserPlus } from 'lucide-react'
import Link from 'next/link'
import { AuthorAvatar } from '@/components/posts/AuthorAvatar'
import { Pagination } from '@/components/posts/Pagination'

// Format date helper
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

export default function AdminUsersPage() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const { user } = useAuth()
	const { addToast } = useToast()
	const [usersData, setUsersData] = useState<PaginatedUsers | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [editDialogOpen, setEditDialogOpen] = useState(false)
	const [editingUser, setEditingUser] = useState<User | null>(null)
	const [editFormData, setEditFormData] = useState({
		name: '',
		email: '',
		role: 'user' as 'user' | 'admin',
		isEmailVerified: false,
	})
	const [isSaving, setIsSaving] = useState(false)
	const page = parseInt(searchParams.get('page') || '1', 10)

	useEffect(() => {
		const loadUsers = async () => {
			try {
				setIsLoading(true)
				const data = await apiClient.getAdminUsers({
					page,
					limit: 10,
					sort: 'createdAt',
					order: 'desc',
				})
				setUsersData(data)
			} catch (err) {
				setError(
					err instanceof Error
						? err.message
						: 'Failed to load users'
				)
				addToast({
					type: 'error',
					message: err instanceof Error ? err.message : 'Failed to load users',
				})
			} finally {
				setIsLoading(false)
			}
		}

		if (user?.role === 'admin') {
			loadUsers()
		}
	}, [user, page, addToast])

	const handleEdit = (user: User) => {
		setEditingUser(user)
		setEditFormData({
			name: user.name,
			email: user.email,
			role: user.role,
			isEmailVerified: user.isEmailVerified,
		})
		setEditDialogOpen(true)
	}

	const handleEditSubmit = async () => {
		if (!editingUser) return

		try {
			setIsSaving(true)
			await apiClient.updateAdminUser(editingUser._id, {
				name: editFormData.name.trim(),
				email: editFormData.email.trim().toLowerCase(),
				role: editFormData.role,
				isEmailVerified: editFormData.isEmailVerified,
			})

			addToast({
				type: 'success',
				message: 'User updated successfully',
			})

			setEditDialogOpen(false)
			setEditingUser(null)

			// Reload users
			const data = await apiClient.getAdminUsers({
				page,
				limit: 10,
				sort: 'createdAt',
				order: 'desc',
			})
			setUsersData(data)
		} catch (err) {
			addToast({
				type: 'error',
				message: err instanceof Error ? err.message : 'Failed to update user',
			})
		} finally {
			setIsSaving(false)
		}
	}

	const handleDelete = async (userId: string, userName: string) => {
		if (!confirm(`Are you sure you want to delete user "${userName}"?`)) {
			return
		}

		try {
			await apiClient.deleteAdminUser(userId)
			addToast({
				type: 'success',
				message: 'User deleted successfully',
			})
			// Reload users
			const data = await apiClient.getAdminUsers({
				page,
				limit: 10,
				sort: 'createdAt',
				order: 'desc',
			})
			setUsersData(data)
		} catch (err) {
			addToast({
				type: 'error',
				message: err instanceof Error ? err.message : 'Failed to delete user',
			})
		}
	}

	if (!user || user.role !== 'admin') {
		return null
	}

	return (
		<AuthGuard requireAuth={true} requireAdmin={true}>
			<main className="min-h-screen py-8" style={{ backgroundColor: '#f6f5f4' }}>
				<div className="container mx-auto px-4 max-w-7xl">
					<div className="mb-8 flex items-center justify-between">
						<div>
							<h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
								<UsersIcon className="h-8 w-8" />
								User Management
							</h1>
							<p className="text-gray-600">Manage all users in the system</p>
						</div>
						<Button asChild>
							<Link href="/admin/create-admin" className="flex items-center gap-2">
								<UserPlus className="h-4 w-4" />
								Create Admin
							</Link>
						</Button>
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
					) : usersData ? (
						<>
							<Card className="p-6 bg-white border-0 shadow-sm">
								<div className="overflow-x-auto">
									<table className="w-full">
										<thead>
											<tr className="border-b border-gray-200">
												<th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">User</th>
												<th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
												<th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Role</th>
												<th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
												<th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Joined</th>
												<th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
											</tr>
										</thead>
										<tbody>
											{usersData.users.map((u) => (
												<tr key={u._id} className="border-b border-gray-100 hover:bg-gray-50">
													<td className="py-4 px-4">
														<div className="flex items-center gap-3">
															<AuthorAvatar
																avatarUrl={u.avatar}
																name={u.name}
																className="h-10 w-10"
															/>
															<span className="font-medium text-gray-900">{u.name}</span>
														</div>
													</td>
													<td className="py-4 px-4 text-sm text-gray-600">{u.email}</td>
													<td className="py-4 px-4">
														<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
															u.role === 'admin' 
																? 'bg-purple-100 text-purple-800' 
																: 'bg-blue-100 text-blue-800'
														}`}>
															{u.role}
														</span>
													</td>
													<td className="py-4 px-4">
														<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
															u.isEmailVerified 
																? 'bg-green-100 text-green-800' 
																: 'bg-yellow-100 text-yellow-800'
														}`}>
															{u.isEmailVerified ? 'Verified' : 'Unverified'}
														</span>
													</td>
													<td className="py-4 px-4 text-sm text-gray-600">
														{formatDate(u.createdAt)}
													</td>
													<td className="py-4 px-4">
														<div className="flex items-center justify-end gap-2">
															<Button
																variant="outline"
																size="sm"
																onClick={() => handleEdit(u)}
															>
																<Edit className="h-4 w-4" />
															</Button>
															<Button
																variant="outline"
																size="sm"
																onClick={() => handleDelete(u._id, u.name)}
																className="text-red-600 hover:text-red-700 hover:bg-red-50"
															>
																<Trash2 className="h-4 w-4" />
															</Button>
														</div>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>

								{usersData.users.length === 0 && (
									<div className="text-center py-12">
										<p className="text-gray-500">No users found</p>
									</div>
								)}
							</Card>

							{usersData.pagination.totalPages > 1 && (
								<div className="mt-6 flex justify-center">
									<Pagination 
										pagination={usersData.pagination} 
										basePath="/admin/users"
									/>
								</div>
							)}
						</>
					) : null}

					{/* Edit User Dialog */}
					<Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
						<DialogContent>
							<DialogClose onClose={() => setEditDialogOpen(false)} />
							<DialogHeader>
								<DialogTitle>Edit User</DialogTitle>
								<DialogDescription>
									Update user information. Changes will be saved immediately.
								</DialogDescription>
							</DialogHeader>

							<div className="space-y-4 py-4">
								<div className="space-y-2">
									<Label htmlFor="edit-name">Name</Label>
									<Input
										id="edit-name"
										value={editFormData.name}
										onChange={(e) =>
											setEditFormData((prev) => ({ ...prev, name: e.target.value }))
										}
										disabled={isSaving}
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="edit-email">Email</Label>
									<Input
										id="edit-email"
										type="email"
										value={editFormData.email}
										onChange={(e) =>
											setEditFormData((prev) => ({ ...prev, email: e.target.value }))
										}
										disabled={isSaving}
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="edit-role">Role</Label>
									<select
										id="edit-role"
										value={editFormData.role}
										onChange={(e) =>
											setEditFormData((prev) => ({
												...prev,
												role: e.target.value as 'user' | 'admin',
											}))
										}
										disabled={isSaving}
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
									>
										<option value="user">User</option>
										<option value="admin">Admin</option>
									</select>
								</div>

								<div className="flex items-center space-x-2">
									<input
										type="checkbox"
										id="edit-verified"
										checked={editFormData.isEmailVerified}
										onChange={(e) =>
											setEditFormData((prev) => ({
												...prev,
												isEmailVerified: e.target.checked,
											}))
										}
										disabled={isSaving}
										className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
									/>
									<Label htmlFor="edit-verified" className="cursor-pointer">
										Email Verified
									</Label>
								</div>
							</div>

							<DialogFooter>
								<Button
									variant="outline"
									onClick={() => setEditDialogOpen(false)}
									disabled={isSaving}
								>
									Cancel
								</Button>
								<Button onClick={handleEditSubmit} disabled={isSaving}>
									{isSaving ? (
										<>
											<Loader2 className="h-4 w-4 animate-spin mr-2" />
											Saving...
										</>
									) : (
										'Save Changes'
									)}
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>
			</main>
		</AuthGuard>
	)
}
