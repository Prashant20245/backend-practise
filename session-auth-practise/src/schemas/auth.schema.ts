import { z } from "zod";

// this helps us decide what will the request vlaue for register look like
// it helps validate register request coming from user
export const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(2).max(100),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(2).max(100),
});
