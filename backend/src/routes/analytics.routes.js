import { Router } from "express";
import { getFacultyAnalytics } from "../controllers/analytics.controller.js";
import { requireAuth, requireMongoUser, requireRole } from "../middleware/auth.middleware.js";

const analyticsRouter = Router();

analyticsRouter.get(
  "/faculty",
  requireAuth,
  requireMongoUser,
  requireRole("faculty", "admin"),
  getFacultyAnalytics
);

analyticsRouter.get(
  "/",
  requireAuth,
  requireMongoUser,
  requireRole("faculty", "admin"),
  getFacultyAnalytics
);

export default analyticsRouter;
