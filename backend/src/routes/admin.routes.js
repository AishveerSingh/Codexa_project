import { Router } from "express";
import { getAdminLogs } from "../controllers/admin.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

const adminRouter = Router();

adminRouter.get("/logs", requireAuth, requireRole("admin"), getAdminLogs);

export default adminRouter;
