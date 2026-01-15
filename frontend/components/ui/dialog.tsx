'use client'

import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './button'

interface DialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	children: React.ReactNode
}

interface DialogContentProps {
	children: React.ReactNode
	className?: string
}

interface DialogHeaderProps {
	children: React.ReactNode
	className?: string
}

interface DialogTitleProps {
	children: React.ReactNode
	className?: string
}

interface DialogDescriptionProps {
	children: React.ReactNode
	className?: string
}

interface DialogFooterProps {
	children: React.ReactNode
	className?: string
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
	React.useEffect(() => {
		if (open) {
			document.body.style.overflow = 'hidden'
		} else {
			document.body.style.overflow = ''
		}
		return () => {
			document.body.style.overflow = ''
		}
	}, [open])

	if (!open) return null

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center"
			onClick={() => onOpenChange(false)}
		>
			<div
				className="fixed inset-0 bg-black/50"
				aria-hidden="true"
			/>
			<div onClick={(e) => e.stopPropagation()}>
				{children}
			</div>
		</div>
	)
}

export function DialogContent({ children, className }: DialogContentProps) {
	return (
		<div
			className={cn(
				'relative z-50 w-full max-w-lg bg-white rounded-lg shadow-lg p-6',
				className
			)}
		>
			{children}
		</div>
	)
}

export function DialogHeader({ children, className }: DialogHeaderProps) {
	return (
		<div className={cn('mb-4', className)}>
			{children}
		</div>
	)
}

export function DialogTitle({ children, className }: DialogTitleProps) {
	return (
		<h2 className={cn('text-xl font-semibold text-gray-900', className)}>
			{children}
		</h2>
	)
}

export function DialogDescription({ children, className }: DialogDescriptionProps) {
	return (
		<p className={cn('text-sm text-gray-600 mt-2', className)}>
			{children}
		</p>
	)
}

export function DialogFooter({ children, className }: DialogFooterProps) {
	return (
		<div className={cn('flex justify-end gap-2 mt-6', className)}>
			{children}
		</div>
	)
}

export function DialogClose({ onClose }: { onClose: () => void }) {
	return (
		<button
			type="button"
			onClick={onClose}
			className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2"
		>
			<X className="h-4 w-4" />
			<span className="sr-only">Close</span>
		</button>
	)
}
