'use client'

import * as React from 'react'
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
	id: string
	title?: string
	message: string
	type: ToastType
	duration?: number
}

interface ToastContextType {
	toasts: Toast[]
	addToast: (toast: Omit<Toast, 'id'>) => void
	removeToast: (id: string) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function useToast() {
	const context = React.useContext(ToastContext)
	if (!context) {
		throw new Error('useToast must be used within ToastProvider')
	}
	return context
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
	const [toasts, setToasts] = React.useState<Toast[]>([])

	const addToast = React.useCallback((toast: Omit<Toast, 'id'>) => {
		const id = Math.random().toString(36).substring(2, 9)
		const newToast: Toast = {
			...toast,
			id,
			duration: toast.duration ?? 5000,
		}
		setToasts((prev) => [...prev, newToast])

		// Auto remove after duration
		if (newToast.duration > 0) {
			setTimeout(() => {
				setToasts((prev) => prev.filter((t) => t.id !== id))
			}, newToast.duration)
		}
	}, [])

	const removeToast = React.useCallback((id: string) => {
		setToasts((prev) => prev.filter((t) => t.id !== id))
	}, [])

	return (
		<ToastContext.Provider value={{ toasts, addToast, removeToast }}>
			{children}
			<ToastContainer toasts={toasts} removeToast={removeToast} />
		</ToastContext.Provider>
	)
}

function ToastContainer({
	toasts,
	removeToast,
}: {
	toasts: Toast[]
	removeToast: (id: string) => void
}) {
	if (toasts.length === 0) return null

	return (
		<div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
			{toasts.map((toast) => (
				<ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
			))}
		</div>
	)
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
	const [isExiting, setIsExiting] = React.useState(false)

	const handleRemove = () => {
		setIsExiting(true)
		setTimeout(() => {
			onRemove(toast.id)
		}, 300)
	}

	const icons = {
		success: CheckCircle2,
		error: AlertCircle,
		warning: AlertTriangle,
		info: Info,
	}

	const styles = {
		success: 'bg-green-50 border-green-200 text-green-800',
		error: 'bg-red-50 border-red-200 text-red-800',
		warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
		info: 'bg-blue-50 border-blue-200 text-blue-800',
	}

	const Icon = icons[toast.type]
	const styleClass = styles[toast.type]

	return (
		<div
			className={cn(
				'pointer-events-auto relative flex items-start gap-3 p-4 rounded-lg border shadow-lg transition-all duration-300',
				styleClass,
				isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'
			)}
			role="alert"
		>
			<Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
			<div className="flex-1 min-w-0">
				{toast.title && (
					<div className="font-semibold text-sm mb-1">{toast.title}</div>
				)}
				<div className="text-sm">{toast.message}</div>
			</div>
			<button
				type="button"
				onClick={handleRemove}
				className="flex-shrink-0 rounded-md p-1 hover:bg-black/10 transition-colors"
				aria-label="Close"
			>
				<X className="h-4 w-4" />
			</button>
		</div>
	)
}
