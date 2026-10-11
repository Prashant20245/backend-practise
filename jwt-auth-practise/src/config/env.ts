import z from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(10),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z
    .enum(["production", "development", "test"])
    .default("development"),
});

export const env = envSchema.parse(process.env);
