
const pool = require("../db/pool");

async function getUsers(req, res, next) {
  try {
    const result = await pool.query(
      "SELECT id, name, email FROM users ORDER BY id"
    );

    res.json(result.rows);
  } catch (error) {
    next(error);
  }
}

async function getUserTasks(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({
        message: "Invalid user ID"
      });
    }

    const user = await pool.query(
      "SELECT id FROM users WHERE id = $1",
      [id]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const result = await pool.query(
      `SELECT
         id,
         title,
         description,
         status,
         user_id AS "userId",
         created_at AS "createdAt"
       FROM tasks
       WHERE user_id = $1
       ORDER BY id`,
      [id]
    );

    res.json(result.rows);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getUsers,
  getUserTasks
};
