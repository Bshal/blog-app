import mongoose, { Document, Schema } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IUser extends Document {
	name: string
	email: string
	password?: string
	role: 'user' | 'admin'
	avatar?: string
	isEmailVerified: boolean
	googleId?: string
	facebookId?: string
	refreshToken?: string
	createdAt: Date
	updatedAt: Date
	comparePassword(candidatePassword: string): Promise<boolean>
}

const userSchema = new Schema<IUser>(
	{
		name: {
			type: String,
			required: [true, 'Name is required'],
			trim: true,
			minlength: [2, 'Name must be at least 2 characters'],
			maxlength: [50, 'Name cannot exceed 50 characters'],
		},
		email: {
			type: String,
			required: [true, 'Email is required'],
			unique: true,
			lowercase: true,
			trim: true,
			match: [
				/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
				'Please provide a valid email address',
			],
			// unique: true automatically creates an index, no need for explicit index: true
		},
		password: {
			type: String,
			minlength: [6, 'Password must be at least 6 characters'],
			select: false, // Don't return password by default
		},
		role: {
			type: String,
			enum: ['user', 'admin'],
			default: 'user',
		},
		avatar: {
			type: String,
			default: '',
		},
		isEmailVerified: {
			type: Boolean,
			default: false,
		},
		googleId: {
			type: String,
			sparse: true, // Allows multiple null values
			index: true, // Create index for OAuth lookups
		},
		facebookId: {
			type: String,
			sparse: true, // Allows multiple null values
			index: true, // Create index for OAuth lookups
		},
		refreshToken: {
			type: String,
			select: false,
		},
	},
	{
		timestamps: true,
		toJSON: {
			transform: function (_doc, ret) {
				delete ret.password
				delete ret.refreshToken
				return ret
			},
		},
	}
)

// Indexes for performance
// Note: email index is automatically created by unique: true
// Note: googleId and facebookId indexes are created via sparse option (if needed, add index: true to field definition)
userSchema.index({ role: 1 }) // For filtering by role
userSchema.index({ createdAt: -1 }) // For sorting users by creation date
userSchema.index({ isEmailVerified: 1 }) // For filtering verified users
userSchema.index({ role: 1, createdAt: -1 }) // Compound index for admin queries

// Hash password before saving
userSchema.pre('save', async function (next) {
	// Only hash password if it's modified (or new)
	if (!this.isModified('password')) {
		return next()
	}

	// Hash password with cost of 12, but only if it's not already hashed
	if (this.password) {
		// Check if password is already hashed (bcrypt hashes start with $2a$, $2b$, or $2y$)
		const isAlreadyHashed = this.password.startsWith('$2a$') || 
		                         this.password.startsWith('$2b$') || 
		                         this.password.startsWith('$2y$')
		
		if (!isAlreadyHashed) {
			this.password = await bcrypt.hash(this.password, 12)
		}
	}
	next()
})

// Method to compare password
userSchema.methods.comparePassword = async function (
	candidatePassword: string
): Promise<boolean> {
	if (!this.password) {
		return false
	}
	return await bcrypt.compare(candidatePassword, this.password)
}

const User = mongoose.model<IUser>('User', userSchema)

export default User
