import mongoose, { Document, Schema } from 'mongoose'
import { generateSlug } from '../utils/slugGenerator'

export interface IPost extends Document {
	title: string
	slug: string
	content: string
	author: mongoose.Types.ObjectId
	imageUrl?: string
	isDeleted: boolean
	deletedAt?: Date
	createdAt: Date
	updatedAt: Date
}

const postSchema = new Schema<IPost>(
	{
		title: {
			type: String,
			required: [true, 'Title is required'],
			trim: true,
			minlength: [3, 'Title must be at least 3 characters'],
			maxlength: [200, 'Title cannot exceed 200 characters'],
		},
		slug: {
			type: String,
			required: false, // Will be set by pre-save hook
			unique: true, // unique: true automatically creates an index
			lowercase: true,
			trim: true,
		},
		content: {
			type: String,
			required: [true, 'Content is required'],
			minlength: [10, 'Content must be at least 10 characters'],
		},
		imageUrl: {
			type: String,
			default: '',
		},
		author: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: [true, 'Author is required'],
			index: true,
		},
		isDeleted: {
			type: Boolean,
			default: false,
			index: true,
		},
		deletedAt: {
			type: Date,
			default: null,
		},
	},
	{
		timestamps: true,
		toJSON: {
			transform: function (_doc, ret) {
				// Exclude deleted posts from default queries
				if (ret.isDeleted) {
					return null
				}
				return ret
			},
		},
	}
)

// Indexes for performance
// Note: slug index is automatically created by unique: true
// Note: author and isDeleted indexes are created via index: true in field definitions
postSchema.index({ author: 1, isDeleted: 1 }) // Compound index for author queries
postSchema.index({ createdAt: -1 }) // For sorting by date
postSchema.index({ isDeleted: 1, createdAt: -1 }) // Compound index for listing active posts
postSchema.index({ title: 'text', content: 'text' }) // Text index for search functionality
postSchema.index({ author: 1, createdAt: -1 }) // For author's posts sorted by date

// Generate slug before saving
postSchema.pre('save', async function (next) {
	if (this.isModified('title') && !this.isNew) {
		// If title is modified, regenerate slug
		this.slug = generateSlug(this.title)
	} else if (this.isNew) {
		// For new posts, generate slug from title
		this.slug = generateSlug(this.title)
	}

	// Ensure slug is unique
	if (this.isNew || this.isModified('slug')) {
		const Post = mongoose.model<IPost>('Post')
		const existingPost = await Post.findOne({
			slug: this.slug,
			_id: { $ne: this._id },
		})

		if (existingPost) {
			// Append timestamp to make it unique
			this.slug = `${this.slug}-${Date.now()}`
		}
	}

	next()
})

// Soft delete method
postSchema.methods.softDelete = async function () {
	this.isDeleted = true
	this.deletedAt = new Date()
	await this.save()
}

// Restore method
postSchema.methods.restore = async function () {
	this.isDeleted = false
	this.deletedAt = undefined
	await this.save()
}

const Post = mongoose.model<IPost>('Post', postSchema)

export default Post
