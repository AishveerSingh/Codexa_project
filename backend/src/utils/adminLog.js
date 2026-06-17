import { pool } from "../config/db.js";

export async function logAdminAction({
  db = pool,
  adminId,
  actionType,
  targetType,
  targetId = null,
  details = {}
}) {
  if (!adminId) {
    return;
  }

  await db.query(
    `
      INSERT INTO admin_logs (admin_id, action_type, target_type, target_id, details)
      VALUES ($1, $2, $3, $4, $5::jsonb)
    `,
    [adminId, actionType, targetType, targetId, JSON.stringify(details)]
  );
}
