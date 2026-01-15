'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@/types'
import { apiClient } from '@/lib/api'

interface UseAuthReturn {
	user: User | null
	isAuthenticated: boolean
	isLoading: boolean
	setUser: (user: User | null) => void
	logout: () => Promise<void>
}

/**
 * Hook to get current authenticated user
 * Reads from localStorage where tokens are stored
 */
export function useAuth(): UseAuthReturn {
	const router = useRouter()
	const [user, setUserState] = useState<User | null>(null)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		// Check if user data is stored in localStorage
		const userData = localStorage.getItem('user')
		const token = localStorage.getItem('accessToken')

		if (userData && token) {
			try {
				setUserState(JSON.parse(userData))
			} catch {
				setUserState(null)
			}
		} else {
			setUserState(null)
		}

		setIsLoading(false)
	}, [])

	const setUser = useCallback((newUser: User | null) => {
		setUserState(newUser)
		if (newUser && typeof window !== 'undefined') {
			localStorage.setItem('user', JSON.stringify(newUser))
		} else if (typeof window !== 'undefined') {
			localStorage.removeItem('user')
		}
	}, [])

	const logout = useCallback(async () => {
		try {
			await apiClient.logout()
		} catch (error) {
			// Silently handle logout errors - tokens are already cleared
			// The error might occur if the token was already invalid/expired
			console.error('Logout error (ignored):', error)
		} finally {
			// Always clear user state and redirect, even if logout API call failed
			setUserState(null)
			router.push('/')
			router.refresh()
		}
	}, [router])

	return {
		user,
		isAuthenticated: !!user,
		isLoading,
		setUser,
		logout,
	}
}
