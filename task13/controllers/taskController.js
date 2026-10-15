const pool = require("../db/pool");
const taskSchema = require("../validators/taskValidator");

const taskSelect = `
  SELECT
    t.id,
    t.title,
    t.description,
    t.status,
    t."userId" AS "userId",
    COALESCE(
      json_agg(
        json_build_object(
          'id', c.id,
          'title', c.title,
          'description', c.description
        )
      ) FILTER (WHERE c.id IS NOT NULL),
      '[]'
    ) AS categories
  FROM "Task" t
  LEFT JOIN "_CategoryToTask" tc ON tc."B" = t.id
  LEFT JOIN "Category" c ON c.id = tc."A"
`;

async function getTasks(req, res, next) {
  try {
    const { status } = req.query;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const offset = (page - 1) * limit;

    if (status && !["pending", "in_progress", "completed"].includes(status)) {
      return res.status(400).json({ message: "Invalid task status" });
    }

    const values = [];
    let where = "";

    if (status) {
      values.push(status);
      where = `WHERE t.status = $${values.length}`;
    }

    const countResult = await pool.query(
      `SELECT COUNT(*)::int AS total FROM "Task" t ${where}`,
      values
    );

    const tasksResult = await pool.query(
      `${taskSelect}
       ${where}
       GROUP BY t.id
       ORDER BY t.id
       LIMIT $${values.length + 1}
       OFFSET $${values.length + 2}`,
      [...values, limit, offset]
    );

    res.json({
      tasks: tasksResult.rows,
      total: countResult.rows[0].total,
      page,
      limit
    });
  } catch (error) {
    next(error);
  }
}

async function getTask(req, res, next) {
  try {
    const id = Number(req.params.id);

    const result = await pool.query(
      `${taskSelect} WHERE t.id = $1 GROUP BY t.id`,
      [id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
}

async function createTask(req, res, next) {
  const validation = taskSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      message: "Invalid task data",
      errors: validation.error.issues
    });
  }

  const { title, description, status, userId } = validation.data;

  try {
    const user = await pool.query(
      'SELECT id FROM "User" WHERE id = $1',
      [userId]
    );

    if (!user.rows.length) {
      return res.status(400).json({ message: "User not found" });
    }

    const result = await pool.query(
      `INSERT INTO "Task" (title, description, status, "userId")
       VALUES ($1, $2, $3, $4)
       RETURNING id, title, description, status, "userId"`,
      [title, description || null, status, userId]
    );

    res.status(201).json({ ...result.rows[0], categories: [] });
  } catch (error) {
    next(error);
  }
}

async function updateTask(req, res, next) {
  const validation = taskSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      message: "Invalid task data",
      errors: validation.error.issues
    });
  }

  try {
    const { title, description, status, userId } = validation.data;

    const result = await pool.query(
      `UPDATE "Task"
       SET title = $1, description = $2, status = $3, "userId" = $4
       WHERE id = $5
       RETURNING id, title, description, status, "userId"`,
      [title, description || null, status, userId, Number(req.params.id)]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "Task not found" });
    }

    const task = result.rows[0];
    const categories = await pool.query(
      `SELECT c.id, c.title, c.description
       FROM "Category" c
       JOIN "_CategoryToTask" tc ON tc."A" = c.id
       WHERE tc."B" = $1`,
      [task.id]
    );

    res.json({ ...task, categories: categories.rows });
  } catch (error) {
    next(error);
  }
}

async function deleteTask(req, res, next) {
  try {
    const result = await pool.query(
      'DELETE FROM "Task" WHERE id = $1 RETURNING id',
      [Number(req.params.id)]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

async function updateTaskCategories(req, res, next) {
  const taskId = Number(req.params.id);
  const { categoryIds } = req.body;

  if (!Number.isInteger(taskId) || taskId < 1 ||
      !Array.isArray(categoryIds) ||
      !categoryIds.every(id => Number.isInteger(id) && id > 0)) {
    return res.status(400).json({ message: "Invalid task or category IDs" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const task = await client.query(
      'SELECT id FROM "Task" WHERE id = $1',
      [taskId]
    );

    if (!task.rows.length) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Task not found" });
    }

    const uniqueIds = [...new Set(categoryIds)];

    if (uniqueIds.length) {
      const categories = await client.query(
        'SELECT id FROM "Category" WHERE id = ANY($1::int[])',
        [uniqueIds]
      );

      if (categories.rows.length !== uniqueIds.length) {
        await client.query("ROLLBACK");
        return res.status(400).json({ message: "Category not found" });
      }
    }

    await client.query(
      'DELETE FROM "_CategoryToTask" WHERE "B" = $1',
      [taskId]
    );

    for (const categoryId of uniqueIds) {
      await client.query(
        'INSERT INTO "_CategoryToTask" ("A", "B") VALUES ($1, $2)',
        [categoryId, taskId]
      );
    }

    await client.query("COMMIT");

    const result = await pool.query(
      `${taskSelect} WHERE t.id = $1 GROUP BY t.id`,
      [taskId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    next(error);
  } finally {
    client.release();
  }
}

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  updateTaskCategories
};