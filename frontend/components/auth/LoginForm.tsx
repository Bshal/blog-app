'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'
import { apiClient } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'

export function LoginForm() {
	const router = useRouter()
	const { setUser } = useAuth()
	const { addToast } = useToast()
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState(false)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError(null)
		setIsLoading(true)

		try {
			// Normalize email to lowercase and trim whitespace
			const normalizedEmail = email.toLowerCase().trim()
			const response = await apiClient.login({ email: normalizedEmail, password })
			setUser(response.user)
			addToast({
				type: 'success',
				message: 'Logged in successfully!',
			})
			router.push('/dashboard')
			router.refresh()
		} catch (err) {
			const errorMessage = err instanceof Error
				? err.message
				: 'Failed to login. Please check your credentials.'
			setError(errorMessage)
			addToast({
				type: 'error',
				message: errorMessage,
			})
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			{error && (
				<div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
					{error}
				</div>
			)}

			<div className="space-y-2">
				<label htmlFor="email" className="text-sm font-medium text-gray-700">
					Email
				</label>
				<Input
					id="email"
					type="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					required
					placeholder="Enter your email"
					disabled={isLoading}
				/>
			</div>

			<div className="space-y-2">
				<label htmlFor="password" className="text-sm font-medium text-gray-700">
					Password
				</label>
				<Input
					id="password"
					type="password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					required
					placeholder="Enter your password"
					disabled={isLoading}
				/>
			</div>

			<Button type="submit" className="w-full" disabled={isLoading}>
				{isLoading ? 'Logging in...' : 'Login'}
			</Button>

			<div className="text-center text-sm text-gray-600">
				Don't have an account?{' '}
				<Link href="/auth/register" className="text-blue-600 hover:underline">
					Sign up
				</Link>
			</div>
		</form>
	)
}
