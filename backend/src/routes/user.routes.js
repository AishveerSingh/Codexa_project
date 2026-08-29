import { Router } from "express";
import {
  changeCurrentUserPassword,
  deleteUser,
  getAccessibleStudentById,
  getAccessibleStudents,
  getCurrentUser,
  getUserById,
  getUsers,
  loginAdmin,
  loginFaculty,
  loginStudent,
  registerAdmin,
  registerFaculty,
  registerStudent,
  resetStudentPassword,
  updateCurrentUser,
  updateUserById
} from "../controllers/user.controller.js";
import { requireAuth, requireMongoUser, requireRole } from "../middleware/auth.middleware.js";

const userRouter = Router();

userRouter.post("/admin-register", requireAuth, requireRole("admin"), registerAdmin);
userRouter.post("/admin-login", loginAdmin);
userRouter.post("/faculty-register", requireAuth, requireRole("admin"), registerFaculty);
userRouter.post("/faculty-login", loginFaculty);
userRouter.post("/student-register", requireAuth, requireRole("admin"), registerStudent);
userRouter.post("/student-login", loginStudent);

userRouter.get("/me", requireAuth, getCurrentUser);
userRouter.put("/me", requireAuth, updateCurrentUser);
userRouter.put("/me/password", requireAuth, changeCurrentUserPassword);
userRouter.get("/students", requireAuth, requireRole("admin"), (req, res, next) => {
  req.query.role = "student";
  return getUsers(req, res, next);
});
userRouter.get("/students/accessible", requireAuth, requireMongoUser, getAccessibleStudents);
userRouter.get("/students/accessible/:studentId", requireAuth, requireMongoUser, getAccessibleStudentById);

userRouter.get("/", requireAuth, requireRole("admin"), getUsers);

const uuidPattern = "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}";
userRouter.get(`/:userId(${uuidPattern})`, requireAuth, requireRole("admin"), getUserById);
userRouter.put(`/:userId(${uuidPattern})`, requireAuth, requireRole("admin"), updateUserById);
userRouter.put(`/:userId(${uuidPattern})/reset-password`, requireAuth, requireRole("admin"), resetStudentPassword);
userRouter.delete(`/:userId(${uuidPattern})`, requireAuth, requireRole("admin"), deleteUser);

export default userRouter;
