import { Router } from "express";
import {
  loginUser,
  loginUser2,
  logoutUser,
  logoutUser2,
  registerUser,
} from "../controllers/auth.controller";
import { loginLimiter } from "../middleware/rate-limit.middleware";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginLimiter, loginUser);
router.post("/login2", loginLimiter, loginUser2);
router.post("/logout", logoutUser);
router.post("/logout2", logoutUser2);

export default router;
