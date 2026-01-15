'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

interface AuthGuardProps {
	children: React.ReactNode
	requireAuth?: boolean
	requireAdmin?: boolean
}

export function AuthGuard({
	children,
	requireAuth = true,
	requireAdmin = false,
}: AuthGuardProps) {
	const { user, isAuthenticated, isLoading } = useAuth()
	const router = useRouter()

	useEffect(() => {
		if (isLoading) return

		if (requireAuth && !isAuthenticated) {
			router.push('/auth/login')
			return
		}

		if (requireAdmin && user?.role !== 'admin') {
			router.push('/')
			return
		}
	}, [isAuthenticated, isLoading, requireAuth, requireAdmin, user, router])

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f6f5f4' }}>
				<div className="text-gray-600">Loading...</div>
			</div>
		)
	}

	if (requireAuth && !isAuthenticated) {
		return null
	}

	if (requireAdmin && user?.role !== 'admin') {
		return null
	}

	return <>{children}</>
}
