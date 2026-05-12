import Joi from "joi";

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid("development", "production", "test")
    .default("development"),
  PORT: Joi.number().integer().positive().default(3001),
  WS_PATH: Joi.string().default("/ws"),

  JWT_ACCESS_SECRET: Joi.string().required(),
  JWT_REFRESH_SECRET: Joi.string().required(),
  JWT_ACCESS_EXPIRES_IN: Joi.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default("7d"),

  DATABASE_URL: Joi.string().required(),

  ALLOWED_ORIGINS: Joi.string().required(),

  CLOUDINARY_CLOUD_NAME: Joi.string().required(),
  CLOUDINARY_API_KEY: Joi.string().required(),
  CLOUDINARY_API_SECRET: Joi.string().required(),

  COOKIE_DOMAIN: Joi.string().allow("").optional(),
});
