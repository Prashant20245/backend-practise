import { Request, Response } from "express";
import { loginSchema, registerSchema } from "../schemas/auth.schema";
import { prisma } from "../config/prisma";
import argon2 from "argon2";
import crypto from "crypto";

export async function registerUser(req: Request, res: Response) {
  //validate input
  const result = registerSchema.safeParse(req.body);
  //if input is not valid
  if (!result.success) {
    return res.status(400).json({
      message: "Invalid input",
      error: result.error.flatten(),
    });
  }

  //fetch your request vlaues
  const { name, email, password } = result.data;

  //check for existing user
  const existingUser = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  if (existingUser) {
    return res.status(409).json({
      message: "Unable to create account",
    });
  }

  //hash your password
  const hashedPassword = await argon2.hash(password);

  //now create account
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: hashedPassword,
    },
  });

  //return the result
  return res.status(201).json({
    message: "Account created successfully",
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  });
}

// in this code we are using Express's default MemoryStore to store our session_info
// but in real-life we would either use our own db or redis to store these values
export async function loginUser(req: Request, res: Response) {
  //validate input request
  const result = loginSchema.safeParse(req.body);

  //if input is invalid
  if (!result.success) {
    return res.status(400).json({
      message: "Invalid input",
    });
  }

  //fetch values
  const { email, password } = result.data;

  //check for eamil
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  //if no user
  if (!user) {
    return res.status(401).json({
      message: "Invalid email or password",
    });
  }

  //if user exist then verify password
  const passwordValid = await argon2.verify(user.passwordHash, password);

  //if not valid password
  if (!passwordValid) {
    return res.status(401).json({
      message: "Invalid email or password",
    });
  }

  //if password valid then create session, save it and send as response
  req.session.userId = user.id;

  return res.status(200).json({
    message: "Login successfully",
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  });
}

//using own db for session_info storage
export async function loginUser2(req: Request, res: Response) {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      message: "Invalid input",
    });
  }

  const { email, password } = result.data;
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (!existingUser) {
    return res.status(401).json({
      message: "Invalid credentials",
    });
  }

  const passwordValidity = await argon2.verify(
    existingUser.passwordHash,
    password,
  );

  if (!passwordValidity) {
    return res.status(401).json({
      message: "Invalid credentials",
    });
  }

  //generate your owm sessionId
  const sessionID = crypto.randomBytes(32).toString("hex");

  //store session_info in database
  await prisma.session.create({
    data: {
      id: sessionID,
      userId: existingUser.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), //7 day
    },
  });

  //send session id to browser
  res.cookie("sessionID", sessionID, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  //return user information
  return res.status(200).json({
    message: "Login successful",
    user: {
      id: existingUser.id,
      name: existingUser.name,
      email: existingUser.email,
    },
  });
}

export async function logoutUser(req: Request, res: Response) {
  req.session.destroy((error) => {
    if (error) {
      return res.status(500).json({
        message: "Unable to logout",
      });
    }

    res.clearCookie("connect.sid");

    return res.status(200).json({
      message: "Logout successful",
    });
  });
}

export async function logoutUser2(req: Request, res: Response) {
  // 1. fetch your sessionID from cookies
  const sessionID = req.cookies.sessionID;

  // 2. delete the session_info from database
  if (sessionID) {
    await prisma.session.delete({
      where: {
        id: sessionID,
      },
    });
  }

  // 3.clear your cookie
  res.clearCookie("sessionID");

  // 4. return response
  return res.status(200).json({
    message: "Logout successfully.",
  });
}
