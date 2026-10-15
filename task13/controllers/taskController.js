
const pool = require("../db/pool");

async function getCategories(taskIds) {
  if (taskIds.length === 0) {
    return [];
  }

  const result = await pool.query(
    `SELECT
       tc.task_id,
       c.id,
       c.title,
       c.description
     FROM task_categories tc
     JOIN categories c ON c.id = tc.category_id
     WHERE tc.task_id = ANY($1::int[])`,
    [taskIds]
  );

  return result.rows;
}

async function getTasks(req, res, next) {
  try {
    const status = req.query.status;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit, 10) || 10)
    );
    const offset = (page - 1) * limit;

    if (
      status &&
      !["pending", "in_progress", "completed"].includes(status)
    ) {
      return res.status(400).json({
        message: "Invalid task status"
      });
    }

    let sql = `
      SELECT
        id,
        title,
        description,
        status,
        user_id AS "userId",
        created_at AS "createdAt"
      FROM tasks
    `;

    const values = [];

    if (status) {
      sql += " WHERE status = $1";
      values.push(status);
    }

    const countResult = await pool.query(
      `SELECT COUNT(*)::int AS total FROM tasks
       ${status ? "WHERE status = $1" : ""}`,
      values
    );

    sql += ` ORDER BY id LIMIT $${values.length + 1}
             OFFSET $${values.length + 2}`;

    const tasksResult = await pool.query(sql, [
      ...values,
      limit,
      offset
    ]);

    const tasks = tasksResult.rows;
    const categories = await getCategories(
      tasks.map(task => task.id)
    );

    const tasksWithCategories = tasks.map(task => ({
      ...task,
      categories: categories
        .filter(category => category.task_id === task.id)
        .map(({ task_id, ...category }) => category)
    }));

    res.json({
      tasks: tasksWithCategories,
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

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({
        message: "Invalid task ID"
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
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    const task = result.rows[0];
    const categories = await getCategories([id]);

    task.categories = categories.map(
      ({ task_id, ...category }) => category
    );

    res.json(task);
  } catch (error) {
    next(error);
  }
}

async function createTask(req, res, next) {
  try {
    const { title, description, status, userId } = req.body;

    if (
      typeof title !== "string" ||
      !title.trim() ||
      !Number.isInteger(userId) ||
      userId < 1 ||
      !["pending", "in_progress", "completed"].includes(status)
    ) {
      return res.status(400).json({
        message: "Invalid task data"
      });
    }

    const user = await pool.query(
      "SELECT id FROM users WHERE id = $1",
      [userId]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({
        message: "User not found"
      });
    }

    const result = await pool.query(
      `INSERT INTO tasks (title, description, status, user_id)
       VALUES ($1, $2, $3, $4)
       RETURNING
         id,
         title,
         description,
         status,
         user_id AS "userId",
         created_at AS "createdAt"`,
      [
        title.trim(),
        typeof description === "string" ? description.trim() || null : null,
        status,
        userId
      ]
    );

    res.status(201).json({
      ...result.rows[0],
      categories: []
    });
  } catch (error) {
    next(error);
  }
}

async function updateTask(req, res, next) {
  try {
    const id = Number(req.params.id);
    const { title, description, status, userId } = req.body;

    if (
      !Number.isInteger(id) ||
      id < 1 ||
      typeof title !== "string" ||
      !title.trim() ||
      !Number.isInteger(userId) ||
      userId < 1 ||
      !["pending", "in_progress", "completed"].includes(status)
    ) {
      return res.status(400).json({
        message: "Invalid task data"
      });
    }

    const result = await pool.query(
      `UPDATE tasks
       SET title = $1,
           description = $2,
           status = $3,
           user_id = $4
       WHERE id = $5
       RETURNING
         id,
         title,
         description,
         status,
         user_id AS "userId",
         created_at AS "createdAt"`,
      [
        title.trim(),
        typeof description === "string" ? description.trim() || null : null,
        status,
        userId,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    const task = result.rows[0];
    const categories = await getCategories([id]);

    task.categories = categories.map(
      ({ task_id, ...category }) => category
    );

    res.json(task);
  } catch (error) {
    next(error);
  }
}

async function deleteTask(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({
        message: "Invalid task ID"
      });
    }

    const result = await pool.query(
      "DELETE FROM tasks WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

async function updateTaskCategories(req, res, next) {
  const id = Number(req.params.id);
  const { categoryIds } = req.body;

  if (
    !Number.isInteger(id) ||
    id < 1 ||
    !Array.isArray(categoryIds) ||
    !categoryIds.every(
      categoryId => Number.isInteger(categoryId) && categoryId > 0
    )
  ) {
    return res.status(400).json({
      message: "Invalid task or category IDs"
    });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const task = await client.query(
      "SELECT id FROM tasks WHERE id = $1",
      [id]
    );

    if (task.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        message: "Task not found"
      });
    }

    const uniqueIds = [...new Set(categoryIds)];

    if (uniqueIds.length > 0) {
      const categories = await client.query(
        "SELECT id FROM categories WHERE id = ANY($1::int[])",
        [uniqueIds]
      );

      if (categories.rows.length !== uniqueIds.length) {
        await client.query("ROLLBACK");

        return res.status(400).json({
          message: "Category not found"
        });
      }
    }

    await client.query(
      "DELETE FROM task_categories WHERE task_id = $1",
      [id]
    );

    for (const categoryId of uniqueIds) {
      await client.query(
        `INSERT INTO task_categories (task_id, category_id)
         VALUES ($1, $2)`,
        [id, categoryId]
      );
    }

    await client.query("COMMIT");

    const categories = await getCategories([id]);

    res.json({
      taskId: id,
      categories: categories.map(
        ({ task_id, ...category }) => category
      )
    });
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
