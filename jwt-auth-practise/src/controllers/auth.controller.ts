import { NextFunction, Request, Response } from "express";
import { loginSchema, registerSchema } from "../schemas/auth.schema";
import { loginUser, registerUser } from "../service/auth.service";
export async function register(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = registerSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Invalid request data",
      });
    }

    const user = await registerUser(
      result.data.name,
      result.data.email,
      result.data.password,
    );

    return res.status(201).json({
      message: "Registration successful",
      user,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "USER_EXISTS") {
      return res.status(409).json({
        message: "Unable to register with these credentials",
      });
    }

    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      //status 400 means bad request
      return res.status(400).json({
        message: "Bad request",
      });
    }

    const loginData = await loginUser(result.data.email, result.data.password);

    return res.status(200).json({
      message: "Login successful",
      loginData,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid credentials") {
      return res.status(401).json({
        message: "Login failed",
      });
    }
    next(error);
  }
}
