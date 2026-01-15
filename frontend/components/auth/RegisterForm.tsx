'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'
import { apiClient } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'

export function RegisterForm() {
	const router = useRouter()
	const { setUser } = useAuth()
	const { addToast } = useToast()
	const [name, setName] = useState('')
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
			const response = await apiClient.register({ name: name.trim(), email: normalizedEmail, password })
			setUser(response.user)
			addToast({
				type: 'success',
				message: 'Account created successfully!',
			})
			router.push('/dashboard')
			router.refresh()
		} catch (err) {
			const errorMessage = err instanceof Error
				? err.message
				: 'Failed to register. Please try again.'
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
				<label htmlFor="name" className="text-sm font-medium text-gray-700">
					Name
				</label>
				<Input
					id="name"
					type="text"
					value={name}
					onChange={(e) => setName(e.target.value)}
					required
					minLength={2}
					maxLength={50}
					placeholder="Enter your name"
					disabled={isLoading}
				/>
			</div>

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
					minLength={6}
					placeholder="Enter your password (min 6 characters)"
					disabled={isLoading}
				/>
			</div>

			<Button type="submit" className="w-full" disabled={isLoading}>
				{isLoading ? 'Creating account...' : 'Sign Up'}
			</Button>

			<div className="text-center text-sm text-gray-600">
				Already have an account?{' '}
				<Link href="/auth/login" className="text-blue-600 hover:underline">
					Login
				</Link>
			</div>
		</form>
	)
}
