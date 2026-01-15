'use client'

import Link from 'next/link'
import { LoginForm, OAuthButtons } from '@/components/auth'
import { Card } from '@/components/ui/card'

export default function LoginPage() {
	return (
		<main className="min-h-screen flex flex-col items-center justify-center py-12">
			<div className="w-full max-w-md px-4">
				{/* Brand Logo */}
				<div className="text-center mb-8">
					<Link href="/" className="inline-block">
						<span className="text-4xl font-bold text-gray-900 font-limelight">Blog</span>
					</Link>
				</div>

				{/* Form Card */}
				<Card className="p-8 bg-white">
					<div className="space-y-6">
						<div className="text-center">
							<h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h1>
							<p className="text-gray-600">Sign in to your account to continue</p>
						</div>

						<LoginForm />
						<OAuthButtons />
					</div>
				</Card>
			</div>
		</main>
	)
}
