import { prisma } from "../lib/prisma";
import { hashPassword, verifyPassword } from "./password.service";
import { generateAccessToken } from "./token.service";

export async function registerUser(
  name: string,
  email: string,
  password: string,
) {
  const existingUser = await prisma.user.findUnique({ where: { email } });

  //this is suitable inside a controller as they handle http request
  // if (existingUser) {
  //   return res.status().json({
  //     message: "User already exist.",
  //   });
  // }

  //this is suitable inside service layer and they just throw error no need to think about http response
  if (existingUser) {
    throw new Error("USER_EXISTS");
  }

  const hashedPassword = await hashPassword(password);

  //create user and define it to be sent
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });

  return user;
}

export async function loginUser(email: string, password: string) {
  //1. find the user data from database
  const user = await prisma.user.findUnique({ where: { email } });

  //2. what if user does not exist
  if (!user) {
    throw new Error("Invalid Credentials");
  }

  //3. validate password
  const validPassword = await verifyPassword(password, user.password);

  //4. if password is invalid then
  if (!validPassword) {
    throw new Error("Invalid credentials.");
  }

  //5. generate access token
  const accessToken = generateAccessToken(user.id);

  //6. return values
  return {
    accessToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  };
}
