const prisma = require("../lib/prisma");

async function getCategories(req, res, next) {
  try {
    const categories = await prisma.category.findMany({
      include: {
        tasks: true
      }
    });

    res.json(categories);
  } catch (error) {
    next(error);
  }
}

async function createCategory(req, res, next) {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({
        message: "Title is required"
      });
    }

    const category = await prisma.category.create({
      data: {
        title,
        description
      }
    });

    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCategories,
  createCategory
};