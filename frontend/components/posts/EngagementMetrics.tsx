'use client'

import { MessageCircle, Eye, Share2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EngagementMetricsProps {
	commentsCount?: number
	viewsCount?: number
	sharesCount?: number
	className?: string
}

function formatCount(count: number): string {
	if (count >= 1000) {
		return `${(count / 1000).toFixed(2)}k`
	}
	return count.toString()
}

export function EngagementMetrics({
	commentsCount = 0,
	viewsCount = 0,
	sharesCount = 0,
	className,
}: EngagementMetricsProps) {
	return (
		<div className={cn('flex items-center gap-3 text-gray-500', className)}>
			{/* Comments */}
			<div className="flex items-center gap-1.5">
				<MessageCircle className="h-4 w-4 text-gray-400" />
				<span className="text-sm text-gray-600">
					{formatCount(commentsCount)}
				</span>
			</div>
			
			{/* Separator dot */}
			<span className="text-gray-400">·</span>
			
			{/* Views */}
			<div className="flex items-center gap-1.5">
				<Eye className="h-4 w-4 text-gray-400" />
				<span className="text-sm text-gray-600">{formatCount(viewsCount)}</span>
			</div>
			
			{/* Separator dot */}
			<span className="text-gray-400">·</span>
			
			{/* Shares */}
			<div className="flex items-center gap-1.5">
				<Share2 className="h-4 w-4 text-gray-400" />
				<span className="text-sm text-gray-600">{formatCount(sharesCount)}</span>
			</div>
		</div>
	)
}
