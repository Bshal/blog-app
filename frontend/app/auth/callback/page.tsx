'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/ui/toast'
import { Loader2 } from 'lucide-react'

export default function OAuthCallbackPage() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const { setUser } = useAuth()
	const { addToast } = useToast()
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		const handleCallback = async () => {
			try {
				// Get tokens from URL parameters
				const accessToken = searchParams.get('token')
				const refreshToken = searchParams.get('refreshToken')

				if (!accessToken || !refreshToken) {
					setError('Missing authentication tokens')
					addToast({
						type: 'error',
						message: 'OAuth authentication failed. Missing tokens.',
					})
					setTimeout(() => router.push('/auth/login'), 2000)
					return
				}

				// Store tokens
				if (typeof window !== 'undefined') {
					localStorage.setItem('accessToken', accessToken)
					localStorage.setItem('refreshToken', refreshToken)
				}

				// Fetch user data using the access token
				const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'
				const response = await fetch(`${apiUrl}/auth/me`, {
					headers: {
						'Authorization': `Bearer ${accessToken}`,
						'Content-Type': 'application/json',
					},
				})

				if (!response.ok) {
					throw new Error('Failed to fetch user data')
				}

				const data = await response.json()
				
				if (data.success && data.data?.user) {
					// Store user data
					if (typeof window !== 'undefined') {
						localStorage.setItem('user', JSON.stringify(data.data.user))
					}
					setUser(data.data.user)

					addToast({
						type: 'success',
						message: 'Successfully logged in!',
					})

					// Redirect to dashboard
					router.push('/dashboard')
					router.refresh()
				} else {
					throw new Error('Invalid user data received')
				}
			} catch (err) {
				const errorMessage = err instanceof Error ? err.message : 'OAuth authentication failed'
				setError(errorMessage)
				addToast({
					type: 'error',
					message: errorMessage,
				})
				setTimeout(() => router.push('/auth/login'), 2000)
			}
		}

		handleCallback()
	}, [searchParams, router, setUser, addToast])

	if (error) {
		return (
			<main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f6f5f4' }}>
				<div className="text-center">
					<p className="text-red-600 text-lg mb-4">{error}</p>
					<p className="text-gray-600">Redirecting to login page...</p>
				</div>
			</main>
		)
	}

	return (
		<main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f6f5f4' }}>
			<div className="text-center">
				<Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
				<p className="text-gray-600">Completing authentication...</p>
			</div>
		</main>
	)
}
