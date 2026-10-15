const pool = require("../db/pool");

async function getCategories(req, res, next) {
  try {
    const result = await pool.query(`
      SELECT
        c.id,
        c.title,
        c.description,
        COALESCE(
          json_agg(
            json_build_object(
              'id', t.id,
              'title', t.title,
              'status', t.status
            )
          ) FILTER (WHERE t.id IS NOT NULL),
          '[]'
        ) AS tasks
      FROM "Category" c
      LEFT JOIN "_CategoryToTask" tc ON tc."A" = c.id
      LEFT JOIN "Task" t ON t.id = tc."B"
      GROUP BY c.id
      ORDER BY c.id
    `);

    res.json(result.rows);
  } catch (error) {
    next(error);
  }
}

async function createCategory(req, res, next) {
  try {
    const title =
      typeof req.body.title === "string" ? req.body.title.trim() : "";
    const description =
      typeof req.body.description === "string"
        ? req.body.description.trim()
        : null;

    if (!title) {
      return res.status(400).json({
        message: "Category title is required"
      });
    }

    const result = await pool.query(
      `INSERT INTO "Category" (title, description)
       VALUES ($1, $2)
       RETURNING id, title, description`,
      [title, description || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
}

module.exports = { getCategories, createCategory };