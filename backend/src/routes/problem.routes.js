import { Router } from "express";
import {
  createProblem,
  deleteProblem,
  getProblemById,
  getProblems,
  updateProblem
} from "../controllers/problem.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

const problemRouter = Router();

problemRouter.get("/", getProblems);
problemRouter.get("/:problemId", getProblemById);
problemRouter.post("/", requireAuth, requireRole("admin", "faculty"), createProblem);
problemRouter.put("/:problemId", requireAuth, requireRole("admin", "faculty"), updateProblem);
problemRouter.delete("/:problemId", requireAuth, requireRole("admin", "faculty"), deleteProblem);

export default problemRouter;
