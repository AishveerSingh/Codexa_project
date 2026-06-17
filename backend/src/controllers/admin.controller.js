import { pool } from "../config/db.js";

export async function getAdminLogs(req, res, next) {
  const limit = Math.min(Number(req.query.limit) || 10, 50);

  try {
    const result = await pool.query(
      `
        SELECT
          l.id,
          l.action_type,
          l.target_type,
          l.target_id,
          l.details,
          l.created_at,
          u.full_name AS admin_name,
          u.email AS admin_email
        FROM admin_logs l
        JOIN users u ON u.id = l.admin_id
        ORDER BY l.created_at DESC
        LIMIT $1
      `,
      [limit]
    );

    res.json(result.rows);
  } catch (error) {
    next(error);
  }
}
