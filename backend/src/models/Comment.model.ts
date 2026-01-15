import mongoose, { Document, Schema } from 'mongoose'

export interface IComment extends Document {
	content: string
	post: mongoose.Types.ObjectId
	author: mongoose.Types.ObjectId
	isDeleted: boolean
	deletedAt?: Date
	createdAt: Date
	updatedAt: Date
}

const commentSchema = new Schema<IComment>(
	{
		content: {
			type: String,
			required: [true, 'Content is required'],
			trim: true,
			minlength: [1, 'Comment cannot be empty'],
			maxlength: [1000, 'Comment cannot exceed 1000 characters'],
		},
		post: {
			type: Schema.Types.ObjectId,
			ref: 'Post',
			required: [true, 'Post reference is required'],
			index: true,
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
				// Exclude deleted comments from default queries
				if (ret.isDeleted) {
					return null
				}
				return ret
			},
		},
	}
)

// Indexes for performance
commentSchema.index({ post: 1, isDeleted: 1 }) // Compound index for post comments
commentSchema.index({ author: 1, isDeleted: 1 }) // Compound index for author comments
commentSchema.index({ createdAt: -1 }) // For sorting by date
commentSchema.index({ post: 1, createdAt: -1 }) // Compound index for listing comments by post
commentSchema.index({ post: 1, author: 1 }) // Compound index for post-author queries
commentSchema.index({ author: 1, createdAt: -1 }) // For author's comments sorted by date

// Soft delete method
commentSchema.methods.softDelete = async function () {
	this.isDeleted = true
	this.deletedAt = new Date()
	await this.save()
}

// Restore method
commentSchema.methods.restore = async function () {
	this.isDeleted = false
	this.deletedAt = undefined
	await this.save()
}

const Comment = mongoose.model<IComment>('Comment', commentSchema)

export default Comment
