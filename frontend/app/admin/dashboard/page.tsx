'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api'
import type { DashboardStats } from '@/types'
import { Loader2, Users, FileText, MessageSquare, UserPlus, ChevronRight } from 'lucide-react'

export default function AdminDashboardPage() {
	const { user } = useAuth()
	const [stats, setStats] = useState<DashboardStats | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		if (!user || user.role !== 'admin') return

		const loadStats = async () => {
			try {
				setIsLoading(true)
				const data = await apiClient.getAdminDashboard()
				setStats(data)
			} catch (err) {
				setError(
					err instanceof Error
						? err.message
						: 'Failed to load dashboard statistics'
				)
			} finally {
				setIsLoading(false)
			}
		}

		loadStats()
	}, [user])

	if (!user || user.role !== 'admin') {
		return null
	}

	return (
		<AuthGuard requireAuth={true} requireAdmin={true}>
			<main className="min-h-screen py-8" style={{ backgroundColor: '#f6f5f4' }}>
				<div className="container mx-auto px-4 max-w-7xl">
					<div className="mb-8">
						<h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
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
					) : stats ? (
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
							{/* Stats Cards */}
							<div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-4 gap-4">
								<Card className="p-6 bg-white border-0 shadow-none">
									<div className="text-sm text-gray-600 mb-1">Total Users</div>
									<div className="text-3xl font-bold text-gray-900 mb-3">{stats.totalUsers}</div>
									<Button asChild size="sm" variant="outline" className="w-full">
										<Link href="/admin/users" className="flex items-center justify-center gap-1">
											Manage Users
											<ChevronRight className="h-4 w-4" />
										</Link>
									</Button>
								</Card>
								<Card className="p-6 bg-white border-0 shadow-none">
									<div className="text-sm text-gray-600 mb-1">Total Posts</div>
									<div className="text-3xl font-bold text-gray-900 mb-3">{stats.totalPosts}</div>
									<Button asChild size="sm" variant="outline" className="w-full">
										<Link href="/admin/posts" className="flex items-center justify-center gap-1">
											Manage Posts
											<ChevronRight className="h-4 w-4" />
										</Link>
									</Button>
								</Card>
								<Card className="p-6 bg-white border-0 shadow-none">
									<div className="text-sm text-gray-600 mb-1">Total Comments</div>
									<div className="text-3xl font-bold text-gray-900 mb-3">{stats.totalComments}</div>
									<Button asChild size="sm" variant="outline" className="w-full">
										<Link href="/admin/comments" className="flex items-center justify-center gap-1">
											Manage Comments
											<ChevronRight className="h-4 w-4" />
										</Link>
									</Button>
								</Card>
								<Card className="p-6 bg-white border-0 shadow-none">
									<div className="text-sm text-gray-600 mb-1">Admin Actions</div>
									<div className="text-3xl font-bold text-gray-900 mb-3">—</div>
									<Button asChild size="sm" variant="outline" className="w-full">
										<Link href="/admin/create-admin" className="flex items-center justify-center gap-1">
											<UserPlus className="h-4 w-4" />
											Create Admin
										</Link>
									</Button>
								</Card>
							</div>
						</div>
					) : null}
				</div>
			</main>
		</AuthGuard>
	)
}
