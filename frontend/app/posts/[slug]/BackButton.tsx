'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export function BackButton() {
	const router = useRouter()
	const [backUrl, setBackUrl] = useState('/posts')

	useEffect(() => {
		// Check if there's a referrer in sessionStorage or use browser history
		const referrer = sessionStorage.getItem('postDetailReferrer')
		if (referrer) {
			setBackUrl(referrer)
		} else {
			// Try to get from document.referrer
			if (typeof window !== 'undefined' && document.referrer) {
				const referrerUrl = new URL(document.referrer)
				if (referrerUrl.pathname.startsWith('/dashboard')) {
					setBackUrl('/dashboard')
				} else if (referrerUrl.pathname.startsWith('/posts')) {
					setBackUrl('/posts')
				}
			}
		}
	}, [])

	const handleBack = (e: React.MouseEvent) => {
		e.preventDefault()
		// Try to go back in browser history first
		if (typeof window !== 'undefined' && window.history.length > 1) {
			router.back()
		} else {
			// Fallback to the stored referrer or default
			router.push(backUrl)
		}
	}

	return (
		<Button variant="ghost" className="mb-6" onClick={handleBack}>
			<ArrowLeft className="mr-2 h-4 w-4" />
			Back
		</Button>
	)
}
