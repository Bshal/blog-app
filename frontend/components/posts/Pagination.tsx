'use client'

import { Button } from '@/components/ui/button'
import {
	Pagination as PaginationComponent,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from '@/components/ui/pagination'
import type { PaginationMeta } from '@/types'
import { useRouter, useSearchParams } from 'next/navigation'

interface PaginationProps {
	pagination: PaginationMeta
	basePath?: string
}

export function Pagination({ pagination, basePath = '' }: PaginationProps) {
	const router = useRouter()
	const searchParams = useSearchParams()

	const handlePageChange = (page: number) => {
		const params = new URLSearchParams(searchParams.toString())
		params.set('page', page.toString())
		router.push(`${basePath}?${params.toString()}`)
	}

	const { page, totalPages, hasNextPage, hasPrevPage } = pagination

	if (totalPages <= 1) return null

	const pages = []
	const maxVisible = 5

	// Calculate page range to show
	let startPage = Math.max(1, page - Math.floor(maxVisible / 2))
	let endPage = Math.min(totalPages, startPage + maxVisible - 1)

	if (endPage - startPage < maxVisible - 1) {
		startPage = Math.max(1, endPage - maxVisible + 1)
	}

	for (let i = startPage; i <= endPage; i++) {
		pages.push(i)
	}

	return (
		<PaginationComponent>
			<PaginationContent>
				<PaginationItem>
					<PaginationPrevious
						href="#"
						onClick={(e) => {
							e.preventDefault()
							if (hasPrevPage) {
								handlePageChange(page - 1)
							}
						}}
						className={!hasPrevPage ? 'pointer-events-none opacity-50' : ''}
					/>
				</PaginationItem>

				{startPage > 1 && (
					<>
						<PaginationItem>
							<PaginationLink
								href="#"
								onClick={(e) => {
									e.preventDefault()
									handlePageChange(1)
								}}
							>
								1
							</PaginationLink>
						</PaginationItem>
						{startPage > 2 && (
							<PaginationItem>
								<PaginationEllipsis />
							</PaginationItem>
						)}
					</>
				)}

				{pages.map((pageNum) => (
					<PaginationItem key={pageNum}>
						<PaginationLink
							href="#"
							onClick={(e) => {
								e.preventDefault()
								handlePageChange(pageNum)
							}}
							isActive={pageNum === page}
						>
							{pageNum}
						</PaginationLink>
					</PaginationItem>
				))}

				{endPage < totalPages && (
					<>
						{endPage < totalPages - 1 && (
							<PaginationItem>
								<PaginationEllipsis />
							</PaginationItem>
						)}
						<PaginationItem>
							<PaginationLink
								href="#"
								onClick={(e) => {
									e.preventDefault()
									handlePageChange(totalPages)
								}}
							>
								{totalPages}
							</PaginationLink>
						</PaginationItem>
					</>
				)}

				<PaginationItem>
					<PaginationNext
						href="#"
						onClick={(e) => {
							e.preventDefault()
							if (hasNextPage) {
								handlePageChange(page + 1)
							}
						}}
						className={!hasNextPage ? 'pointer-events-none opacity-50' : ''}
					/>
				</PaginationItem>
			</PaginationContent>
		</PaginationComponent>
	)
}
