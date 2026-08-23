import { Router } from "express";
import {
  getAssignment,
  startAttempt,
  saveProgress,
  submitAttempt,
  getAssignmentRecords,
  getAttemptDetails
} from "../controllers/assignment.controller.js";
import {
  attachRoleProfile,
  requireAuth,
  requireCourseAccess,
  requireCourseManagementAccess,
  requireMongoUser
} from "../middleware/auth.middleware.js";
import { pool } from "../config/db.js";

const assignmentRouter = Router();

assignmentRouter.use(requireAuth, requireMongoUser, attachRoleProfile);

// Helper middleware to inject courseId from assignmentId for auth checks
const attachCourseId = async (req, res, next) => {
    try {
        const assignmentResult = await pool.query(
            `SELECT id, course_id FROM course_assignments WHERE id = $1`,
            [req.params.assignmentId]
        );
        if (assignmentResult.rows.length === 0) {
            return res.status(404).json({ message: "Assignment not found." });
        }
        req.assignment = {
            id: assignmentResult.rows[0].id,
            course_id: assignmentResult.rows[0].course_id
        };
        req.params.courseId = assignmentResult.rows[0].course_id;
        next();
    } catch (error) {
        next(error);
    }
};

assignmentRouter.get("/:assignmentId", attachCourseId, requireCourseAccess, getAssignment);
assignmentRouter.post("/:assignmentId/start", attachCourseId, requireCourseAccess, startAttempt);
assignmentRouter.post("/:assignmentId/save-progress", attachCourseId, requireCourseAccess, saveProgress);
assignmentRouter.post("/:assignmentId/submit", attachCourseId, requireCourseAccess, submitAttempt);

assignmentRouter.get("/:assignmentId/attempts", attachCourseId, requireCourseManagementAccess, getAssignmentRecords);
assignmentRouter.get("/:assignmentId/attempts/:attemptId", attachCourseId, requireCourseAccess, getAttemptDetails);

export default assignmentRouter;
