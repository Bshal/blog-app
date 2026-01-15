/**
 * Generate a URL-friendly slug from a string
 */
export const generateSlug = (text: string): string => {
	return text
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, '') // Remove special characters
		.replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
		.replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

/**
 * Generate a unique slug by appending a number if needed
 */
export const generateUniqueSlug = async (
	baseSlug: string,
	checkUnique: (slug: string) => Promise<boolean>,
	maxAttempts: number = 10
): Promise<string> => {
	let slug = baseSlug
	let attempt = 1

	while (attempt <= maxAttempts) {
		const isUnique = await checkUnique(slug)
		if (isUnique) {
			return slug
		}
		slug = `${baseSlug}-${attempt}`
		attempt++
	}

	// Fallback: append timestamp if max attempts reached
	return `${baseSlug}-${Date.now()}`
}
