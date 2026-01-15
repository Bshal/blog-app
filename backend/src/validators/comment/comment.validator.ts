import Joi from 'joi'

export const createCommentSchema = Joi.object({
	content: Joi.string()
		.min(1)
		.max(1000)
		.required()
		.messages({
			'string.empty': 'Content is required',
			'string.min': 'Comment cannot be empty',
			'string.max': 'Comment cannot exceed 1000 characters',
		}),
	postId: Joi.string()
		.required()
		.messages({
			'string.empty': 'Post ID is required',
		}),
})

export const updateCommentSchema = Joi.object({
	content: Joi.string()
		.min(1)
		.max(1000)
		.required()
		.messages({
			'string.empty': 'Content is required',
			'string.min': 'Comment cannot be empty',
			'string.max': 'Comment cannot exceed 1000 characters',
		}),
})

export const validateCreateComment = (data: unknown) => {
	return createCommentSchema.validate(data, { abortEarly: false })
}

export const validateUpdateComment = (data: unknown) => {
	return updateCommentSchema.validate(data, { abortEarly: false })
}
