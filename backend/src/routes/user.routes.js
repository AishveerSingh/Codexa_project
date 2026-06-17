import { Router } from "express";
import {
  getUserById,
  getUsers,
  loginAdmin,
  loginStudent,
  registerAdmin,
  registerStudent
} from "../controllers/user.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

const userRouter = Router();

userRouter.post("/admin-register", registerAdmin);
userRouter.post("/admin-login", loginAdmin);
userRouter.post("/student-register", registerStudent);
userRouter.post("/student-login", loginStudent);

userRouter.get("/", requireAuth, requireRole("admin"), getUsers);
userRouter.get("/:userId", requireAuth, requireRole("admin"), getUserById);

export default userRouter;
