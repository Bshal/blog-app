import express, { Application } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import session from 'express-session'
import { config } from './config'
import connectDatabase from './config/database'
import passport from './config/passport'
import { httpLogger } from './utils/logger'
import { errorHandler } from './middleware/error-handling/errorHandler.middleware'
import { notFoundHandler } from './middleware/error-handling/notFound.middleware'

const app: Application = express()

// Security middleware
app.use(helmet())
// CORS configuration - allows frontend to make requests
app.use(
	cors({
		origin: (origin, callback) => {
			// Allow requests with no origin (like mobile apps, Postman, etc.) in development
			if (!origin && config.nodeEnv === 'development') {
				return callback(null, true)
			}

			const allowedOrigins = [
				config.frontendUrl,
				'http://localhost:3000',
				'http://127.0.0.1:3000',
			]

			// In development, allow any localhost origin
			if (config.nodeEnv === 'development' && origin) {
				if (
					origin.startsWith('http://localhost:') ||
					origin.startsWith('http://127.0.0.1:')
				) {
					return callback(null, true)
				}
			}

			if (origin && allowedOrigins.includes(origin)) {
				return callback(null, true)
			}

			callback(new Error('Not allowed by CORS'))
		},
		credentials: true,
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization'],
	})
)

// Body parsing middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Session middleware (for OAuth)
app.use(
	session({
		secret: config.jwt.accessSecret,
		resave: false,
		saveUninitialized: false,
	})
)

// Initialize Passport
app.use(passport.initialize())
app.use(passport.session())

// Compression middleware
app.use(compression())

// HTTP request logging
app.use(httpLogger)

// Health check endpoint
app.get('/health', (_req, res) => {
	res.status(200).json({
		success: true,
		message: 'Server is running',
		timestamp: new Date().toISOString(),
	})
})

// API routes
import v1Routes from './routes/v1'
app.use('/api/v1', v1Routes)

// 404 handler
app.use(notFoundHandler)

// Error handling middleware (must be last)
app.use(errorHandler)

// Start server
const startServer = async (): Promise<void> => {
	try {
		// Connect to database
		await connectDatabase()

		// Start listening
		app.listen(config.port, () => {
			console.log(`Server is running on port ${config.port}`)
		})
	} catch (error) {
		console.error('Failed to start server:', error)
		process.exit(1)
	}
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
	console.error('Unhandled Rejection:', err)
	process.exit(1)
})

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
	console.error('Uncaught Exception:', err)
	process.exit(1)
})

startServer()

export default app
