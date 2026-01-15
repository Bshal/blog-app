import Joi from 'joi'

export const createPostSchema = Joi.object({
	title: Joi.string()
		.min(3)
		.max(200)
		.required()
		.messages({
			'string.empty': 'Title is required',
			'string.min': 'Title must be at least 3 characters',
			'string.max': 'Title cannot exceed 200 characters',
		}),
	content: Joi.string()
		.min(10)
		.required()
		.messages({
			'string.empty': 'Content is required',
			'string.min': 'Content must be at least 10 characters',
		}),
	imageUrl: Joi.string()
		.allow('')
		.optional(),
})

export const updatePostSchema = Joi.object({
	title: Joi.string()
		.min(3)
		.max(200)
		.messages({
			'string.min': 'Title must be at least 3 characters',
			'string.max': 'Title cannot exceed 200 characters',
		}),
	content: Joi.string()
		.min(10)
		.messages({
			'string.min': 'Content must be at least 10 characters',
		}),
	imageUrl: Joi.string()
		.allow('')
		.optional(),
}).min(1).messages({
	'object.min': 'At least one field (title or content) must be provided',
})

export const validateCreatePost = (data: unknown) => {
	return createPostSchema.validate(data, { abortEarly: false })
}

export const validateUpdatePost = (data: unknown) => {
	return updatePostSchema.validate(data, { abortEarly: false })
}
