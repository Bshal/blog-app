export function Footer() {
	return (
		<footer className="border-t bg-white">
			<div className="container mx-auto px-4 py-8">
				<div className="flex flex-col items-center justify-between gap-4 md:flex-row">
					<p className="text-sm text-gray-600">
						© {new Date().getFullYear()} Blog. All rights reserved.
					</p>
					<div className="flex gap-6">
						<a
							href="#"
							className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
						>
							Privacy
						</a>
						<a
							href="#"
							className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
						>
							Terms
						</a>
					</div>
				</div>
			</div>
		</footer>
	)
}
