'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { AuthorAvatar } from '@/components/posts/AuthorAvatar'
import { FileText, PlusSquare, LayoutDashboard, LogIn, UserPlus, Shield } from 'lucide-react'

export function Header() {
	const pathname = usePathname()
	const { user, isAuthenticated, logout } = useAuth()

	return (
		<header className="sticky top-0 z-50 w-full py-4">
			<div className="container mx-auto px-4 max-w-7xl">
				<div 
					className="flex h-16 items-center justify-between bg-white rounded-full px-6"
					style={{ boxShadow: '0 8px 24px 0 rgba(145, 158, 171, 0.12), 0 4px 12px 0 rgba(145, 158, 171, 0.08)' }}
				>
					<Link 
						href="/" 
						className="flex items-center space-x-2 outline-none focus:outline-none focus-visible:outline-none"
					>
						<span className="text-3xl font-bold text-gray-900 font-limelight">Blog</span>
					</Link>

					<nav className="flex items-center gap-6">
						<Link
							href="/posts"
							className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-blue-600 outline-none focus:outline-none focus-visible:outline-none ${
								pathname === '/posts' ? 'text-blue-600' : 'text-gray-600'
							}`}
						>
							<FileText className="h-4 w-4" />
							Posts
						</Link>
						
						{isAuthenticated ? (
							<>
								<Link
									href="/posts/create"
									className="flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-blue-600 outline-none focus:outline-none focus-visible:outline-none"
								>
									<PlusSquare className="h-4 w-4" />
									Create Post
								</Link>
								<Link
									href="/dashboard"
									className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-blue-600 outline-none focus:outline-none focus-visible:outline-none ${
										pathname === '/dashboard' ? 'text-blue-600' : 'text-gray-600'
									}`}
								>
									<LayoutDashboard className="h-4 w-4" />
									Dashboard
								</Link>
								<div className="flex items-center gap-3">
									<Link
										href={`/posts/author/${user?._id}`}
										className="flex items-center gap-2 outline-none focus:outline-none focus-visible:outline-none"
									>
										<AuthorAvatar
											avatarUrl={user?.avatar}
											name={user?.name || ''}
											className="h-8 w-8"
										/>
									</Link>
									<Button
										size="sm"
										variant="outline"
										onClick={logout}
										className="outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 rounded-full"
									>
										Logout
									</Button>
								</div>
							</>
						) : (
							<>
								<Link
									href="/auth/login"
									className="flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-blue-600 outline-none focus:outline-none focus-visible:outline-none"
								>
									<LogIn className="h-4 w-4" />
									Login
								</Link>
								<Button 
									asChild 
									size="sm" 
									className="outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 rounded-full"
								>
									<Link 
										href="/auth/register"
										className="flex items-center gap-2 outline-none focus:outline-none focus-visible:outline-none"
									>
										<UserPlus className="h-4 w-4" />
										Sign Up
									</Link>
								</Button>
							</>
						)}
					</nav>
				</div>
			</div>
		</header>
	)
}
