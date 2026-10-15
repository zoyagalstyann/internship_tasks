
const pool = require("../db/pool");

async function getCategories(req, res, next) {
  try {
    const result = await pool.query(
      "SELECT id, title, description FROM categories ORDER BY id"
    );

    res.json(result.rows);
  } catch (error) {
    next(error);
  }
}

async function createCategory(req, res, next) {
  try {
    const { title, description } = req.body;

    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        message: "Category title is required"
      });
    }

    const result = await pool.query(
      `INSERT INTO categories (title, description)
       VALUES ($1, $2)
       RETURNING id, title, description`,
      [
        title.trim(),
        typeof description === "string" ? description.trim() || null : null
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        message: "Category already exists"
      });
    }

    next(error);
  }
}

module.exports = {
  getCategories,
  createCategory
};
