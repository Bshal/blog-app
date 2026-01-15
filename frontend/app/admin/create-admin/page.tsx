'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { apiClient } from '@/lib/api'
import { useToast } from '@/components/ui/toast'
import { Loader2, UserPlus, Shield } from 'lucide-react'

export default function CreateAdminPage() {
	const router = useRouter()
	const { user } = useAuth()
	const { addToast } = useToast()
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		password: '',
	})

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}))
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		// Validation
		if (!formData.name.trim()) {
			addToast({
				type: 'error',
				message: 'Name is required',
			})
			return
		}

		if (!formData.email.trim()) {
			addToast({
				type: 'error',
				message: 'Email is required',
			})
			return
		}

		if (!formData.password || formData.password.length < 6) {
			addToast({
				type: 'error',
				message: 'Password must be at least 6 characters',
			})
			return
		}

		try {
			setIsSubmitting(true)
			await apiClient.createAdmin({
				name: formData.name.trim(),
				email: formData.email.trim().toLowerCase(),
				password: formData.password,
			})

			addToast({
				type: 'success',
				message: 'Admin user created successfully!',
			})

			// Reset form
			setFormData({
				name: '',
				email: '',
				password: '',
			})

			// Optionally redirect to users page
			setTimeout(() => {
				router.push('/admin/users')
			}, 1500)
		} catch (err) {
			addToast({
				type: 'error',
				message: err instanceof Error ? err.message : 'Failed to create admin user',
			})
		} finally {
			setIsSubmitting(false)
		}
	}

	if (!user || user.role !== 'admin') {
		return null
	}

	return (
		<AuthGuard requireAuth={true} requireAdmin={true}>
			<main className="min-h-screen py-8" style={{ backgroundColor: '#f6f5f4' }}>
				<div className="container mx-auto px-4 max-w-2xl">
					<div className="mb-8">
						<h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
							<Shield className="h-8 w-8" />
							Create Admin User
						</h1>
						<p className="text-gray-600">Create a new administrator account</p>
					</div>

					<Card className="p-6 bg-white border-0 shadow-sm">
						<form onSubmit={handleSubmit} className="space-y-6">
							<div className="space-y-2">
								<Label htmlFor="name">Name</Label>
								<Input
									id="name"
									name="name"
									type="text"
									value={formData.name}
									onChange={handleChange}
									placeholder="Enter admin name"
									required
									disabled={isSubmitting}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									name="email"
									type="email"
									value={formData.email}
									onChange={handleChange}
									placeholder="Enter admin email"
									required
									disabled={isSubmitting}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="password">Password</Label>
								<Input
									id="password"
									name="password"
									type="password"
									value={formData.password}
									onChange={handleChange}
									placeholder="Enter password (min 6 characters)"
									required
									minLength={6}
									disabled={isSubmitting}
								/>
								<p className="text-xs text-gray-500">
									Password must be at least 6 characters long
								</p>
							</div>

							<div className="flex items-center gap-4 pt-4">
								<Button
									type="submit"
									disabled={isSubmitting}
									className="flex items-center gap-2"
								>
									{isSubmitting ? (
										<>
											<Loader2 className="h-4 w-4 animate-spin" />
											Creating...
										</>
									) : (
										<>
											<UserPlus className="h-4 w-4" />
											Create Admin
										</>
									)}
								</Button>
								<Button
									type="button"
									variant="outline"
									onClick={() => router.push('/admin/users')}
									disabled={isSubmitting}
								>
									Cancel
								</Button>
							</div>
						</form>
					</Card>
				</div>
			</main>
		</AuthGuard>
	)
}
