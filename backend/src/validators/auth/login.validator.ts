import Joi from 'joi';

export const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .lowercase()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Please provide a valid email address',
    }),
  password: Joi.string()
    .required()
    .messages({
      'string.empty': 'Password is required',
    }),
});

export const validateLogin = (data: unknown) => {
  return loginSchema.validate(data, { abortEarly: false });
};
