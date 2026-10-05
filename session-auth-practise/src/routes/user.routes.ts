import { Router } from "express";
import { requireAuth, requireAuth2 } from "../middleware/auth.middleware";
import { prisma } from "../config/prisma";

const router = Router();

//this helps us check the user_info of current logged_in user
//but it is specific for the case when we stored our session_info inside Express's default MemoryStore
router.get("/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: {
      id: req.session.userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });

  if (!user) {
    return res.status(401).json({
      message: "User no longer exist",
    });
  }

  return res.json({ user });
});

//this helps us fetch user_info of logged_in user when session_info is stored inside db
router.get("/me2", requireAuth2, (req, res) => {
  //fetch the sessionID send by client stored in cookies
  return res.status(200).json({
    user: req.user,
  });
});

export default router;
