'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
	status: 'published' | 'draft'
	className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
	return (
		<Badge
			variant="outline"
			className={cn(
				'text-xs font-normal normal-case rounded-full px-2.5 py-0.5 border-gray-300',
				status === 'published'
					? 'bg-blue-50 text-blue-700 border-blue-200'
					: 'bg-gray-100 text-gray-700 border-gray-200',
				className
			)}
		>
			{status}
		</Badge>
	)
}
