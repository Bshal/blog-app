'use client'

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface AuthorAvatarProps {
	avatarUrl?: string
	name: string
	className?: string
}

export function AuthorAvatar({ avatarUrl, name, className }: AuthorAvatarProps) {
	const initials = name
		.split(' ')
		.map((n) => n[0])
		.join('')
		.toUpperCase()
		.slice(0, 2)

	return (
		<Avatar
			className={cn(
				'h-10 w-10 border-2 border-white shadow-md',
				className
			)}
		>
			<AvatarImage src={avatarUrl} alt={name} />
			<AvatarFallback className="bg-gray-200 text-gray-700 text-xs font-semibold">
				{initials}
			</AvatarFallback>
		</Avatar>
	)
}
